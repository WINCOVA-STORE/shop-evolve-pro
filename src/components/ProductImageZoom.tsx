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
    <div className={cn("flex gap-2", className)}>
      {/* THUMBNAILS VERTICALES - Estilo Amazon (pequeños 40px) */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-10 flex-shrink-0">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              onMouseEnter={() => setSelectedImage(idx)}
              className={cn(
                "relative w-full aspect-square rounded border transition-all duration-150 overflow-hidden",
                selectedImage === idx 
                  ? "border-[#e77600] border-2" 
                  : "border-gray-300 hover:border-gray-500"
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

      {/* IMAGEN PRINCIPAL - Tamaño Amazon (max 500px) */}
      <div className="flex-1 max-w-[500px]">
        <div
          ref={imageRef}
          className="relative w-full aspect-square bg-white border border-gray-200 overflow-hidden"
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
            className="w-full h-full object-contain p-6"
            loading="eager"
          />

          {/* LENTE DE ZOOM - Rectángulo semitransparente Amazon */}
          {isZooming && (
            <div
              className="absolute border-2 border-[#e77600] pointer-events-none bg-white/20"
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
            <Badge className="absolute top-2 left-2 bg-red-600 text-white z-20 text-xs font-bold px-2 py-1">
              -{discount}%
            </Badge>
          )}
          
          {stock !== undefined && stock < 10 && stock > 0 && (
            <Badge className="absolute top-2 right-2 bg-orange-500 text-white z-20 text-xs font-semibold px-2 py-1">
              Solo {stock}
            </Badge>
          )}

          {/* Mensaje hover - Estilo Amazon */}
          {!isZooming && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/[0.02] pointer-events-none">
              <div className="bg-white/95 rounded px-3 py-2 shadow-md border border-gray-200">
                <p className="text-xs font-medium text-[#e77600] whitespace-nowrap">
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
          className="hidden xl:block fixed top-20 right-8 w-[550px] h-[550px] bg-white border-2 border-[#e77600] shadow-2xl z-[9999] pointer-events-none"
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
