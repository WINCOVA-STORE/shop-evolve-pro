import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  alt: string;
}

export const ProductImageLightbox = ({ 
  images, 
  initialIndex, 
  isOpen, 
  onClose,
  alt 
}: ProductImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const [isZoomed, setIsZoomed] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[90vw] max-h-[90vh] w-full h-full p-0 bg-background"
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col h-full">
          {/* HEADER ESTILO AMAZON - Tabs y botón cerrar */}
          <div className="flex items-center justify-between border-b border-border bg-background px-6 py-3">
            <div className="flex gap-6">
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

          {/* CONTENIDO - Imagen centrada + Thumbnails a la derecha */}
          <div className="flex-1 flex overflow-hidden">
            {/* IMAGEN PRINCIPAL - Estilo Amazon */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
              <div className="relative max-w-full max-h-full">
                <img
                  src={images[currentIndex]}
                  alt={`${alt} - Vista ${currentIndex + 1}`}
                  className={cn(
                    "max-w-full max-h-[calc(90vh-120px)] object-contain transition-transform duration-300 cursor-pointer",
                    isZoomed ? "scale-150" : "scale-100"
                  )}
                  onClick={() => setIsZoomed(!isZoomed)}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                
                {/* Contador de imágenes */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>
            </div>

            {/* THUMBNAILS VERTICALES A LA DERECHA - Estilo Amazon */}
            {images.length > 1 && (
              <div className="w-24 border-l border-border bg-muted/20 overflow-y-auto py-4 px-2">
                <div className="flex flex-col gap-2">
                  {images.map((img, idx) => (
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
                      {/* Indicador de selección */}
                      {currentIndex === idx && (
                        <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
