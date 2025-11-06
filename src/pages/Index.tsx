import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { FeaturedSidebar } from "@/components/FeaturedSidebar";
import { ChangelogBanner } from "@/components/ChangelogBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useMainCategoriesWithProducts } from "@/hooks/useCategoriesWithProducts";
import { useReferral } from "@/hooks/useReferral";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Truck, Shield, Package, Gift, Star, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useCategoryTranslation } from "@/hooks/useTranslatedCategory";
import { useEnsureProductTranslations } from "@/hooks/useEnsureProductTranslations";

const Index = () => {
  const { data: products, isLoading } = useFeaturedProducts(8);
  const { data: categoriesWithProducts, isLoading: categoriesLoading } = useMainCategoriesWithProducts(6);
  const { t } = useTranslation();
  const { translateCategoryName } = useCategoryTranslation();
  const [email, setEmail] = useState("");
  
  // Genera traducciones faltantes en segundo plano para productos destacados
  useEnsureProductTranslations(products);

  // Capture referral code from URL
  useReferral();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success(t('newsletter.success'));
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-background to-muted text-foreground h-[60vh] md:h-[70vh] overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-background/75"></div>
        <div className="container mx-auto px-4 text-center space-y-6 relative z-10 animate-fade-in">
          <Badge variant="secondary" className="mb-4 animate-scale-in">
            {t('hero.new_products_badge')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold max-w-4xl mx-auto">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap pt-4">
            <Button size="lg" className="text-lg px-8 shadow-lg hover:shadow-xl transition-shadow">
              {t('hero.cta')}
            </Button>
            <Button size="lg" variant="ghost" className="text-lg px-8">
              {t('hero.see_offers')}
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="border-y bg-muted/50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2.5">
              <Truck className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">{t('benefits.free_shipping')}</h3>
                <p className="text-xs text-muted-foreground">{t('benefits.free_shipping_desc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Shield className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">{t('benefits.secure_purchase')}</h3>
                <p className="text-xs text-muted-foreground">{t('benefits.secure_purchase_desc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Package className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">{t('benefits.returns')}</h3>
                <p className="text-xs text-muted-foreground">{t('benefits.returns_desc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Gift className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">{t('benefits.rewards')}</h3>
                <p className="text-xs text-muted-foreground">{t('benefits.rewards_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Changelog Banner */}
      <section className="container mx-auto px-4 py-8">
        <ChangelogBanner />
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">{t('categories.title')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 max-w-6xl mx-auto">
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
                key={category.slug}
                name={translateCategoryName(category.slug, category.name)}
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

      {/* Featured Products with Sidebar */}
      <section className="container mx-auto px-4 py-12 bg-background">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('products.featured')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('products.featured_subtitle')}</p>
          </div>
          <Button variant="outline" className="hidden md:flex">{t('products.view_all')}</Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          {/* Products Grid - Responsive */}
          <div className="lg:col-span-9 order-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg" />
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
          </div>

          {/* Featured Sidebar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block lg:col-span-3 order-2">
            <FeaturedSidebar />
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('benefits.secure_purchase')}</h3>
              <p className="text-muted-foreground">{t('benefits.secure_purchase_desc')}</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('benefits.free_shipping')}</h3>
              <p className="text-muted-foreground">{t('benefits.free_shipping_desc')}</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('benefits.rewards')}</h3>
              <p className="text-muted-foreground">{t('benefits.rewards_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('testimonials.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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

      {/* Newsletter CTA */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Mail className="h-10 w-10 mx-auto" />
            <h2 className="text-2xl md:text-3xl font-bold">
              {t('newsletter.title')}
            </h2>
            <p className="text-base text-primary-foreground/90">
              {t('newsletter.description')}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t('newsletter.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-primary-foreground text-foreground"
              />
              <Button type="submit" variant="secondary" size="lg">
                {t('newsletter.cta')}
              </Button>
            </form>
            <p className="text-xs text-primary-foreground/70">
              {t('newsletter.privacy')}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
