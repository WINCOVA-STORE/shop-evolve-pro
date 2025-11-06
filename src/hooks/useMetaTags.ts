import { useEffect } from 'react';

interface MetaTagsProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}

/**
 * Hook to manage meta tags for SEO
 */
export const useMetaTags = ({ title, description, keywords, image }: MetaTagsProps) => {
  useEffect(() => {
    // Update document title
    document.title = `${title} | Wincova`;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update meta keywords
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      }
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    }

    if (image) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', image);
      }
    }
  }, [title, description, keywords, image]);
};
