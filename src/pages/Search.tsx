import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { FeaturedSidebar } from "@/components/FeaturedSidebar";
import { StickyFilters } from "@/components/StickyFilters";
import { SponsoredProduct } from "@/components/SponsoredProduct";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/hooks/useProducts";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      let dbQuery = supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      // Search in name, description, and tags
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);

      // Apply sorting
      switch (sortBy) {
        case "price-asc":
          dbQuery = dbQuery.order("price", { ascending: true });
          break;
        case "price-desc":
          dbQuery = dbQuery.order("price", { ascending: false });
          break;
        case "newest":
          dbQuery = dbQuery.order("created_at", { ascending: false });
          break;
        default:
          dbQuery = dbQuery.order("created_at", { ascending: false });
      }

      const { data, error } = await dbQuery;

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error searching products:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los resultados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
    setProducts([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button type="submit">
              <SearchIcon className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </form>
        </div>

        {searchParams.get("q") && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                Resultados para "{searchParams.get("q")}"
              </h1>
              <p className="text-muted-foreground">
                {loading ? "Buscando..." : `${products.length} ${products.length === 1 ? 'producto encontrado' : 'productos encontrados'}`}
              </p>
            </div>

            <StickyFilters sortBy={sortBy} onSortChange={setSortBy} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20 lg:pb-0">
              {/* Products Grid - Amazon-level responsive */}
              <div className="lg:col-span-9 order-1">
                {loading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <SearchIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold mb-2">No se encontraron resultados</h2>
                    <p className="text-muted-foreground mb-6">
                      Intenta con otros términos de búsqueda
                    </p>
                    <Button onClick={() => navigate("/")}>
                      Explorar todos los productos
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
                            title="Productos Recomendados"
                            description="Basado en tu búsqueda, te sugerimos estos productos destacados"
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
          </>
        )}

        {!searchParams.get("q") && (
          <div className="text-center py-16">
            <SearchIcon className="h-20 w-20 mx-auto mb-6 opacity-50" />
            <h1 className="text-3xl font-bold mb-4">Buscar Productos</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Encuentra exactamente lo que estás buscando. Usa palabras clave, marcas o categorías.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" onClick={() => setSearchQuery("electronics")}>
                Electrónica
              </Button>
              <Button variant="outline" onClick={() => setSearchQuery("ropa")}>
                Ropa
              </Button>
              <Button variant="outline" onClick={() => setSearchQuery("hogar")}>
                Hogar
              </Button>
              <Button variant="outline" onClick={() => setSearchQuery("deportes")}>
                Deportes
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Search;
