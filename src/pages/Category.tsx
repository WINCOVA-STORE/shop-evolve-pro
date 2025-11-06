import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { FeaturedSidebar } from "@/components/FeaturedSidebar";
import { StickyFilters } from "@/components/StickyFilters";
import { SponsoredProduct } from "@/components/SponsoredProduct";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/hooks/useProducts";
import { categories as staticCategories } from "@/data/categories";
import { useCategoryTranslation } from "@/hooks/useTranslatedCategory";
import { useEnsureProductTranslations } from "@/hooks/useEnsureProductTranslations";
import { getMockProductsByCategory, MOCK_PRODUCTS } from "@/data/mockData";
 
interface CategoryInfo {
  id: string;
  name: string;
  description: string;
}

const Category = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { translateCategoryName } = useCategoryTranslation();
  const { toast } = useToast();
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");

  // Ensure missing translations are generated for current language (non-bloqueante)
  useEnsureProductTranslations(products);

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug, sortBy]);

  const fetchCategoryAndProducts = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find the category from our static list using the slug
      const cat = staticCategories.find(c => c.slug === slug);
      const displayName = cat ? translateCategoryName(cat.slug, cat.name) : (slug || "");

      // Get all mock products
      let data = [...MOCK_PRODUCTS];

      // Apply sorting
      switch (sortBy) {
        case "price-asc":
          data.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          data.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        default:
          data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      setCategory({
        id: slug || "",
        name: displayName || "",
        description: t('products.discover_category', { category: (displayName || '').toLowerCase() }),
      });
      setProducts(data.slice(0, 20) as Product[]);
    } catch (error) {
      console.error("Error fetching category:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('products.back')}
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{category?.name}</h1>
          <p className="text-muted-foreground">{category?.description}</p>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {products.length === 1 ? t('products.products_count', { count: products.length }) : t('products.products_count_plural', { count: products.length })}
        </p>

        <StickyFilters sortBy={sortBy} onSortChange={setSortBy} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20 lg:pb-0">
          {/* Products Grid - Amazon-level responsive */}
          <div className="lg:col-span-9 order-1">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">{t('products.no_products_category')}</p>
                <Button onClick={() => navigate("/")}>
                  {t('products.back_to_store')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product, index) => (
                  <>
                    <ProductCard key={product.id} {...product} />
                    {/* Sponsored Product every 6 items */}
                    {(index + 1) % 6 === 0 && index < products.length - 1 && (
                      <SponsoredProduct
                        key={`sponsored-${index}`}
                        title="Oferta Especial del Día"
                        description="Descubre productos exclusivos con descuentos especiales"
                        image="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400"
                        link="/featured"
                      />
                    )}
                  </>
                ))}
              </div>
            )}
          </div>

          {/* Featured Sidebar - Mobile: al final, Desktop: lateral */}
          <div className="order-2 lg:col-span-3">
            <FeaturedSidebar />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Category;
