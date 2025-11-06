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
        <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-visible w-full md:w-14 lg:w-16">
          {images.map((img, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setSelectedImage(idx)}
              onClick={() => setSelectedImage(idx)}
              className={cn(
                "relative flex-shrink-0 w-14 h-14 md:w-full aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 hover:border-primary hover:shadow-md",
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

      {/* Main Image Container with Super Zoom */}
      <div className="flex-1 relative group order-1 md:order-2">
        <div
          ref={imageRef}
          className="relative aspect-square rounded-lg overflow-hidden bg-white border border-border shadow-sm hover:shadow-md transition-shadow"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Base Image - visible when not zooming */}
          <img
            src={currentImage}
            alt={alt}
            className={cn(
              "w-full h-full object-contain transition-opacity duration-150",
              isZooming ? "opacity-0" : "opacity-100"
            )}
            loading="eager"
            decoding="async"
          />
          
          {/* Super Zoomed Image - Amazon Style (300% zoom) */}
          {isZooming && (
            <div
              className="absolute inset-0 bg-white pointer-events-none"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundPosition: `${position.x}% ${position.y}%`,
                backgroundSize: '300%',
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}

          {/* Zoom Lens Indicator - Amazon style */}
          {isZooming && (
            <div
              className="absolute w-28 h-28 md:w-36 md:h-36 border-2 border-gray-400/60 bg-white/20 pointer-events-none shadow-lg"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
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

          {/* Zoom Hint */}
          {!isZooming && (
            <div className="absolute inset-0 flex items-center justify-center bg-transparent group-hover:bg-black/5 transition-colors duration-300 pointer-events-none">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-xl">
                <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <span className="text-base">🔍</span>
                  Pasa el cursor para ampliar
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Text */}
        <p className="text-[11px] text-center text-muted-foreground mt-2">
          {isZooming ? 'Mueve el cursor para explorar los detalles' : 'Coloca el cursor sobre la imagen'}
        </p>
      </div>
    </div>
  );
};
