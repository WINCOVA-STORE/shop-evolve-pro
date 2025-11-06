import { useState, useRef, MouseEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductImageZoomProps {
  images: string[];
  alt: string;
  discount?: number;
  stock?: number;
  className?: string;
}

export const ProductImageZoom = ({ 
  images, 
  alt, 
  discount, 
  stock,
  className 
}: ProductImageZoomProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
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

  const currentImage = images[selectedImage] || images[0];

  return (
    <div className={cn("flex gap-3", className)}>
      {/* Thumbnails Sidebar - Amazon Style */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-14 md:w-16">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              onMouseEnter={() => setSelectedImage(idx)}
              className={cn(
                "relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 hover:border-primary hover:shadow-md",
                selectedImage === idx ? "border-primary shadow-md ring-1 ring-primary/20" : "border-border"
              )}
            >
              <img
                src={img}
                alt={`${alt} - vista ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Container */}
      <div className="flex-1 relative group">
        <div
          ref={imageRef}
          className="relative aspect-square rounded-lg overflow-hidden bg-white border border-border cursor-zoom-in shadow-sm hover:shadow-md transition-shadow"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Base Image */}
          <img
            src={currentImage}
            alt={alt}
            className={cn(
              "w-full h-full object-contain transition-opacity duration-200",
              isZooming && "opacity-0"
            )}
            loading="eager"
            decoding="async"
          />
          
          {/* Zoomed Image - Amazon Style */}
          <div
            className={cn(
              "absolute inset-0 bg-white opacity-0 transition-opacity duration-200 pointer-events-none",
              isZooming && "opacity-100"
            )}
            style={{
              backgroundImage: `url(${currentImage})`,
              backgroundPosition: `${position.x}% ${position.y}%`,
              backgroundSize: '200%',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Lens indicator - Amazon style */}
          {isZooming && (
            <div
              className="absolute w-32 h-32 border-2 border-primary/40 bg-primary/5 pointer-events-none shadow-lg"
              style={{
                left: `calc(${position.x}% - 64px)`,
                top: `calc(${position.y}% - 64px)`,
              }}
            />
          )}

          {/* Badges */}
          {discount && discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground z-10 shadow-lg text-xs font-bold">
              -{discount}%
            </Badge>
          )}
          
          {stock !== undefined && stock < 10 && stock > 0 && (
            <Badge className="absolute top-2 right-2 bg-orange-500 text-white z-10 shadow-lg text-xs font-semibold">
              Solo {stock}
            </Badge>
          )}
        </div>

        {/* Hover Hint - show when not zooming */}
        {!isZooming && (
          <p className="text-xs text-center text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Pasa el cursor para ver en detalle
          </p>
        )}
      </div>
    </div>
  );
};
