import { ShoppingCart, Minus, Plus, X, Gift, Heart, TrendingUp, Package, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerDescription } from "@/components/ui/drawer";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useRewards } from "@/hooks/useRewards";
import { useShippingConfig } from "@/hooks/useShippingConfig";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { FreeShippingBadge } from "@/components/FreeShippingBadge";
import { useRewardsCalculation } from "@/hooks/useRewardsCalculation";
import { useTranslatedProduct } from "@/hooks/useTranslatedProduct";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CartSuggestionsPanel } from "./CartSuggestionsPanel";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CartItemProps {
  item: any;
}

const WincovaCartItem = ({ item }: CartItemProps) => {
  const { name } = useTranslatedProduct(item);
  const { updateQuantity, removeFromCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [showRemoveAnimation, setShowRemoveAnimation] = useState(false);
  const [showWishlistAnimation, setShowWishlistAnimation] = useState(false);
  
  const handleMoveToWishlist = () => {
    setShowWishlistAnimation(true);
    setTimeout(() => {
      addToWishlist(item);
      removeFromCart(item.id);
    }, 300);
  };

  const handleRemove = () => {
    setShowRemoveAnimation(true);
    setTimeout(() => removeFromCart(item.id), 300);
  };

  const stockLevel = item.stock <= 5 ? 'low' : item.stock <= 10 ? 'medium' : 'high';
  const inWishlist = isInWishlist(item.id);
  
  return (
    <div className={cn(
      "group relative flex gap-3 p-3 border rounded-lg bg-card transition-all duration-300 hover:shadow-md hover:scale-[1.01]",
      showRemoveAnimation && "animate-scale-out opacity-0",
      showWishlistAnimation && "animate-slide-out-right"
    )}>
      {/* Stock badge */}
      {stockLevel === 'low' && (
        <Badge variant="destructive" className="absolute top-2 right-2 text-xs animate-pulse">
          <AlertCircle className="h-3 w-3 mr-1" />
          Solo {item.stock}
        </Badge>
      )}

      <img
        src={item.images[0]}
        alt={name}
        className="w-20 h-20 object-cover rounded border border-border"
      />
      
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-medium text-sm line-clamp-2 flex-1">{name}</h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Quantity controls */}
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-medium w-8 text-center">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Move to wishlist */}
            {!inWishlist && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                onClick={handleMoveToWishlist}
              >
                <Heart className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <p className="font-bold text-sm">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        {/* Stock indicator */}
        {stockLevel !== 'high' && (
          <div className="space-y-1">
            <Progress 
              value={(item.stock / 10) * 100} 
              className={cn(
                "h-1",
                stockLevel === 'low' && "bg-destructive/20",
                stockLevel === 'medium' && "bg-yellow-500/20"
              )}
            />
            <p className={cn(
              "text-xs",
              stockLevel === 'low' && "text-destructive",
              stockLevel === 'medium' && "text-yellow-600"
            )}>
              {stockLevel === 'low' ? '¡Últimas unidades!' : 'Stock limitado'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const WincovaCartDrawer = () => {
  const { items, cartTotal, cartCount } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { availablePoints } = useRewards();
  const { config: shippingConfig, calculateShipping } = useShippingConfig();
  const navigate = useNavigate();
  
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
  
  const [pointsToUse, setPointsToUse] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Reset points when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setPointsToUse(0);
    }
  }, [isOpen]);

  const taxRate = 0.1;
  const taxAmount = cartTotal * taxRate;
  const shippingCost = calculateShipping(cartTotal);
  const subtotalWithShipping = cartTotal + taxAmount + shippingCost;
  
  const pointsDiscount = pointsToDollars(pointsToUse);
  const total = Math.max(0, subtotalWithShipping - pointsDiscount);
  
  const maxUsablePoints = getMaxUsablePoints(cartTotal, availablePoints);
  const pointsToEarn = calculateEarningPoints(cartTotal);

  // Calculate savings
  const totalSavings = items.reduce((sum, item) => {
    if (item.compare_at_price) {
      return sum + ((item.compare_at_price - item.price) * item.quantity);
    }
    return sum;
  }, 0) + pointsDiscount;

  const handleCheckout = () => {
    setShowSuccessAnimation(true);
    setTimeout(() => {
      const params = new URLSearchParams({
        pointsUsed: pointsToUse.toString(),
        pointsDiscount: pointsDiscount.toString(),
      });
      navigate(`/checkout?${params.toString()}`);
      setIsOpen(false);
      setShowSuccessAnimation(false);
    }, 500);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-secondary-foreground hover:bg-secondary/80 relative group"
        >
          <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-scale-in shadow-lg">
              {cartCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[95vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-2xl font-bold">Tu Carrito</DrawerTitle>
              <DrawerDescription>
                {cartCount > 0 ? (
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {cartCount} {cartCount === 1 ? 'producto' : 'productos'}
                  </span>
                ) : (
                  'Tu carrito está vacío'
                )}
              </DrawerDescription>
            </div>
            
            {/* Trust badges */}
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-700 border-green-500/20">
                <ShieldCheck className="h-3 w-3" />
                Compra Protegida
              </Badge>
              <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-700 border-blue-500/20">
                <Package className="h-3 w-3" />
                Envío Rápido
              </Badge>
            </div>
          </div>
        </DrawerHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <div className="relative">
              <ShoppingCart className="h-24 w-24 opacity-20" />
              <Sparkles className="h-8 w-8 absolute -top-2 -right-2 text-primary animate-pulse" />
            </div>
            <p className="mt-4 text-lg font-medium">Tu carrito está vacío</p>
            <p className="text-sm mt-2">¡Descubre productos increíbles!</p>
            <Button 
              className="mt-6" 
              onClick={() => {
                setIsOpen(false);
                navigate('/');
              }}
            >
              Explorar Productos
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 py-4">
                {/* Cart Items */}
                {items.map((item) => (
                  <WincovaCartItem key={item.id} item={item} />
                ))}

                {/* AI Suggestions Panel */}
                <CartSuggestionsPanel cartItems={items} />
              </div>
            </ScrollArea>

            {/* Sticky Summary Footer */}
            <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="p-4 space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA (10%)</span>
                    <span className="font-medium">{formatPrice(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Envío</span>
                    {shippingCost === 0 && shippingConfig?.show_free_badge ? (
                      <FreeShippingBadge />
                    ) : (
                      <span className="font-medium">{formatPrice(shippingCost)}</span>
                    )}
                  </div>
                </div>

                {/* Rewards Points Usage */}
                {user && availablePoints > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-primary animate-pulse" />
                          <Label className="text-sm font-medium">Usar Puntos de Recompensa</Label>
                        </div>
                        <Badge variant="secondary" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {availablePoints.toLocaleString()} pts
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex gap-2">
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
                            className="h-9 flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 whitespace-nowrap"
                            onClick={() => setPointsToUse(maxUsablePoints)}
                          >
                            Usar Máximo
                          </Button>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatUsageDisplay(maxUsablePoints)}</span>
                          {pointsToUse > 0 && (
                            <span className="text-primary font-medium animate-fade-in">
                              Ahorras: {formatPrice(pointsDiscount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />
                
                {/* Total and Savings */}
                <div className="space-y-3">
                  {totalSavings > 0 && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-500/10 border border-green-500/20 animate-fade-in">
                      <span className="text-sm font-medium text-green-700">🎉 Total Ahorrado</span>
                      <span className="text-sm font-bold text-green-700">{formatPrice(totalSavings)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total a Pagar</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                  </div>
                  
                  {/* Points to earn */}
                  {user && pointsToEarn > 0 && (
                    <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                          <div>
                            <span className="text-sm font-medium text-primary block">Ganarás con esta compra</span>
                            {(showPercentage || showConversion) && (
                              <span className="text-xs text-primary/70">
                                {typeof getEarningDescription === 'function' ? getEarningDescription() : 'Puntos de recompensa'}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          {formatEarningDisplay(pointsToEarn)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout Button */}
              <DrawerFooter className="pt-2">
                <Button 
                  className={cn(
                    "w-full h-12 text-base font-semibold relative overflow-hidden group",
                    showSuccessAnimation && "animate-scale-in"
                  )}
                  size="lg"
                  onClick={handleCheckout}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {showSuccessAnimation ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 animate-scale-in" />
                        ¡Procesando!
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5" />
                        Proceder al Checkout Seguro
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Button>
                
                <p className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Compra 100% segura • Devolución gratis en 30 días
                </p>
              </DrawerFooter>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};
