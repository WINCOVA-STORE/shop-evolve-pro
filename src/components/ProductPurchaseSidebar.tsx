import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Share2, Minus, Plus, Truck, MapPin, Check, Copy, GitCompare, Package } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { useRewardsCalculation } from "@/hooks/useRewardsCalculation";
import { toast as sonnerToast } from "sonner";

interface ProductPurchaseSidebarProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  translatedName: string;
  translatedDescription: string | null;
}

export const ProductPurchaseSidebar = ({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  translatedName,
  translatedDescription,
}: ProductPurchaseSidebarProps) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();
  const [copied, setCopied] = useState(false);
  
  const { 
    calculateEarningPoints, 
    formatEarningDisplay, 
    getEarningDescription,
    showPercentage,
    showConversion
  } = useRewardsCalculation();

  const discount = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;
  
  const pointsToEarn = calculateEarningPoints(product.price * quantity);

  const handleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCompare = () => {
    addToCompare(product);
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: translatedName,
          text: translatedDescription || translatedName,
          url: url,
        });
        sonnerToast.success(t('products.shared_success'));
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          handleCopyLink(url);
        }
      }
    } else {
      handleCopyLink(url);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    sonnerToast.success(t('products.link_copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 space-y-5 lg:sticky lg:top-4 lg:self-start border-2">
      {/* Price Section */}
      <div>
        <div className="flex items-baseline gap-3 mb-2">
          {discount > 0 && (
            <Badge variant="destructive" className="text-sm font-bold px-2 py-1">
              -{discount}%
            </Badge>
          )}
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
          {product.compare_at_price && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
        {product.compare_at_price && (
          <p className="text-xs text-muted-foreground mt-1">
            {t('products.recommended_price', { defaultValue: 'Precio recomendado' })}: {formatPrice(product.compare_at_price)}
          </p>
        )}
      </div>

      {/* Shipping Info */}
      <div className="space-y-2 py-4 border-y">
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">{t('product_detail.free_shipping')}</p>
            <p className="text-xs text-muted-foreground">{t('product_detail.free_shipping_desc')}</p>
            <p className="text-xs font-medium text-primary mt-1">
              {t('products.delivery_date', { defaultValue: 'Entrega GRATIS el martes, 11 de noviembre' })}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-primary font-medium">
            {t('products.delivery_location', { defaultValue: 'Entrega en tu ubicación' })}
          </p>
        </div>
      </div>

      {/* Stock Status */}
      <div>
        {product.stock > 0 ? (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-600 text-white">
              {t('products.in_stock', { defaultValue: 'Disponible' })}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {product.stock} {t('products.units_available', { defaultValue: 'unidades' })}
            </span>
          </div>
        ) : (
          <Badge variant="destructive">{t('products.out_of_stock', { defaultValue: 'Agotado' })}</Badge>
        )}
      </div>

      {/* Quantity Selector */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          {t('products.quantity', { defaultValue: 'Cantidad' })}:
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="w-16 h-9 flex items-center justify-center border rounded-md font-semibold bg-background">
            {quantity}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onQuantityChange(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add to Cart Buttons */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-semibold shadow-md hover:shadow-lg transition-all"
          onClick={onAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {t('products.add_to_cart', { defaultValue: 'Agregar al Carrito' })}
        </Button>
        <Button
          size="lg"
          className="w-full bg-[#FFA724] hover:bg-[#FA8900] text-gray-900 font-semibold shadow-md hover:shadow-lg transition-all"
          disabled={product.stock === 0}
        >
          {t('products.buy_now', { defaultValue: 'Comprar ahora' })}
        </Button>
      </div>

      {/* Rewards Points */}
      {(showPercentage || showConversion || pointsToEarn > 0) && (
        <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-medium">
                  {t('products.earn_points', { defaultValue: 'Ganas con esta compra' })}
                </p>
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

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t">
        <Button 
          size="sm"
          variant={isInWishlist(product.id) ? "default" : "outline"}
          onClick={handleWishlist}
          className="flex-1 hover:scale-105 transition-transform"
        >
          <Heart className={`h-4 w-4 mr-1 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          <span className="text-xs">{t('products.wishlist', { defaultValue: 'Favoritos' })}</span>
        </Button>
        <Button 
          size="sm"
          variant={isInCompare(product.id) ? "default" : "outline"}
          onClick={handleCompare}
          className="flex-1 hover:scale-105 transition-transform"
        >
          <GitCompare className="h-4 w-4 mr-1" />
          <span className="text-xs">{t('products.compare', { defaultValue: 'Comparar' })}</span>
        </Button>
        <Button 
          size="sm"
          variant="outline"
          onClick={handleShare}
          className="hover:scale-105 transition-transform"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Seller Info */}
      <div className="text-xs text-muted-foreground space-y-1 pt-3 border-t">
        <p><span className="font-medium">{t('products.sold_by', { defaultValue: 'Vendido por' })}:</span> WinCova</p>
        <p><span className="font-medium">{t('products.returns', { defaultValue: 'Devoluciones' })}:</span> {t('products.returns_desc', { defaultValue: 'Reembolzo GRATUITO hasta el 31 de enero' })}</p>
      </div>
    </Card>
  );
};
