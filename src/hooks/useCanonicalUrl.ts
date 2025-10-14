import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DOMAIN = 'https://wincova.com';

export const useCanonicalUrl = () => {
  const location = useLocation();

  useEffect(() => {
    // Remove existing canonical tag if any
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Create canonical URL (without query params or hash)
    const canonicalUrl = `${DOMAIN}${location.pathname}`;

    // Add new canonical tag
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canonicalUrl);
    document.head.appendChild(link);

    // Cleanup function
    return () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.remove();
      }
    };
  }, [location.pathname]);
};
