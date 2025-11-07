import { useEffect } from 'react';

/**
 * Hook para precargar imágenes críticas y mejorar rendimiento
 * Estándar WINCOVA: Precarga optimizada con prioridades y gestión de memoria
 * 
 * @param imageUrls - Array de URLs de imágenes a precargar
 * @param priority - Número de imágenes prioritarias a precargar (default: 3)
 */
export const useImagePreload = (imageUrls: string[], priority: number = 3) => {
  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) return;

    const priorityImages = imageUrls.slice(0, priority);
    const secondaryImages = imageUrls.slice(priority, priority + 3);
    const preloadedImages: HTMLImageElement[] = [];

    // Precarga inmediata de imágenes prioritarias (primera pantalla)
    priorityImages.forEach((url, index) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.fetchPriority = index === 0 ? 'high' : 'low';
      document.head.appendChild(link);
    });

    // Precarga diferida de imágenes secundarias (mejora experiencia de navegación)
    const preloadSecondary = setTimeout(() => {
      secondaryImages.forEach((url) => {
        const img = new Image();
        img.src = url;
        preloadedImages.push(img);
        
        // Validación de calidad WINCOVA
        img.onload = () => {
          const minSize = Math.min(img.naturalWidth, img.naturalHeight);
          if (minSize < 1000) {
            console.warn(
              `⚠️ WINCOVA Quality: Imagen ${url} de baja resolución (${img.naturalWidth}x${img.naturalHeight}). ` +
              `Recomendado: mínimo 1000x1000px, óptimo 1600x1600px para zoom perfecto.`
            );
          }
        };
      });
    }, 500); // Espera 500ms para no interferir con carga crítica

    return () => {
      clearTimeout(preloadSecondary);
      // Limpieza de referencias para evitar memory leaks
      preloadedImages.forEach(img => {
        img.src = '';
      });
    };
  }, [imageUrls, priority]);
};
