import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { Product } from '@/hooks/useProducts';

interface CompareContextType {
  items: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('compare');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('compare', JSON.stringify(items));
  }, [items]);

  const addToCompare = (product: Product) => {
    setItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        toast.info('Este producto ya está en tu lista de comparación');
        return prev;
      }
      if (prev.length >= MAX_COMPARE_ITEMS) {
        toast.error(`Solo puedes comparar hasta ${MAX_COMPARE_ITEMS} productos`);
        return prev;
      }
      toast.success('Producto agregado a comparación');
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === productId);
      if (item) {
        toast.success('Producto eliminado de comparación');
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  const isInCompare = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const clearCompare = () => {
    setItems([]);
    toast.success('Lista de comparación vaciada');
  };

  return (
    <CompareContext.Provider
      value={{
        items,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
};
