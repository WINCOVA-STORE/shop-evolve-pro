import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/hooks/useProducts';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (newQuantity > product.stock) {
          toast({
            variant: "destructive",
            title: "Stock insuficiente",
            description: `Solo hay ${product.stock} unidades disponibles`,
          });
          return prev;
        }
        
        toast({
          title: "Cantidad actualizada",
          description: `${product.name} - ${newQuantity} unidades`,
        });
        
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      if (quantity > product.stock) {
        toast({
          variant: "destructive",
          title: "Stock insuficiente",
          description: `Solo hay ${product.stock} unidades disponibles`,
        });
        return prev;
      }

      toast({
        title: "Producto agregado",
        description: `${product.name} ha sido agregado al carrito`,
      });

      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === productId);
      if (item) {
        toast({
          title: "Producto eliminado",
          description: `${item.name} ha sido eliminado del carrito`,
        });
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          if (quantity > item.stock) {
            toast({
              variant: "destructive",
              title: "Stock insuficiente",
              description: `Solo hay ${item.stock} unidades disponibles`,
            });
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Carrito vaciado",
      description: "Todos los productos han sido eliminados",
    });
  };

  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
