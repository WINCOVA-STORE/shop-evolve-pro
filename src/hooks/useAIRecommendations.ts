import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Define tus tipos de datos para productos e historial
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  // ... otras propiedades del producto
}

interface UserHistory {
  browsingHistory: Product[];
  purchaseHistory: Product[];
}

// Inicializa Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Función para obtener recomendaciones genéricas (fallback)
async function getGenericRecommendations(): Promise<Product[]> {
  try {
    // Ejemplo: obtener los 5 productos más nuevos o más vendidos
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false }) // O 'sales_count'
      .limit(5);

    if (error) throw error;
    return data as Product[];
  } catch (error) {
    console.error('Error fetching generic recommendations:', error);
    return [];
  }
}

// Hook principal para recomendaciones AI
export function useAIRecommendations(userId: string | null | undefined) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) {
        // Usuario no logueado o nuevo: fallback a recomendaciones genéricas
        console.log('User not identified, fetching generic recommendations.');
        const generic = await getGenericRecommendations();
        setRecommendations(generic);
        return;
      }

      // 1. Obtener historial de navegación y compras del usuario
      // Esto debería ser implementado con tu lógica de almacenamiento de historial
      // Por ejemplo, desde una tabla de Supabase o localStorage/cookies
      const userHistory: UserHistory = await getUserHistory(userId); // Implementar esta función

      // 2. Llamar a la Edge Function de Supabase
      const response = await fetch('/api/supabase-edge-function', { // Usar un endpoint de API Route para proxy
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          browsingHistory: userHistory.browsingHistory,
          purchaseHistory: userHistory.purchaseHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch AI recommendations');
      }

      const data = await response.json();
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      } else {
        // Si la IA no devuelve recomendaciones, usar fallback
        console.warn('AI returned no recommendations, fetching generic fallback.');
        const generic = await getGenericRecommendations();
        setRecommendations(generic);
      }
    } catch (err: any) {
      console.error('Error fetching AI recommendations:', err);
      setError(err.message || 'An unknown error occurred.');
      // En caso de error en la IA o la llamada, siempre fallback
      const generic = await getGenericRecommendations();
      setRecommendations(generic);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, loading, error };
}

// --- Funciones auxiliares (necesitas implementarlas según tu proyecto) ---

// Esta función DEBE ser implementada para obtener el historial real del usuario.
// Podrías almacenarlo en Supabase (tablas 'user_browsing_history', 'user_purchases')
// o incluso en localStorage para un historial de navegación más efímero.
async function getUserHistory(userId: string): Promise<UserHistory> {
  // Simulación de datos de historial
  // En un proyecto real, consultarías tu base de datos
  // Ejemplo:
  // const { data: browsingData } = await supabase.from('user_browsing_history').select('product_id').eq('user_id', userId).limit(5);
  // const { data: purchaseData } = await supabase.from('user_purchases').select('product_id').eq('user_id', userId).limit(5);

  // Para esta demostración, devolveremos datos mock
  const mockBrowsingHistory: Product[] = [
    { id: 'prod_101', name: 'Smartwatch X', price: 199.99, imageUrl: '/images/smartwatch.jpg' },
    { id: 'prod_105', name: 'Wireless Earbuds Pro', price: 129.99, imageUrl: '/images/earbuds.jpg' },
  ];
  const mockPurchaseHistory: Product[] = [
    { id: 'prod_102', name: 'Gaming Mouse RGB', price: 79.99, imageUrl: '/images/mouse.jpg' },
  ];

  return {
    browsingHistory: mockBrowsingHistory,
    purchaseHistory: mockPurchaseHistory,
  };
}