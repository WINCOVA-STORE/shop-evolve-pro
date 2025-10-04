import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useTranslation } from "react-i18next";
import { Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const { items, clearWishlist } = useWishlist();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <div>
              <h1 className="text-3xl font-bold">{t('wishlist.title')}</h1>
              <p className="text-muted-foreground">
                {items.length} {t('wishlist.items_count')}
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <Button variant="outline" onClick={clearWishlist}>
              {t('wishlist.clear_all')}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Heart className="h-24 w-24 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-semibold text-muted-foreground">
              {t('wishlist.empty')}
            </h2>
            <p className="text-muted-foreground">{t('wishlist.empty_description')}</p>
            <Button size="lg" onClick={() => navigate('/')} className="mt-4">
              <ShoppingBag className="h-5 w-5 mr-2" />
              {t('wishlist.start_shopping')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
