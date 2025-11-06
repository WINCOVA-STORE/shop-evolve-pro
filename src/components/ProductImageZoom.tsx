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
  // Limitar a máximo 7 imágenes
  const limitedImages = images.slice(0, 7);
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

  const currentImage = limitedImages[selectedImage] || limitedImages[0];
  
  // Grid inteligente según cantidad de imágenes
  const getGridLayout = () => {
    const count = limitedImages.length;
    if (count <= 1) return "grid-rows-1";
    if (count <= 5) return "grid-rows-5";
    return "grid-rows-7";
  };

  return (
    <div className={cn("flex gap-3", className)}>
      {/* THUMBNAILS VERTICALES - Grid inteligente según cantidad */}
      {limitedImages.length > 1 && (
        <div className={cn(
          "grid grid-cols-1 gap-2 w-14 flex-shrink-0",
          getGridLayout(),
          limitedImages.length === 1 && "h-14",
          limitedImages.length > 1 && limitedImages.length <= 5 && "h-[290px]",
          limitedImages.length > 5 && "h-[406px]"
        )}>
          {limitedImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              onMouseEnter={() => setSelectedImage(idx)}
              className={cn(
                "relative w-full aspect-square rounded border transition-all duration-200 overflow-hidden group",
                selectedImage === idx 
                  ? "border-[#e77600] border-2 ring-1 ring-[#e77600]/30 scale-105" 
                  : "border-gray-300 hover:border-gray-500 hover:scale-105"
              )}
            >
              <img
                src={img}
                alt={`Vista ${idx + 1}`}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-200",
                  selectedImage === idx ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                )}
                loading="lazy"
              />
              {/* Indicador de imagen seleccionada */}
              {selectedImage === idx && (
                <div className="absolute inset-0 bg-[#e77600]/5 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* IMAGEN PRINCIPAL - Tamaño optimizado */}
      <div className="flex-1 max-w-[480px]">
        <div
          ref={imageRef}
          className="relative w-full aspect-square bg-white border border-gray-200 overflow-hidden rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300"
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
              className="absolute border-2 border-[#e77600] pointer-events-none bg-white/10 backdrop-blur-[1px]"
              style={{
                width: '35%',
                height: '35%',
                left: `${lensPosition.x}%`,
                top: `${lensPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.15)'
              }}
            />
          )}

          {/* Badges */}
          {discount && discount > 0 && (
            <Badge className="absolute top-2.5 left-2.5 bg-red-600 text-white z-20 text-xs font-bold px-2.5 py-1 shadow-lg">
              -{discount}%
            </Badge>
          )}
          
          {stock !== undefined && stock < 10 && stock > 0 && (
            <Badge className="absolute top-2.5 right-2.5 bg-orange-500 text-white z-20 text-xs font-semibold px-2.5 py-1 shadow-lg">
              Solo {stock}
            </Badge>
          )}

          {/* Mensaje hover - Estilo Amazon */}
          {!isZooming && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2.5 shadow-xl border border-[#e77600]/30">
                <p className="text-xs font-semibold text-[#e77600] whitespace-nowrap flex items-center gap-2">
                  <span className="text-base">🔍</span>
                  Mueve el cursor para ampliar
                </p>
              </div>
            </div>
          )}

          {/* Contador de imágenes */}
          {limitedImages.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {selectedImage + 1} / {limitedImages.length}
            </div>
          )}
        </div>

        {/* Indicador de navegación */}
        {limitedImages.length > 1 && (
          <div className="flex gap-1 justify-center mt-3">
            {limitedImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  selectedImage === idx 
                    ? "w-6 bg-[#e77600]" 
                    : "w-1.5 bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Ver imagen ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* PANEL ZOOM LATERAL FLOTANTE - Position FIXED, estilo Amazon */}
      {isZooming && (
        <div
          className="hidden xl:block fixed top-36 right-12 w-[520px] h-[520px] bg-white border-[3px] border-[#e77600] shadow-2xl z-[9999] pointer-events-none rounded-lg overflow-hidden"
          style={{
            backgroundImage: `url(${currentImage})`,
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            backgroundSize: '250%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Marca de agua del zoom */}
          <div className="absolute top-3 right-3 bg-[#e77600] text-white text-xs font-bold px-2 py-1 rounded">
            ZOOM 250%
          </div>
        </div>
      )}
    </div>
  );
};
