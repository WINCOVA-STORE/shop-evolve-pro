import { ShoppingCart, Minus, Plus, X } from "lucide-react";
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

export const CartSheet = () => {
  const { items, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();

  const taxRate = 0.0975; // Tennessee state tax (9.75%)
  const taxAmount = cartTotal * taxRate;
  const shippingCost = cartTotal > 50 ? 0 : 8.99;
  const total = cartTotal + taxAmount + shippingCost;

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
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
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
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                <span className="font-medium">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.tax')} (9.75%)</span>
                <span className="font-medium">{formatPrice(taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.shipping')}</span>
                <span className="font-medium">
                  {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>{t('cart.total')}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <SheetFooter className="mt-6">
              <Button className="w-full" size="lg">
                {t('cart.checkout')}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
