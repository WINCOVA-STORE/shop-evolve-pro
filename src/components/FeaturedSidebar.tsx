import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslatedProduct } from "@/hooks/useTranslatedProduct";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

export const FeaturedSidebar = () => {
  const { data: products, isLoading } = useFeaturedProducts(6);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  if (isLoading) {
    return (
      <aside className="hidden lg:block lg:col-span-3 space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">{t('sidebar.featured')}</h3>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-20 h-20 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-4 self-start">
      <Card className="p-4 border-2">
        <h3 className="font-bold text-lg mb-4 text-primary">{t('sidebar.featured')}</h3>
        <div className="space-y-3">
          {products?.slice(0, 6).map((product) => {
            const { name } = useTranslatedProduct(product);
            const primaryImage = product.images?.[0] || '/placeholder.svg';
            const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
            const discount = hasDiscount
              ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
              : 0;

            return (
              <div
                key={product.id}
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
          })}
        </div>
      </Card>

      {/* Special Offer Banner */}
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="mb-2">
            {t('sidebar.special_offer')}
          </Badge>
          <p className="font-bold text-lg">{t('sidebar.discount_banner')}</p>
          <p className="text-sm text-muted-foreground">{t('sidebar.limited_time')}</p>
        </div>
      </Card>
    </aside>
  );
};
