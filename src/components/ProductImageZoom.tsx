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
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  };

  const currentImage = images[selectedImage] || images[0];

  return (
    <div className={cn("flex flex-col md:flex-row gap-4", className)}>
      {/* Thumbnails Sidebar */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-visible w-full md:w-20">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 md:w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:border-primary hover:shadow-md hover:scale-105",
                selectedImage === idx ? "border-primary shadow-lg ring-2 ring-primary/40 scale-105" : "border-border"
              )}
            >
              <img
                src={img}
                alt={`${alt} - ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image with SUPER ZOOM */}
      <div className="flex-1 relative group order-1 md:order-2">
        <div
          ref={imageRef}
          className="relative w-full aspect-square rounded-xl overflow-hidden bg-white border border-border shadow-md hover:shadow-xl transition-all duration-300"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => {
            setIsZooming(false);
            setPosition({ x: 50, y: 50 });
          }}
          onMouseMove={handleMouseMove}
        >
          {/* Original Image */}
          <img
            src={currentImage}
            alt={alt}
            className={cn(
              "absolute inset-0 w-full h-full object-contain transition-all duration-200",
              isZooming ? "opacity-0 scale-110" : "opacity-100 scale-100"
            )}
            loading="eager"
          />
          
          {/* SUPER ZOOMED Image - 500% */}
          <div
            className={cn(
              "absolute inset-0 bg-white transition-all duration-200",
              isZooming ? "opacity-100" : "opacity-0"
            )}
            style={{
              backgroundImage: `url(${currentImage})`,
              backgroundPosition: `${position.x}% ${position.y}%`,
              backgroundSize: '500%',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Zoom Lens Indicator */}
          <div
            className={cn(
              "absolute w-40 h-40 border-[3px] border-primary/60 rounded-full bg-primary/5 pointer-events-none shadow-2xl transition-all duration-200",
              isZooming ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full" />
            </div>
          </div>

          {/* Badges */}
          {discount && discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground z-20 shadow-xl text-sm font-bold px-3 py-1.5">
              -{discount}%
            </Badge>
          )}
          
          {stock !== undefined && stock < 10 && stock > 0 && (
            <Badge className="absolute top-3 right-3 bg-orange-500 text-white z-20 shadow-xl text-sm font-semibold px-3 py-1.5">
              Solo {stock}
            </Badge>
          )}

          {/* Zoom Hint Overlay */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none z-10",
            isZooming ? "bg-transparent" : "bg-black/0 group-hover:bg-black/10"
          )}>
            <div className={cn(
              "bg-white/98 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 border-2 border-primary/20",
              isZooming ? "opacity-0 scale-75" : "opacity-0 group-hover:opacity-100 group-hover:scale-100"
            )}>
              <div className="flex items-center gap-3">
                <div className="text-3xl animate-pulse">🔍</div>
                <div>
                  <p className="text-sm font-bold text-foreground">Super Zoom</p>
                  <p className="text-xs text-muted-foreground">Pasa el cursor para ampliar 5x</p>
                </div>
              </div>
            </div>
          </div>

          {/* Zoom Active Indicator */}
          {isZooming && (
            <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl z-20 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Zoom 5x activo
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-3 text-center">
          <p className={cn(
            "text-sm font-medium transition-colors duration-300",
            isZooming ? "text-primary" : "text-muted-foreground"
          )}>
            {isZooming 
              ? "🔍 Mueve el cursor para explorar cada detalle" 
              : "Pasa el cursor sobre la imagen para activar el zoom"}
          </p>
        </div>
      </div>
    </div>
  );
};
