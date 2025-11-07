import { cn } from '@/lib/utils';

interface ProductImageThumbnailsProps {
  images: string[];
  selectedImage: number;
  onSelectImage: (index: number) => void;
  maxImages?: number;
}

export const ProductImageThumbnails = ({ 
  images, 
  selectedImage, 
  onSelectImage,
  maxImages = 8 
}: ProductImageThumbnailsProps) => {
  // Limitar a máximo 8 imágenes según estándar WINCOVA
  const limitedImages = images.slice(0, maxImages);
  
  // Grid inteligente según cantidad de imágenes
  const getGridLayout = () => {
    const count = limitedImages.length;
    if (count <= 1) return "grid-rows-1 h-16";
    if (count <= 4) return "grid-rows-4 h-[272px]";
    if (count <= 6) return "grid-rows-6 h-[408px]";
    return "grid-rows-8 h-[544px]";
  };

  if (limitedImages.length <= 1) return null;

  return (
    <div className={cn(
      "grid grid-cols-1 gap-2 w-16 flex-shrink-0",
      getGridLayout()
    )}>
      {limitedImages.map((img, idx) => (
        <button
          key={idx}
          onClick={() => onSelectImage(idx)}
          onMouseEnter={() => onSelectImage(idx)}
          className={cn(
            "relative w-full aspect-square rounded-md border-2 transition-all duration-200 overflow-hidden group",
            selectedImage === idx 
              ? "border-primary ring-2 ring-primary/20 scale-105 shadow-md" 
              : "border-border hover:border-primary/50 hover:scale-105"
          )}
          aria-label={`Ver imagen ${idx + 1} de ${limitedImages.length}`}
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
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          )}
        </button>
      ))}
    </div>
  );
};
