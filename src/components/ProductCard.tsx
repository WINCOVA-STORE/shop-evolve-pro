import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Product } from "@/hooks/useProducts";

interface ProductCardProps extends Product {}

export const ProductCard = (product: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { id, name, price, compare_at_price, images, tags = [] } = product;
  
  const image = images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop";
  const hasDiscount = compare_at_price && compare_at_price > price;
  const isNew = tags.includes('new');
  const badge = hasDiscount ? 'sale' : isNew ? 'new' : undefined;

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <div
      className="group relative bg-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-border hover:-translate-y-1"
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
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Badge */}
        {badge && (
          <Badge
            className={cn(
              "absolute top-3 left-3 z-10",
              badge === "sale" && "bg-destructive text-destructive-foreground",
              badge === "new" && "bg-primary text-primary-foreground"
            )}
          >
            {badge === "sale" ? t('products.sale') : t('products.new')}
          </Badge>
        )}

        {/* Quick Actions */}
        <div
          className={cn(
            "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full shadow-lg"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 
          className="font-medium text-sm line-clamp-3 min-h-[60px] text-foreground hover:text-primary transition-colors cursor-pointer"
          onClick={() => navigate(`/product/${id}`)}
        >
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 min-h-[24px]">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(price)}
          </span>
          {compare_at_price && compare_at_price > price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(compare_at_price)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full group-hover:shadow-lg transition-all"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {t('products.add_to_cart')}
        </Button>
      </div>
    </div>
  );
};
