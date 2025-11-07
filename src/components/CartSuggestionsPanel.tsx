import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Users, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNavigate } from "react-router-dom";
import { useCartSuggestions } from "@/hooks/useCartSuggestions";
import { cn } from "@/lib/utils";

interface CartSuggestionsPanelProps {
  cartItems: any[];
}

export const CartSuggestionsPanel = ({ cartItems }: CartSuggestionsPanelProps) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { suggestions, loading } = useCartSuggestions(cartItems);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    setAddedItems(prev => new Set(prev).add(product.id));
    
    // Remove from added state after animation
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  if (loading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden relative">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Recomendado para ti
            </span>
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            IA
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-3">
        {suggestions.slice(0, 3).map((product: any, index: number) => {
          const isAdded = addedItems.has(product.id);
          const inCart = cartItems.some(item => item.id === product.id);
          
          return (
            <div 
              key={product.id}
              className={cn(
                "group flex gap-3 p-3 rounded-lg border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-card/80 cursor-pointer",
                isAdded && "animate-scale-in border-primary bg-primary/10"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                <img
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded border border-border"
                  onClick={() => {
                    navigate(`/product/${product.id}`);
                  }}
                />
                {product.compare_at_price && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 text-xs px-1 py-0 h-5"
                  >
                    -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                  </Badge>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h5 
                  className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.name}
                </h5>
                
                <div className="flex items-center gap-2 mt-1">
                  {product.compare_at_price && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.compare_at_price)}
                    </span>
                  )}
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                </div>

                {/* Social proof */}
                {index === 0 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>+50 personas lo compraron hoy</span>
                  </div>
                )}
              </div>
              
              <Button
                size="sm"
                variant={isAdded ? "secondary" : inCart ? "outline" : "default"}
                className={cn(
                  "h-8 px-3 whitespace-nowrap transition-all",
                  isAdded && "animate-scale-in",
                  inCart && "opacity-50 cursor-not-allowed"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!inCart) handleAddToCart(product);
                }}
                disabled={inCart || isAdded}
              >
                {isAdded ? "✓ Añadido" : inCart ? "En carrito" : "Añadir"}
              </Button>
            </div>
          );
        })}

        {/* View More Button */}
        {suggestions.length > 3 && (
          <Button
            variant="ghost"
            className="w-full mt-2 gap-2 hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate('/search')}
          >
            Ver más recomendaciones
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
