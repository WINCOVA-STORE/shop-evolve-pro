import { useEffect } from 'react';

/**
 * Hook para precargar imágenes críticas y mejorar rendimiento
 * Estándar WINCOVA: Precarga las primeras 3 imágenes del producto
 * 
 * @param imageUrls - Array de URLs de imágenes a precargar
 * @param priority - Prioridad de precarga (default: 3 primeras imágenes)
 */
export const useImagePreload = (imageUrls: string[], priority: number = 3) => {
  useEffect(() => {
    const priorityImages = imageUrls.slice(0, priority);
    
    priorityImages.forEach((url) => {
      const img = new Image();
      img.src = url;
      
      // Validar resolución (estándar WINCOVA: mínimo 1000px)
      img.onload = () => {
        const minSize = Math.min(img.naturalWidth, img.naturalHeight);
        if (minSize < 1000) {
          console.warn(
            `⚠️ WINCOVA Quality Check: Imagen de baja resolución detectada (${img.naturalWidth}x${img.naturalHeight}). ` +
            `Recomendado: mínimo 1000x1000px, óptimo 1600x1600px para mejor experiencia de zoom.`
          );
        }
      };
    });
  }, [imageUrls, priority]);
};
