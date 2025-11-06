import { useEffect } from 'react';

/**
 * Preload critical images for faster loading
 */
export const useImagePreload = (imageUrls: string[]) => {
  useEffect(() => {
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [imageUrls]);
};
