import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { FeaturedSidebarProduct } from "./FeaturedSidebarProduct";
import { SponsoredAds } from "./SponsoredAds";
import { Separator } from "@/components/ui/separator";

export const FeaturedSidebar = () => {
  const { data: products, isLoading } = useFeaturedProducts(4);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <aside className="hidden lg:block lg:col-span-3 space-y-4">
        <Card className="p-3">
          <h3 className="font-semibold text-sm mb-3">{t('sidebar.featured')}</h3>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="w-16 h-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-full" />
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
    <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-4 self-start max-w-[280px]">
      {/* Featured Products - Compact */}
      <Card className="p-3 border-2">
        <h3 className="font-bold text-sm mb-3 text-primary">{t('sidebar.featured')}</h3>
        <div className="space-y-2">
          {products?.slice(0, 4).map((product) => (
            <FeaturedSidebarProduct key={product.id} product={product} />
          ))}
        </div>
      </Card>

      <Separator />

      {/* Sponsored Ads Section */}
      <SponsoredAds />
    </aside>
  );
};
