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
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZooming) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    setPosition({ x: clampedX, y: clampedY });
  };

  const currentImage = images[selectedImage] || images[0];

  return (
    <div className={cn("flex flex-col md:flex-row gap-3", className)}>
      {/* Thumbnails Sidebar - Amazon Style */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-visible w-full md:w-16 lg:w-20">
          {images.map((img, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setSelectedImage(idx)}
              onClick={() => setSelectedImage(idx)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 md:w-full aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 hover:border-primary hover:shadow-md",
                selectedImage === idx ? "border-primary shadow-md ring-2 ring-primary/30 scale-105" : "border-border"
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

      {/* Main Image Container with Super Zoom */}
      <div className="flex-1 relative group order-1 md:order-2">
        <div
          ref={imageRef}
          className="relative w-full aspect-square rounded-lg overflow-hidden bg-white border border-border shadow-sm hover:shadow-lg transition-all duration-300 cursor-crosshair"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => {
            setIsZooming(false);
            setPosition({ x: 50, y: 50 });
          }}
          onMouseMove={handleMouseMove}
        >
          {/* Base Image - visible when not zooming */}
          <img
            src={currentImage}
            alt={alt}
            className={cn(
              "w-full h-full object-contain transition-opacity duration-200",
              isZooming ? "opacity-0" : "opacity-100"
            )}
            loading="eager"
            decoding="async"
          />
          
          {/* Super Zoomed Image - Amazon Style (350% zoom) */}
          <div
            className={cn(
              "absolute inset-0 bg-white transition-opacity duration-200",
              isZooming ? "opacity-100" : "opacity-0"
            )}
            style={{
              backgroundImage: `url(${currentImage})`,
              backgroundPosition: `${position.x}% ${position.y}%`,
              backgroundSize: '350%',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Zoom Lens Indicator - Amazon style */}
          <div
            className={cn(
              "absolute w-32 h-32 border-2 border-gray-500/50 bg-white/20 pointer-events-none shadow-xl transition-opacity duration-200",
              isZooming ? "opacity-100" : "opacity-0"
            )}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Badges */}
          {discount && discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground z-10 shadow-lg text-sm font-bold px-2 py-1">
              -{discount}%
            </Badge>
          )}
          
          {stock !== undefined && stock < 10 && stock > 0 && (
            <Badge className="absolute top-3 right-3 bg-orange-500 text-white z-10 shadow-lg text-sm font-semibold px-2 py-1">
              Solo {stock}
            </Badge>
          )}

          {/* Zoom Hint - show when not zooming */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center bg-transparent transition-all duration-300 pointer-events-none",
            !isZooming && "group-hover:bg-black/5"
          )}>
            <div className={cn(
              "bg-white/95 backdrop-blur-sm px-5 py-3 rounded-lg shadow-xl transition-opacity duration-300",
              isZooming ? "opacity-0" : "opacity-0 group-hover:opacity-100"
            )}>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="text-xl">🔍</span>
                Pasa el cursor para ampliar
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Text */}
        <p className="text-xs text-center text-muted-foreground mt-2 font-medium">
          {isZooming ? 'Mueve el cursor para explorar los detalles' : 'Pasa el cursor sobre la imagen para hacer zoom'}
        </p>
      </div>
    </div>
  );
};
