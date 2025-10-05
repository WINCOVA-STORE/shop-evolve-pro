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
      onClick={() => navigate(`/product/${product.id}`)}
      className="flex gap-2 p-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-all group"
    >
      <div className="relative w-14 h-14 flex-shrink-0 rounded overflow-hidden">
        <img
          src={primaryImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
        />
        {hasDiscount && (
          <Badge className="absolute top-0 right-0 text-[10px] bg-destructive text-destructive-foreground px-1 py-0">
            -{discount}%
          </Badge>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {name}
        </h4>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="font-bold text-xs">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
