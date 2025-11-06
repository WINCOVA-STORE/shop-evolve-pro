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
      className="flex gap-1.5 p-1 rounded hover:bg-muted/50 cursor-pointer transition-all group"
    >
      <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-muted">
        <img
          src={primaryImage}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {hasDiscount && (
          <Badge className="absolute top-0 right-0 text-[9px] bg-destructive text-destructive-foreground px-1 py-0 leading-none">
            -{discount}%
          </Badge>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="text-[11px] font-medium line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-0.5">
          {name}
        </h4>
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-xs">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-[9px] text-muted-foreground line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
