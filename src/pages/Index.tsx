import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useMainCategoriesWithProducts } from "@/hooks/useCategoriesWithProducts";
import { useReferral } from "@/hooks/useReferral";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Truck, Shield, Package, Gift, Star, TrendingUp } from "lucide-react";

const Index = () => {
  const { data: products, isLoading } = useFeaturedProducts(8);
  const { data: categoriesWithProducts, isLoading: categoriesLoading } = useMainCategoriesWithProducts();
  const { t } = useTranslation();
  
  // Capture referral code from URL
  useReferral();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
          <Badge variant="secondary" className="mb-4">
            {t('hero.new_products_badge')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              {t('hero.cta')}
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
              {t('hero.see_offers')}
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Truck className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold">{t('benefits.free_shipping')}</h3>
                <p className="text-sm text-muted-foreground">{t('benefits.free_shipping_desc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold">{t('benefits.secure_purchase')}</h3>
                <p className="text-sm text-muted-foreground">{t('benefits.secure_purchase_desc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold">{t('benefits.returns')}</h3>
                <p className="text-sm text-muted-foreground">{t('benefits.returns_desc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gift className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold">{t('benefits.rewards')}</h3>
                <p className="text-sm text-muted-foreground">{t('benefits.rewards_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-foreground mb-8">{t('categories.title')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categoriesLoading ? (
            [...Array(12)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ))
          ) : categoriesWithProducts && categoriesWithProducts.length > 0 ? (
            categoriesWithProducts.map((category) => (
              <CategoryCard
                key={category.name}
                name={category.name}
                icon={category.icon}
                href={`/category/${category.slug}`}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-8">
              {t('categories.no_categories')}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">{t('products.featured')}</h2>
            <p className="text-muted-foreground mt-2">{t('products.featured_subtitle')}</p>
          </div>
          <Button variant="outline">{t('products.view_all')}</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-12">
              {t('products.no_products')}
            </div>
          )}
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="container mx-auto px-4 py-12">
        <Card className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10 p-12 md:p-16">
            <Badge variant="secondary" className="mb-4">
              {t('special_offer.badge')}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('special_offer.title')}
            </h2>
            <p className="text-xl mb-6 max-w-md">
              {t('special_offer.description')}
            </p>
            <Button size="lg" variant="secondary">
              {t('special_offer.cta')}
            </Button>
          </div>
        </Card>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">{t('testimonials.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: t('testimonials.customer_1'),
              rating: 5,
              comment: t('testimonials.testimonial_1'),
            },
            {
              name: t('testimonials.customer_2'),
              rating: 5,
              comment: t('testimonials.testimonial_2'),
            },
            {
              name: t('testimonials.customer_3'),
              rating: 5,
              comment: t('testimonials.testimonial_3'),
            },
          ].map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">"{testimonial.comment}"</p>
              <p className="font-semibold">{testimonial.name}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
