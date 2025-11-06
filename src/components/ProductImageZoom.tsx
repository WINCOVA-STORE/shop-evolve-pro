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
    
    setPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  };

  const currentImage = images[selectedImage] || images[0];

  return (
    <div className={cn("flex gap-3", className)}>
      {/* Thumbnails AMAZON STYLE - Vertical y pequeños */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-16 flex-shrink-0">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              onMouseEnter={() => setSelectedImage(idx)}
              className={cn(
                "relative w-full aspect-square rounded-md overflow-hidden border transition-all duration-150",
                selectedImage === idx 
                  ? "border-[#e77600] border-2 shadow-sm" 
                  : "border-gray-300 hover:border-gray-400"
              )}
            >
              <img
                src={img}
                alt={`${alt} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Container - AMAZON SIZE (grande) */}
      <div className="flex-1 relative max-w-[550px]">
        <div
          ref={imageRef}
          className="relative w-full aspect-square bg-white rounded-lg overflow-hidden border border-gray-200"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => {
            setIsZooming(false);
            setPosition({ x: 0, y: 0 });
          }}
          onMouseMove={handleMouseMove}
          style={{ cursor: isZooming ? 'crosshair' : 'default' }}
        >
          {/* Original Image */}
          <img
            src={currentImage}
            alt={alt}
            className="w-full h-full object-contain p-8"
            loading="eager"
          />

          {/* Zoom Lens - Rectángulo transparente tipo Amazon */}
          {isZooming && (
            <div
              className="absolute border-2 border-[#e77600] pointer-events-none bg-white/20"
              style={{
                width: '35%',
                height: '35%',
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}

          {/* Badges */}
          {discount && discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground z-20 shadow-md text-sm font-bold px-3 py-1.5">
              -{discount}%
            </Badge>
          )}
          
          {stock !== undefined && stock < 10 && stock > 0 && (
            <Badge className="absolute top-3 right-3 bg-orange-500 text-white z-20 shadow-md text-sm font-semibold px-3 py-1.5">
              Solo {stock}
            </Badge>
          )}

          {/* Hover instruction overlay - ESTILO AMAZON */}
          {!isZooming && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/5 pointer-events-none">
              <div className="bg-white/95 rounded-lg px-4 py-3 shadow-lg border border-gray-200">
                <p className="text-sm font-medium text-[#e77600] whitespace-nowrap">
                  Mueve el cursor para explorar cada detalle
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Text below image - AMAZON STYLE */}
        <p className="mt-2 text-xs text-gray-600 text-center">
          {isZooming 
            ? "Explorando imagen ampliada" 
            : "Pasa el cursor sobre la imagen para acercar"}
        </p>
      </div>

      {/* PANEL ZOOM LATERAL - ESTILO AMAZON (aparece a la derecha) */}
      {isZooming && (
        <div
          className="hidden lg:block absolute left-[calc(100%+1rem)] top-0 w-[550px] h-[550px] bg-white rounded-lg shadow-2xl border-2 border-[#e77600] overflow-hidden z-50"
          style={{
            backgroundImage: `url(${currentImage})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundSize: '250%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
};
