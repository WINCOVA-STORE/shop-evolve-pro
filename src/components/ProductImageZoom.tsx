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
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentages for zoom panel
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    // Calculate lens position (clamped to image bounds)
    const lensSize = 0.35; // 35% of container
    const lensHalfSize = lensSize / 2;
    const lensX = Math.max(lensHalfSize * 100, Math.min((1 - lensHalfSize) * 100, xPercent));
    const lensY = Math.max(lensHalfSize * 100, Math.min((1 - lensHalfSize) * 100, yPercent));
    
    setZoomPosition({ x: xPercent, y: yPercent });
    setLensPosition({ x: lensX, y: lensY });
  };

  const currentImage = images[selectedImage] || images[0];

  return (
    <div className={cn("flex gap-3", className)}>
      {/* THUMBNAILS VERTICALES - Estilo Amazon (45px) */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-12 flex-shrink-0">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              onMouseEnter={() => setSelectedImage(idx)}
              className={cn(
                "relative w-full aspect-square rounded border transition-all duration-150 overflow-hidden hover:opacity-100",
                selectedImage === idx 
                  ? "border-[#e77600] border-2 opacity-100" 
                  : "border-gray-300 opacity-70"
              )}
            >
              <img
                src={img}
                alt={`Vista ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* IMAGEN PRINCIPAL - Tamaño optimizado */}
      <div className="flex-1 max-w-[480px]">
        <div
          ref={imageRef}
          className="relative w-full aspect-square bg-white border border-gray-200 overflow-hidden rounded"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => {
            setIsZooming(false);
            setZoomPosition({ x: 0, y: 0 });
          }}
          onMouseMove={handleMouseMove}
          style={{ cursor: isZooming ? 'crosshair' : 'default' }}
        >
          {/* Imagen original */}
          <img
            src={currentImage}
            alt={alt}
            className="w-full h-full object-contain p-8"
            loading="eager"
          />

          {/* LENTE DE ZOOM - Rectángulo semitransparente Amazon */}
          {isZooming && (
            <div
              className="absolute border-2 border-[#e77600] pointer-events-none bg-white/10"
              style={{
                width: '35%',
                height: '35%',
                left: `${lensPosition.x}%`,
                top: `${lensPosition.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}

          {/* Badges */}
          {discount && discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-600 text-white z-20 text-xs font-bold px-2.5 py-0.5">
              -{discount}%
            </Badge>
          )}
          
          {stock !== undefined && stock < 10 && stock > 0 && (
            <Badge className="absolute top-2 right-2 bg-orange-500 text-white z-20 text-xs font-semibold px-2.5 py-0.5">
              Solo {stock}
            </Badge>
          )}

          {/* Mensaje hover - Estilo Amazon */}
          {!isZooming && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/5 to-transparent pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2.5 shadow-lg border border-[#e77600]/20">
                <p className="text-xs font-medium text-[#e77600] whitespace-nowrap flex items-center gap-2">
                  <span className="text-base">🔍</span>
                  Mueve el cursor para ampliar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PANEL ZOOM LATERAL FLOTANTE - Position FIXED, estilo Amazon */}
      {isZooming && (
        <div
          className="hidden xl:block fixed top-32 right-12 w-[520px] h-[520px] bg-white border-[3px] border-[#e77600] shadow-2xl z-[9999] pointer-events-none rounded-lg overflow-hidden"
          style={{
            backgroundImage: `url(${currentImage})`,
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            backgroundSize: '250%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
};
