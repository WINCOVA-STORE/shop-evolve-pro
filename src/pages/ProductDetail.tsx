import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ShoppingCart, Heart, Share2, Minus, Plus, Star, Package, Shield, Truck, Gift, Copy, Check, GitCompare } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ProductReviews } from "@/components/ProductReviews";
import { Product } from "@/hooks/useProducts";
import { useTranslatedProduct } from "@/hooks/useTranslatedProduct";
import { toast as sonnerToast } from "sonner";
import { useRewardsCalculation } from "@/hooks/useRewardsCalculation";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const { name: translatedName, description: translatedDescription } = useTranslatedProduct(product);
  const { 
    calculateEarningPoints, 
    formatEarningDisplay, 
    getEarningDescription,
    showPercentage,
    showConversion
  } = useRewardsCalculation();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

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
          title: "Producto no encontrado",
          description: "Este producto no existe o no está disponible",
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
        description: "No se pudo cargar el producto",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, quantity);

    toast({
      title: "¡Agregado al carrito!",
      description: `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de ${translatedName}`,
    });
  };

  const handleWishlist = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCompare = () => {
    if (!product) return;
    addToCompare(product);
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: translatedName,
          text: translatedDescription || translatedName,
          url: url,
        });
        sonnerToast.success("Compartido exitosamente");
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          handleCopyLink(url);
        }
      }
    } else {
      handleCopyLink(url);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    sonnerToast.success("Enlace copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const discount = product?.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;
  
  // Calculate points to earn based on dynamic rewards config
  const pointsToEarn = product ? calculateEarningPoints(product.price * quantity) : 0;

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
      
      <div className="container mx-auto px-4 py-8">
        {location.state?.fromOrder ? (
          <Button
            variant="ghost"
            className="mb-6 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:scale-105 transition-all"
            onClick={() => navigate(`/order/${location.state.fromOrder}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la Orden
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={product.images[selectedImage]}
                alt={translatedName}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                  -{discount}%
                </Badge>
              )}
              {product.stock < 10 && product.stock > 0 && (
                <Badge className="absolute top-4 right-4 bg-orange-500">
                  Solo quedan {product.stock}
                </Badge>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${translatedName} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
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

            <div>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-4xl font-bold">{formatPrice(product.price)}</span>
                {product.compare_at_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </div>
              
              {/* Points Reward Card - Only show if visible or has points */}
              {(showPercentage || showConversion || pointsToEarn > 0) && (
                <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/20">
                        <Gift className="h-5 w-5 text-primary" />
                      </div>
      <div>
        <p className="text-sm font-medium">Ganas con esta compra</p>
        <p className="text-xs text-muted-foreground">
          {typeof getEarningDescription === 'function' ? getEarningDescription() : 'Puntos de recompensa'}
        </p>
      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatEarningDisplay(pointsToEarn)}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-muted-foreground">{translatedDescription}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">SKU</h3>
              <p className="text-sm text-muted-foreground">{product.sku}</p>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cantidad</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {product.stock} disponibles
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                </Button>
                <Button 
                  size="lg" 
                  variant={isInWishlist(product.id) ? "default" : "outline"}
                  onClick={handleWishlist}
                  className="transition-all"
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button 
                  size="lg" 
                  variant={isInCompare(product.id) ? "default" : "outline"}
                  onClick={handleCompare}
                  className="transition-all"
                >
                  <GitCompare className="h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleShare}
                  className="transition-all"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Benefits */}
            <Card className="p-4 bg-muted/50">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Envío Gratis</p>
                    <p className="text-sm text-muted-foreground">En compras mayores a $50</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Compra Protegida</p>
                    <p className="text-sm text-muted-foreground">Garantía de satisfacción</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Devoluciones Fáciles</p>
                    <p className="text-sm text-muted-foreground">30 días para devolver</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container py-12">
        <ProductReviews productId={product.id} />
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
