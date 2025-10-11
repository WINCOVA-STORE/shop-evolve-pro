import { ShoppingCart, Minus, Plus, X, Loader2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRewards } from "@/hooks/useRewards";
import { useShippingConfig } from "@/hooks/useShippingConfig";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { FreeShippingBadge } from "@/components/FreeShippingBadge";
import { useRewardsCalculation } from "@/hooks/useRewardsCalculation";
import { useTranslatedProduct } from "@/hooks/useTranslatedProduct";

const CartItemDisplay = ({ item }: { item: any }) => {
  const { name } = useTranslatedProduct(item);
  const { updateQuantity, removeFromCart } = useCart();
  const { formatPrice } = useCurrency();
  
  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <img
        src={item.images[0]}
        alt={name}
        className="w-20 h-20 object-cover rounded"
      />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm line-clamp-2">{name}</h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-2"
            onClick={() => removeFromCart(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 border rounded">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium w-8 text-center">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <p className="font-bold">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
};

export const CartSheet = () => {
  const { items, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { availablePoints } = useRewards();
  const { config: shippingConfig, calculateShipping } = useShippingConfig();
  const { 
    calculateEarningPoints, 
    getMaxUsablePoints, 
    pointsToDollars, 
    formatUsageDisplay,
    formatEarningDisplay,
    getEarningDescription,
    showPercentage,
    showConversion
  } = useRewardsCalculation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);

  const taxRate = 0.1; // 10% tax
  const taxAmount = cartTotal * taxRate;
  const shippingCost = calculateShipping(cartTotal);
  const subtotalWithShipping = cartTotal + taxAmount + shippingCost;
  
  // Calculate discount from points (1000 points = $1)
  const pointsDiscount = pointsToDollars(pointsToUse);
  const total = Math.max(0, subtotalWithShipping - pointsDiscount);
  
  // Calculate max usable points based on SUBTOTAL only (global standard)
  const maxUsablePoints = getMaxUsablePoints(cartTotal, availablePoints);
  
  // Calculate points that will be earned from this purchase (based on config)
  const pointsToEarn = calculateEarningPoints(cartTotal); // Basado en configuración dinámica

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    
    try {
      const cartItems = items.map((item) => ({
        product_name: item.name,
        product_description: item.description || '',
        product_price: item.price,
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { 
          cartItems, 
          total,
          pointsUsed: pointsToUse,
          pointsDiscount: pointsDiscount,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el proceso de pago. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-secondary-foreground hover:bg-secondary/80 relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t('cart.title')}</SheetTitle>
          <SheetDescription>
            {cartCount > 0 ? `${cartCount} ${cartCount === 1 ? 'item' : 'items'}` : t('cart.empty')}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ShoppingCart className="h-16 w-16 mb-4 opacity-50" />
            <p>{t('cart.empty')}</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 my-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemDisplay key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('cart.tax')} (10%)</span>
                  <span className="font-medium">{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('cart.shipping')}</span>
                  {shippingCost === 0 && shippingConfig?.show_free_badge ? (
                    <FreeShippingBadge />
                  ) : (
                    <span className="font-medium">{formatPrice(shippingCost)}</span>
                  )}
                </div>
              </div>

              {user && availablePoints > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-medium">Usar Puntos</Label>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Disponible: {availablePoints.toLocaleString()} pts
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        max={maxUsablePoints}
                        value={pointsToUse}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setPointsToUse(Math.min(value, maxUsablePoints));
                        }}
                        placeholder="0"
                        className="h-9"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatUsageDisplay(maxUsablePoints)}</span>
                        {pointsToUse > 0 && (
                          <span className="text-primary font-medium">
                            -${pointsDiscount.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8"
                        onClick={() => setPointsToUse(maxUsablePoints)}
                      >
                        Usar Máximo
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <Separator />
              
              <div className="space-y-3">
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Descuento por puntos</span>
                    <span className="font-medium">-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('cart.total')}</span>
                  <span>{formatPrice(total)}</span>
                </div>
                
                {/* Points to earn with this purchase */}
                {user && pointsToEarn > 0 && (
                  <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-primary" />
                        <div>
                          <span className="text-sm font-medium text-primary block">Ganarás con esta compra</span>
                          {(showPercentage || showConversion) && (
                            <span className="text-xs text-primary/70">
                              {typeof getEarningDescription === 'function' ? getEarningDescription() : 'Puntos de recompensa'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatEarningDisplay(pointsToEarn)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <SheetFooter className="mt-6">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  t('cart.checkout')
                )}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
