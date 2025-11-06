import { useState, useRef, MouseEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductImageZoomProps {
  image: string;
  alt: string;
  discount?: number;
  stock?: number;
  className?: string;
}

export const ProductImageZoom = ({ 
  image, 
  alt, 
  discount, 
  stock,
  className 
}: ProductImageZoomProps) => {
  const [isZooming, setIsZooming] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPosition({ x, y });
  };

  return (
    <div className={cn("relative group", className)}>
      {/* Main Image Container */}
      <div
        ref={imageRef}
        className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-crosshair"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Base Image */}
        <img
          src={image}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isZooming && "opacity-0"
          )}
        />
        
        {/* Zoomed Image - Amazon Style */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none",
            isZooming && "opacity-100"
          )}
          style={{
            backgroundImage: `url(${image})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundSize: '200%',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Badges */}
        {discount && discount > 0 && (
          <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground z-10 shadow-lg">
            -{discount}%
          </Badge>
        )}
        
        {stock !== undefined && stock < 10 && stock > 0 && (
          <Badge className="absolute top-4 right-4 bg-orange-500 z-10 shadow-lg">
            Solo quedan {stock}
          </Badge>
        )}

        {/* Zoom Indicator */}
        <div
          className={cn(
            "absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium transition-opacity duration-300 shadow-lg",
            isZooming ? "opacity-100" : "opacity-0"
          )}
        >
          🔍 Zoom activo
        </div>
      </div>

      {/* Hover Hint */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-background/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-xl text-sm font-medium">
          Pasa el mouse para hacer zoom
        </div>
      </div>
    </div>
  );
};
