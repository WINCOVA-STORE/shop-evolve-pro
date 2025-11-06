import { Heart, ShoppingCart, Gift, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Product } from "@/hooks/useProducts";
import { useTranslatedProduct } from "@/hooks/useTranslatedProduct";
import { useRewardsCalculation } from "@/hooks/useRewardsCalculation";

interface ProductCardProps extends Product {}

export const ProductCard = (product: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { name } = useTranslatedProduct(product);
  const { calculateEarningPoints, formatEarningDisplay, showPercentage, showConversion } = useRewardsCalculation();
  
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const { id, price, compare_at_price, images, tags = [] } = product;
  
  const image = images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop";
  const hasDiscount = compare_at_price && compare_at_price > price;
  const isNew = tags.includes('new');
  const badge = hasDiscount ? 'sale' : isNew ? 'new' : undefined;
  
  // Calculate points to earn based on dynamic rewards config
  const pointsToEarn = calculateEarningPoints(price);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCompare(product);
  };

  return (
    <div
      className="group relative bg-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border border-border/50 hover:-translate-y-1 hover:border-primary/40 hover:shadow-primary/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div 
        className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
        onClick={() => navigate(`/product/${id}`)}
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        
        {/* Badge */}
        {badge && (
          <Badge
            className={cn(
              "absolute top-2 left-2 z-10 font-semibold text-xs",
              badge === "sale" && "bg-destructive text-destructive-foreground shadow-lg",
              badge === "new" && "bg-primary text-primary-foreground shadow-lg"
            )}
          >
            {badge === "sale" ? t('products.sale') : t('products.new')}
          </Badge>
        )}

        {/* Quick Actions - always visible on mobile, hover on desktop */}
        <div
          className={cn(
            "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-500 opacity-100 md:opacity-0 md:translate-x-4",
            isHovered && "md:opacity-100 md:translate-x-0"
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "h-10 w-10 rounded-full shadow-xl backdrop-blur-sm bg-background/90 hover:bg-background hover:scale-110 transition-all duration-300",
              inWishlist && "text-red-500 bg-red-50"
            )}
            onClick={handleWishlistToggle}
            title={inWishlist ? t("wishlist.remove") : t("wishlist.add")}
          >
            <Heart className={cn("h-4 w-4 transition-all", inWishlist && "fill-current scale-110")} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "h-10 w-10 rounded-full shadow-xl backdrop-blur-sm bg-background/90 hover:bg-background hover:scale-110 transition-all duration-300",
              inCompare && "text-primary bg-primary/10"
            )}
            onClick={handleCompareToggle}
            title={t("compare.add")}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2.5">
        {/* Title */}
        <h3 
          className="font-medium text-sm line-clamp-2 min-h-[40px] text-foreground hover:text-primary transition-colors cursor-pointer leading-tight"
          onClick={() => navigate(`/product/${id}`)}
        >
          {name}
        </h3>

        {/* Price */}
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2 min-h-[28px]">
            <span className="text-xl font-bold text-destructive">
              {formatPrice(price)}
            </span>
            {compare_at_price && compare_at_price > price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(compare_at_price)}
              </span>
            )}
          </div>
          
          {/* Points Badge - only show if percentage or conversion should be visible */}
          {(showPercentage || showConversion || pointsToEarn > 0) && (
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              <Gift className="h-3 w-3" />
              <span>{formatEarningDisplay(pointsToEarn)}</span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full group-hover:shadow-lg transition-all duration-300 font-semibold"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {t('products.add_to_cart')}
        </Button>
      </div>
    </div>
  );
};
