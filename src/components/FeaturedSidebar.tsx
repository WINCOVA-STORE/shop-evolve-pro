import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { FeaturedSidebarProduct } from "./FeaturedSidebarProduct";

export const FeaturedSidebar = () => {
  const { data: products, isLoading } = useFeaturedProducts(6);
  const { t } = useTranslation();

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
          {products?.slice(0, 6).map((product) => (
            <FeaturedSidebarProduct key={product.id} product={product} />
          ))}
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
