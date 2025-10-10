import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce'; // Necesitarás instalar esta librería

// Definiciones de tipos para los productos y filtros
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  stock: number;
  imageUrl: string;
}

export interface SearchFilters {
  minPrice: number;
  maxPrice: number;
  categories: string[];
  minRating: number;
  inStock: boolean;
}

export interface SearchResult {
  products: Product[];
  totalResults: number;
  suggestions: string[];
  availableCategories: string[];
}

// --- SIMULACIÓN DE API ---
// En un entorno real, esto sería una llamada a tu backend
const MOCK_PRODUCTS: Product[] = Array.from({ length: 100 }, (_, i) => ({
  id: `prod-${i}`,
  name: `Product ${i} ${String.fromCharCode(65 + (i % 26))} ${i % 5 === 0 ? 'Special' : ''}`,
  description: `This is a beautiful product number ${i}.`,
  price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
  category: ['Electronics', 'Books', 'Home', 'Fashion', 'Sports'][i % 5],
  rating: parseFloat((Math.random() * 5).toFixed(1)),
  stock: Math.floor(Math.random() * 200),
  imageUrl: `https://via.placeholder.com/150?text=Product+${i}`,
}));

const ALL_CATEGORIES = Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)));

interface FetchProductsParams {
  query: string;
  filters: SearchFilters;
  page: number;
  pageSize: number;
}

const fetchProducts = async ({
  query,
  filters,
  page,
  pageSize,
}: FetchProductsParams): Promise<SearchResult> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simula latencia de red

  let filteredProducts = MOCK_PRODUCTS.filter(product => {
    const matchesQuery = query.length < 3 || product.name.toLowerCase().includes(query.toLowerCase());
    const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
    const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category);
    const matchesRating = product.rating >= filters.minRating;
    const matchesStock = !filters.inStock || product.stock > 0;

    return matchesQuery && matchesPrice && matchesCategory && matchesRating && matchesStock;
  });

  // Ordenar por nombre para consistencia en la simulación
  filteredProducts.sort((a, b) => a.name.localeCompare(b.name));

  const totalResults = filteredProducts.length;
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const suggestions: string[] = [];
  if (query.length >= 3) {
    const uniqueNames = new Set<string>();
    MOCK_PRODUCTS.forEach(p => {
      if (p.name.toLowerCase().includes(query.toLowerCase())) {
        uniqueNames.add(p.name);
        // También podemos sugerir categorías si la query es similar
        if (ALL_CATEGORIES.some(cat => cat.toLowerCase().includes(query.toLowerCase()))) {
            ALL_CATEGORIES.forEach(cat => {
                if (cat.toLowerCase().includes(query.toLowerCase())) {
                    uniqueNames.add(cat);
                }
            })
        }
      }
    });
    suggestions.push(...Array.from(uniqueNames).slice(0, 5)); // Limitar a 5 sugerencias
  }

  return {
    products: paginatedProducts,
    totalResults,
    suggestions,
    availableCategories: ALL_CATEGORIES,
  };
};
// --- FIN SIMULACIÓN DE API ---

interface UseAdvancedSearchOptions {
  debounceTime?: number;
  pageSize?: number;
}

export const useAdvancedSearch = (options?: UseAdvancedSearchOptions) => {
  const { debounceTime = 300, pageSize = 10 } = options || {};

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({
    minPrice: 0,
    maxPrice: 200, // Ajustar según el rango de precios de tus productos
    categories: [],
    minRating: 0,
    inStock: false,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [results, setResults] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [debouncedSearchQuery] = useDebounce(searchQuery, debounceTime);

  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({
        query: debouncedSearchQuery,
        filters,
        page: currentPage,
        pageSize,
      });
      setResults(data.products);
      setTotalResults(data.totalResults);
      setSuggestions(data.suggestions);
      setAvailableCategories(data.availableCategories); // Esto solo se cargará una vez o al inicio
    } catch (err) {
      console.error("Failed to fetch search results:", err);
      setError("Failed to load products. Please try again.");
      setResults([]);
      setTotalResults(0);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, filters, currentPage, pageSize]);

  useEffect(() => {
    // Cuando la query o los filtros cambian, resetear a la primera página
    setCurrentPage(1);
    fetchSearchResults();
  }, [debouncedSearchQuery, filters, fetchSearchResults]);

  // Efecto para la paginación
  useEffect(() => {
    fetchSearchResults();
  }, [currentPage, fetchSearchResults]);

  // Para cargar las categorías iniciales (si no se obtienen con cada búsqueda)
  useEffect(() => {
    // En un caso real, podrías tener una llamada separada para obtener todas las categorías
    // setAvailableCategories(ALL_CATEGORIES); // Si las categorías son estáticas
    // O hacer una llamada a la API para obtenerlas
  }, []);

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Calcular el número total de páginas
  const totalPages = useMemo(() => Math.ceil(totalResults / pageSize), [totalResults, pageSize]);

  return {
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    filters,
    setFilters: handleFilterChange,
    results,
    totalResults,
    suggestions,
    availableCategories,
    loading,
    error,
    currentPage,
    totalPages,
    handlePageChange,
  };
};