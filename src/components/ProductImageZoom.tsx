import { useState, useRef, MouseEvent, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductImageThumbnails } from './ProductImageThumbnails';
import { ProductImageLightbox } from './ProductImageLightbox';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  // Limitar a máximo 8 imágenes (estándar WINCOVA/Amazon)
  const limitedImages = images.slice(0, 8);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 }); // Centrado por defecto
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Validar calidad de imagen (estándar WINCOVA: mínimo 1000px)
  useEffect(() => {
    const img = new Image();
    img.src = limitedImages[selectedImage];
    img.onload = () => {
      const minSize = Math.min(img.naturalWidth, img.naturalHeight);
      if (minSize < 1000) {
        console.warn(`⚠️ WINCOVA: Imagen ${selectedImage + 1} tiene baja resolución (${img.naturalWidth}x${img.naturalHeight}). Recomendado: mínimo 1000x1000px, óptimo 1600x1600px`);
      }
    };
  }, [selectedImage, limitedImages]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // CRÍTICO: Cálculo perfecto para centrado natural del zoom
    // Consideramos el tamaño de la lente (40%) para límites suaves
    const lensSize = 0.4; // 40% de la imagen
    const halfLens = lensSize / 2;
    
    // Calcular porcentaje del cursor con restricción para mantener lente dentro
    let xPercent = (x / rect.width) * 100;
    let yPercent = (y / rect.height) * 100;
    
    // Aplicar límites suaves para que la lente no salga de la imagen
    const minPercent = halfLens * 100;
    const maxPercent = 100 - (halfLens * 100);
    
    xPercent = Math.max(minPercent, Math.min(maxPercent, xPercent));
    yPercent = Math.max(minPercent, Math.min(maxPercent, yPercent));
    
    setZoomPosition({ x: xPercent, y: yPercent });
  };

  const currentImage = limitedImages[selectedImage] || limitedImages[0];

  return (
    <>
      <div className={cn("flex gap-3", className)}>
        {/* THUMBNAILS VERTICALES - Componente modular */}
        <ProductImageThumbnails
          images={limitedImages}
          selectedImage={selectedImage}
          onSelectImage={setSelectedImage}
          maxImages={8}
        />

        {/* IMAGEN PRINCIPAL - 85% del área visual (estándar WINCOVA) */}
        <div className="flex-1 max-w-[520px]">
          <div
            ref={imageRef}
            className="relative w-full aspect-square bg-[rgb(255,255,255)] border border-border overflow-hidden rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => {
              setIsZooming(false);
              setZoomPosition({ x: 50, y: 50 }); // Reset al centro
            }}
            onMouseMove={handleMouseMove}
            style={{ cursor: isZooming ? 'crosshair' : 'zoom-in' }}
          >
            {/* Imagen original */}
            <img
              src={currentImage}
              alt={alt}
              className="w-full h-full object-contain p-8"
              loading="eager"
            />

            {/* LENTE DE ZOOM - Estilo Amazon con centrado perfecto */}
            {isZooming && (
              <div
                className="absolute border-[3px] border-primary pointer-events-none bg-white/10 backdrop-blur-[0.5px] rounded-sm"
                style={{
                  width: '40%',
                  height: '40%',
                  left: `${zoomPosition.x}%`,
                  top: `${zoomPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.25)',
                  transition: 'all 0.03s ease-out',
                  willChange: 'transform, left, top'
                }}
              />
            )}

            {/* Badges */}
            {discount && discount > 0 && (
              <Badge className="absolute top-2.5 left-2.5 bg-destructive text-destructive-foreground z-20 text-xs font-bold px-2.5 py-1 shadow-lg">
                -{discount}%
              </Badge>
            )}
            
            {stock !== undefined && stock < 10 && stock > 0 && (
              <Badge className="absolute top-2.5 right-2.5 bg-orange-500 text-white z-20 text-xs font-semibold px-2.5 py-1 shadow-lg">
                Solo {stock}
              </Badge>
            )}

            {/* Botón Full Screen - Top Right */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2.5 left-2.5 z-20 w-9 h-9 bg-background/90 hover:bg-background backdrop-blur-sm"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Ver en pantalla completa"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>

            {/* Mensaje hover - Estilo Amazon */}
            {!isZooming && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none">
                <div className="bg-background/95 backdrop-blur-sm rounded-lg px-4 py-2.5 shadow-xl border border-primary/30">
                  <p className="text-xs font-semibold text-primary whitespace-nowrap flex items-center gap-2">
                    <span className="text-base">🔍</span>
                    Mueve el cursor para ampliar
                  </p>
                </div>
              </div>
            )}

            {/* Contador de imágenes - Estilo profesional */}
            {limitedImages.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                {selectedImage + 1} / {limitedImages.length}
              </div>
            )}
          </div>

          {/* Indicador de navegación - Dots */}
          {limitedImages.length > 1 && (
            <div className="flex gap-1.5 justify-center mt-3">
              {limitedImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    selectedImage === idx 
                      ? "w-8 bg-primary" 
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  )}
                  aria-label={`Ver imagen ${idx + 1} de ${limitedImages.length}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* PANEL ZOOM SOBRE IMAGEN - Posicionado sobre la imagen principal */}
        {isZooming && (
          <div
            className="hidden xl:block absolute top-4 left-4 w-[70%] h-[70%] bg-[rgb(255,255,255)] border-[3px] border-primary shadow-2xl z-[9999] pointer-events-none rounded-sm overflow-hidden"
            style={{
              backgroundImage: `url(${currentImage})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: '150%',
              backgroundRepeat: 'no-repeat',
              transition: 'background-position 0.03s ease-out',
              willChange: 'background-position'
            }}
          />
        )}
      </div>

      {/* LIGHTBOX MODAL - Fullscreen */}
      <ProductImageLightbox
        images={limitedImages}
        initialIndex={selectedImage}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        alt={alt}
      />
    </>
  );
};
