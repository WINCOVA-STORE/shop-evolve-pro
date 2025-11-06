import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Star } from "lucide-react";
import { ProductReviews } from "@/components/ProductReviews";
import { Product } from "@/hooks/useProducts";
import { useTranslatedProduct } from "@/hooks/useTranslatedProduct";
import { ProductImageZoom } from "@/components/ProductImageZoom";
import { ProductPurchaseSidebar } from "@/components/ProductPurchaseSidebar";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const attemptedTranslateRef = useRef(false);
  const { name: translatedName, description: translatedDescription } = useTranslatedProduct(product);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, i18n.language]);

  // Ensure translations exist for current language
  useEffect(() => {
    if (!product) return;
    const baseLang = (i18n.language || 'en').toLowerCase().split(/[-_]/)[0];
    const supported = ['es','fr','pt','zh'];
    if (!supported.includes(baseLang)) return;

    const nameKey = `name_${baseLang}`;
    const descKey = `description_${baseLang}`;
    const hasTranslation = Boolean((product as any)[nameKey]) && Boolean((product as any)[descKey]);
    if (hasTranslation || attemptedTranslateRef.current) return;

    attemptedTranslateRef.current = true;
    supabase.functions.invoke('auto-translate-content', {
      body: {
        table_name: 'products',
        record_id: product.id,
        source_text_name: product.name,
        source_text_description: product.description || ''
      }
    }).then(({ data, error }) => {
      if (error) {
        console.error('Auto-translate invoke error:', error);
        return;
      }
      if (data?.translations) {
        setProduct(prev => prev ? { ...prev, ...data.translations } as Product : prev);
      }
    }).catch((e) => console.error('Invoke failed:', e));
  }, [product?.id, i18n.language]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: t('products.product_not_found'),
          description: t('products.product_not_found_desc'),
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: t('products.error_loading'),
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Add to cart first
    addToCart(product, quantity);
    
    // Navigate to checkout page
    window.location.href = '/checkout?pointsUsed=0&pointsDiscount=0';
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, quantity);

    toast({
      title: t('products.added_to_cart'),
      description: t('products.units_of', { 
        quantity, 
        unit: quantity === 1 ? t('products.unit') : t('products.units'),
        product: translatedName 
      }),
    });
  };

  const discount = product?.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
        {location.state?.fromOrder ? (
          <Button
            variant="ghost"
            className="mb-6 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:scale-105 transition-all"
            onClick={() => navigate(`/order/${location.state.fromOrder}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('products.back_to_order')}
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('products.back')}
          </Button>
        )}

        <div className="grid lg:grid-cols-[550px_1fr_380px] gap-8 mb-12 max-w-[1800px] mx-auto">
          {/* Left: Images Section with Amazon-style zoom */}
          <div className="lg:col-span-1">
            <ProductImageZoom
              images={product.images}
              alt={translatedName}
              discount={discount}
              stock={product.stock}
            />
          </div>

          {/* Center: Product Info */}
          <div className="space-y-6 lg:col-span-1">
            <div>
              <h1 className="text-3xl font-bold mb-2">{translatedName}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? 'fill-primary text-primary' : 'text-muted'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.0) · 128 reseñas</span>
              </div>
            </div>

            <Separator />

            {/* Acerca de este artículo - Amazon Style */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">{t('products.about_item', { defaultValue: 'Acerca de este artículo' })}</h3>
              {translatedDescription ? (
                <ul className="space-y-2 list-none">
                  {translatedDescription.split(/[.!?]\s+/).filter(sentence => sentence.trim().length > 20).slice(0, 5).map((sentence, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="text-primary mt-1 text-lg">•</span>
                      <span className="text-foreground/80 leading-relaxed">{sentence.trim()}.</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">{t('products.no_description', { defaultValue: 'Sin descripción' })}</p>
              )}
            </div>

            <Separator />

            {/* Detalles del producto */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold">{t('products.product_details', { defaultValue: 'Detalles del producto' })}</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {product.sku && (
                  <div className="flex items-start py-2 border-b border-border/50">
                    <span className="font-medium text-foreground/70 min-w-[140px]">SKU:</span>
                    <span className="text-foreground">{product.sku}</span>
                  </div>
                )}
                <div className="flex items-start py-2 border-b border-border/50">
                  <span className="font-medium text-foreground/70 min-w-[140px]">{t('products.availability', { defaultValue: 'Disponibilidad' })}:</span>
                  <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} ${t('products.in_stock', { defaultValue: 'en stock' })}` : t('products.out_of_stock', { defaultValue: 'Agotado' })}
                  </span>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex items-start py-2 border-b border-border/50">
                    <span className="font-medium text-foreground/70 min-w-[140px]">{t('products.categories', { defaultValue: 'Categorías' })}:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Sticky Purchase Sidebar (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1">
          <ProductPurchaseSidebar
            product={product}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            translatedName={translatedName}
            translatedDescription={translatedDescription}
          />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="container py-12">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {/* Mobile: Sticky Bottom Purchase Sidebar */}
      <div className="lg:hidden">
        <div className="pb-6">
            <ProductPurchaseSidebar
              product={product}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              translatedName={translatedName}
              translatedDescription={translatedDescription}
            />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
