import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompare } from "@/contexts/CompareContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslation } from "react-i18next";
import { useTranslatedProduct } from "@/hooks/useTranslatedProduct";
import { BarChart3, ShoppingCart, X, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Compare = () => {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{t('compare.title')}</h1>
              <p className="text-muted-foreground">
                {items.length} {t('compare.items_count')}
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <Button variant="outline" onClick={clearCompare}>
              {t('compare.clear_all')}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <BarChart3 className="h-24 w-24 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-semibold text-muted-foreground">
              {t('compare.empty')}
            </h2>
            <p className="text-muted-foreground">{t('compare.empty_description')}</p>
            <Button size="lg" onClick={() => navigate('/')}>
              {t('compare.start_shopping')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-flex gap-4 pb-4 min-w-full">
              {items.map((product) => {
                const { name, description } = useTranslatedProduct(product);
                const primaryImage = product.images?.[0] || '/placeholder.svg';
                const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

                return (
                  <Card key={product.id} className="flex-shrink-0 w-80 p-6 relative">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => removeFromCompare(product.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <div
                      className="aspect-square w-full mb-4 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <img
                        src={primaryImage}
                        alt={name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>

                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{name}</h3>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <span className="text-sm text-muted-foreground">{t('compare.price')}:</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.compare_at_price!)}
                            </span>
                          )}
                        </div>
                      </div>

                      {hasDiscount && (
                        <div>
                          <Badge variant="destructive">
                            {t('products.save')}{' '}
                            {Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)}%
                          </Badge>
                        </div>
                      )}

                      <div>
                        <span className="text-sm text-muted-foreground">{t('compare.stock')}:</span>
                        <p className="font-medium">
                          {product.stock > 0 ? `${product.stock} ${t('compare.available')}` : t('compare.out_of_stock')}
                        </p>
                      </div>

                      <div>
                        <span className="text-sm text-muted-foreground">{t('compare.rating')}:</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                          <span className="text-sm ml-1">(4.5)</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-muted-foreground">{t('compare.rewards')}:</span>
                        <p className="font-medium text-primary">
                          +{Math.round(product.price * (product.reward_percentage / 100))} {t('compare.points')}
                        </p>
                      </div>

                      {description && (
                        <div>
                          <span className="text-sm text-muted-foreground">{t('compare.description')}:</span>
                          <p className="text-sm line-clamp-3 mt-1">{description}</p>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t('products.add_to_cart')}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Compare;
