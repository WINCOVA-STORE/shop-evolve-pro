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
    <div className={cn("flex gap-4", className)}>
      {/* Thumbnails Sidebar - Vertical */}
      {images.length > 1 && (
        <div className="flex flex-col gap-3 w-20">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              onMouseEnter={() => setSelectedImage(idx)}
              className={cn(
                "relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:border-primary hover:shadow-lg hover:scale-105",
                selectedImage === idx ? "border-primary shadow-lg scale-105" : "border-border"
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

      {/* Main Image Container with Super Zoom */}
      <div className="flex-1">
        <div
          ref={imageRef}
          className="relative w-full aspect-square rounded-xl overflow-hidden bg-white border border-border shadow-md hover:shadow-xl transition-shadow duration-300 cursor-crosshair"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => {
            setIsZooming(false);
            setPosition({ x: 50, y: 50 });
          }}
          onMouseMove={handleMouseMove}
        >
          {/* Original Image - Hidden when zooming */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-200",
              isZooming ? "opacity-0" : "opacity-100"
            )}
          >
            <img
              src={currentImage}
              alt={alt}
              className="w-full h-full object-contain p-4"
              loading="eager"
            />
          </div>
          
          {/* SUPER ZOOMED Background - Visible when zooming */}
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-200",
              isZooming ? "opacity-100" : "opacity-0"
            )}
            style={{
              backgroundImage: `url(${currentImage})`,
              backgroundPosition: `${position.x}% ${position.y}%`,
              backgroundSize: '400%',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Zoom Lens Circle */}
          <div
            className={cn(
              "absolute w-36 h-36 border-[3px] border-primary/50 rounded-full pointer-events-none shadow-xl transition-opacity duration-200",
              isZooming ? "opacity-100" : "opacity-0"
            )}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(255,153,0,0.1) 0%, transparent 70%)',
            }}
          />

          {/* Badges */}
          {discount && discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground z-20 shadow-lg text-sm font-bold px-3 py-1.5">
              -{discount}%
            </Badge>
          )}
          
          {stock !== undefined && stock < 10 && stock > 0 && (
            <Badge className="absolute top-3 right-3 bg-orange-500 text-white z-20 shadow-lg text-sm font-semibold px-3 py-1.5">
              Solo {stock}
            </Badge>
          )}

          {/* Hover Hint - Only show when NOT zooming */}
          {!isZooming && (
            <div className="absolute inset-0 flex items-center justify-center bg-transparent group-hover:bg-black/5 transition-colors duration-300 pointer-events-none">
              <div className="opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔍</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">Pasa el cursor</p>
                    <p className="text-xs text-muted-foreground">para ver en detalle</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Text */}
        <p className={cn(
          "mt-3 text-center text-xs font-medium transition-colors duration-300",
          isZooming ? "text-primary" : "text-muted-foreground"
        )}>
          {isZooming 
            ? "Mueve el cursor para explorar cada detalle de la imagen" 
            : "Coloca el cursor sobre la imagen para ampliar"}
        </p>
      </div>
    </div>
  );
};
