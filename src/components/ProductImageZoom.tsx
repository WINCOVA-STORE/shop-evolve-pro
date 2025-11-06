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
    <div className="w-full">
      <div className={cn("flex gap-4", className)}>
        {/* Thumbnails Sidebar - Vertical */}
        {images.length > 1 && (
          <div className="flex flex-col gap-3 w-20 flex-shrink-0">
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

        {/* Main Image Container con efecto de lente */}
        <div className="flex-1 relative">
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
            {/* Original Image */}
            <img
              src={currentImage}
              alt={alt}
              className="w-full h-full object-contain p-4"
              loading="eager"
            />

            {/* Zoom Lens Indicator - cuadrado semi-transparente */}
            <div
              className={cn(
                "absolute w-40 h-40 border-2 border-primary/60 bg-black/5 pointer-events-none transition-opacity duration-200",
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
              <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground z-20 shadow-lg text-sm font-bold px-3 py-1.5">
                -{discount}%
              </Badge>
            )}
            
            {stock !== undefined && stock < 10 && stock > 0 && (
              <Badge className="absolute top-3 right-3 bg-orange-500 text-white z-20 shadow-lg text-sm font-semibold px-3 py-1.5">
                Solo {stock}
              </Badge>
            )}
          </div>

          {/* Instructions Text */}
          <p className={cn(
            "mt-3 text-center text-xs font-medium transition-colors duration-300",
            isZooming ? "text-primary" : "text-muted-foreground"
          )}>
            {isZooming 
              ? "Mueve el cursor para explorar cada detalle" 
              : "Pasa el cursor sobre la imagen para ampliar"}
          </p>
        </div>

        {/* PANEL LATERAL GIGANTE - Fixed position a la derecha */}
        {isZooming && (
          <div
            className="hidden lg:block fixed top-24 right-8 w-[500px] h-[500px] rounded-xl overflow-hidden bg-white border-4 border-primary shadow-2xl z-[100]"
            style={{
              backgroundImage: `url(${currentImage})`,
              backgroundPosition: `${position.x}% ${position.y}%`,
              backgroundSize: '300%',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
      </div>
    </div>
  );
};
