import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslatedProduct } from "@/hooks/useTranslatedProduct";
import { Product } from "@/hooks/useProducts";
import { Star } from "lucide-react";

interface FeaturedSidebarProductProps {
  product: Product;
}

export const FeaturedSidebarProduct = ({ product }: FeaturedSidebarProductProps) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { name } = useTranslatedProduct(product);
  
  const primaryImage = product.images?.[0] || '/placeholder.svg';
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discount = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  return (
    <div
      className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative w-20 h-20 flex-shrink-0">
        <img
          src={primaryImage}
          alt={name}
          className="w-full h-full object-cover rounded border group-hover:scale-105 transition-transform"
        />
        {hasDiscount && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1 py-0">
            -{discount}%
          </Badge>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="text-xs text-muted-foreground">4.5</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
