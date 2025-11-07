import { useState, useRef, MouseEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageLightboxProps {
  images: string[];
  videos?: string[]; // URLs de videos del producto
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  alt: string;
}

export const ProductImageLightbox = ({ 
  images,
  videos = [], // Por defecto array vacío
  initialIndex, 
  isOpen, 
  onClose,
  alt 
}: ProductImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>(videos.length > 0 ? 'videos' : 'images');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[90vw] max-h-[90vh] w-full h-full p-0 bg-background [&>button]:hidden"
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col h-full">
          {/* HEADER ESTILO AMAZON - Tabs y botón cerrar */}
          <div className="flex items-center justify-between border-b border-border bg-background px-6 py-3">
            <div className="flex gap-6">
              {videos.length > 0 && (
                <button
                  onClick={() => setActiveTab('videos')}
                  className={cn(
                    "text-sm font-medium pb-3 border-b-2 transition-colors",
                    activeTab === 'videos'
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  VIDEOS
                </button>
              )}
              <button
                onClick={() => setActiveTab('images')}
                className={cn(
                  "text-sm font-medium pb-3 border-b-2 transition-colors",
                  activeTab === 'images'
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                IMÁGENES
              </button>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-muted"
              aria-label="Cerrar galería"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* CONTENIDO - Video o Imagen centrada + Thumbnails a la derecha */}
          <div className="flex-1 flex overflow-hidden">
            {/* CONTENIDO PRINCIPAL - Estilo Amazon */}
            <div className="flex-1 flex items-center justify-center p-4 bg-background">
              {activeTab === 'videos' && videos.length > 0 ? (
                // VISTA DE VIDEOS
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    src={videos[currentIndex] || videos[0]}
                    controls
                    className="w-full h-full object-contain"
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: 'calc(90vh - 80px)'
                    }}
                  >
                    Tu navegador no soporta la reproducción de videos.
                  </video>
                  
                  {/* Contador de videos */}
                  {videos.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                      {Math.min(currentIndex + 1, videos.length)} / {videos.length}
                    </div>
                  )}
                </div>
              ) : (
                // VISTA DE IMÁGENES CON ZOOM INTERACTIVO
                <div 
                  ref={imageContainerRef}
                  className="relative w-full h-full flex items-center justify-center overflow-hidden"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => {
                    setIsZoomed(false);
                    setZoomPosition({ x: 50, y: 50 });
                  }}
                >
                  <img
                    src={images[currentIndex]}
                    alt={`${alt} - Vista ${currentIndex + 1}`}
                    className={cn(
                      "w-full h-full object-contain transition-transform duration-200",
                      isZoomed ? "scale-150" : "scale-100"
                    )}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: 'calc(90vh - 80px)',
                      transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center',
                      cursor: isZoomed ? 'zoom-out' : 'zoom-in'
                    }}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                  
                  {/* Contador de imágenes */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium pointer-events-none">
                    {currentIndex + 1} / {images.length}
                  </div>
                </div>
              )}
            </div>

            {/* THUMBNAILS VERTICALES A LA DERECHA - Estilo Amazon */}
            {((activeTab === 'images' && images.length > 1) || (activeTab === 'videos' && videos.length > 1)) && (
              <div className="w-24 border-l border-border bg-muted/20 overflow-y-auto py-4 px-2">
                <div className="flex flex-col gap-2">
                  {activeTab === 'images' ? (
                    // Thumbnails de imágenes
                    images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setIsZoomed(false);
                        }}
                        className={cn(
                          "relative w-full aspect-square rounded border-2 overflow-hidden transition-all hover:scale-105",
                          currentIndex === idx 
                            ? "border-primary ring-2 ring-primary/20 scale-105" 
                            : "border-border hover:border-primary/50 opacity-60 hover:opacity-100"
                        )}
                        aria-label={`Ver imagen ${idx + 1} de ${images.length}`}
                      >
                        <img
                          src={img}
                          alt={`Vista ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        {currentIndex === idx && (
                          <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                        )}
                      </button>
                    ))
                  ) : (
                    // Thumbnails de videos con icono de play
                    videos.map((video, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                          "relative w-full aspect-square rounded border-2 overflow-hidden transition-all hover:scale-105 bg-black/80",
                          currentIndex === idx 
                            ? "border-primary ring-2 ring-primary/20 scale-105" 
                            : "border-border hover:border-primary/50 opacity-60 hover:opacity-100"
                        )}
                        aria-label={`Ver video ${idx + 1} de ${videos.length}`}
                      >
                        {/* Icono de play centrado */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-8 w-8 text-white" fill="white" />
                        </div>
                        {currentIndex === idx && (
                          <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
