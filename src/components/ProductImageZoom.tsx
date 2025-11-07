import { useState, useRef, MouseEvent, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ProductImageThumbnails } from './ProductImageThumbnails';
import { ProductImageLightbox } from './ProductImageLightbox';
import { useToast } from '@/hooks/use-toast';

interface ProductImageZoomProps {
  images: string[];
  videos?: string[]; // URLs de videos del producto
  alt: string;
  discount?: number;
  stock?: number;
  className?: string;
}

export const ProductImageZoom = ({ 
  images,
  videos = [], // Por defecto array vacío
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
    
    // CRÍTICO: Cálculo perfecto para centrado natural del zoom con lente 20%
    const lensSize = 0.2; // 20% de la imagen (reducido)
    
    // Calcular porcentaje del cursor con restricción para mantener lente dentro
    let xPercent = (x / rect.width) * 100;
    let yPercent = (y / rect.height) * 100;
    
    // Aplicar límites suaves para que la lente no salga de la imagen (ajustado para lente 20%)
    const minPercent = (lensSize * 0.5) * 100; // 10%
    const maxPercent = 100 - ((lensSize * 0.5) * 100); // 90%
    
    xPercent = Math.max(minPercent, Math.min(maxPercent, xPercent));
    yPercent = Math.max(minPercent, Math.min(maxPercent, yPercent));
    
    setZoomPosition({ x: xPercent, y: yPercent });
  };

  const currentImage = limitedImages[selectedImage] || limitedImages[0];

  return (
    <>
      <div className={cn("flex gap-3 h-screen max-w-full", className)}>
        {/* THUMBNAILS VERTICALES - Componente modular */}
        <ProductImageThumbnails
          images={limitedImages}
          selectedImage={selectedImage}
          onSelectImage={setSelectedImage}
          maxImages={8}
        />

        {/* IMAGEN PRINCIPAL - Altura completa de pantalla */}
        <div className="flex-1 max-w-[700px] w-full h-full flex items-center">
          <div
            ref={imageRef}
            className="relative w-full h-full border border-border overflow-hidden rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => {
              setIsZooming(false);
              setZoomPosition({ x: 50, y: 50 }); // Reset al centro
            }}
            onMouseMove={handleMouseMove}
            onClick={() => setIsLightboxOpen(true)}
          >
            {/* Imagen original con optimización de carga - SIN fondo blanco */}
            <img
              src={currentImage}
              alt={alt}
              className="w-full h-full object-contain p-8"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              srcSet={`${currentImage} 1x, ${currentImage} 2x`}
            />

            {/* LENTE DE ZOOM - Más pequeña 20% SIN delay */}
            {isZooming && (
              <div
                className="absolute border-[3px] border-[#ff9800] pointer-events-none rounded-sm"
                style={{
                  width: '15%',
                  height: '15%',
                  left: `${zoomPosition.x}%`,
                  top: `${zoomPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.25)',
                  willChange: 'transform, left, top'
                }}
              />
            )}

            {/* Badges */}
            {discount && discount > 0 && (
              <Badge className="absolute top-2.5 left-2.5 bg-destructive text-destructive-foreground z-20 text-xs font-bold px-2.5 py-1 shadow-lg pointer-events-none">
                -{discount}%
              </Badge>
            )}
            
            {stock !== undefined && stock < 10 && stock > 0 && (
              <Badge className="absolute top-2.5 right-2.5 bg-orange-500 text-white z-20 text-xs font-semibold px-2.5 py-1 shadow-lg pointer-events-none">
                Solo {stock}
              </Badge>
            )}

            {/* Contador de imágenes - Estilo profesional */}
            {limitedImages.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium pointer-events-none">
                {selectedImage + 1} / {limitedImages.length}
              </div>
            )}
          </div>
        </div>

        {/* PANEL ZOOM - Entre imagen principal y panel de precio */}
        {isZooming && (
          <div
            className="hidden xl:block fixed border-[3px] border-primary shadow-2xl pointer-events-none rounded-sm overflow-hidden"
            style={{
              top: imageRef.current ? `${imageRef.current.getBoundingClientRect().top}px` : '0',
              height: imageRef.current ? `${imageRef.current.getBoundingClientRect().height}px` : '100vh',
              left: imageRef.current ? `${imageRef.current.getBoundingClientRect().right + 24}px` : '0',
              right: 'calc(380px + 48px)',
              width: 'auto',
              minWidth: '300px',
              maxWidth: '500px',
              backgroundImage: `url(${currentImage})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: '300%',
              backgroundRepeat: 'no-repeat',
              backgroundColor: 'transparent',
              willChange: 'background-position',
              zIndex: 50
            }}
          />
        )}
      </div>

      {/* LIGHTBOX MODAL - Fullscreen */}
      <ProductImageLightbox
        images={limitedImages}
        videos={videos}
        initialIndex={selectedImage}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        alt={alt}
      />
    </>
  );
};
