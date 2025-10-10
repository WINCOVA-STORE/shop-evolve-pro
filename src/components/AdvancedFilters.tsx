import React, { useState, useEffect, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

// Simulamos un tipo de producto para el ejemplo
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  inStock: boolean;
  rating: number;
}

// Simulamos un hook para obtener productos y sus metadatos
// En una aplicación real, esto vendría de tu API o estado global
interface ProductSearchHookResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  // Estos metadatos son clave para los filtros inteligentes
  // Representan los valores MIN y MAX actuales en los productos filtrados/disponibles
  minPriceAvailable: number;
  maxPriceAvailable: number;
  availableCategories: { name: string; count: number }[];
  availableBrands: { name: string; count: number }[];
  totalResults: number;
}

// Simulación de un hook de búsqueda de productos
// En tu aplicación, reemplazarías esto con tu lógica real de búsqueda de productos
const useProductSearch = (filters: {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  inStock: boolean;
  query: string; // Para una posible barra de búsqueda global
}): ProductSearchHookResult => {
  const allProducts: Product[] = [
    { id: '1', name: 'Laptop Pro', price: 1200, category: 'Electronics', brand: 'BrandA', inStock: true, rating: 4.5 },
    { id: '2', name: 'Smartphone X', price: 800, category: 'Electronics', brand: 'BrandB', inStock: true, rating: 4.0 },
    { id: '3', name: 'Wireless Headphones', price: 150, category: 'Accessories', brand: 'BrandC', inStock: false, rating: 3.8 },
    { id: '4', name: 'Mechanical Keyboard', price: 200, category: 'Peripherals', brand: 'BrandA', inStock: true, rating: 4.7 },
    { id: '5', name: 'Gaming Mouse', price: 70, category: 'Peripherals', brand: 'BrandD', inStock: true, rating: 4.2 },
    { id: '6', name: '4K Monitor', price: 500, category: 'Electronics', brand: 'BrandB', inStock: true, rating: 4.6 },
    { id: '7', name: 'USB Hub', price: 30, category: 'Accessories', brand: 'BrandC', inStock: true, rating: 3.5 },
    { id: '8', name: 'External SSD', price: 180, category: 'Storage', brand: 'BrandD', inStock: true, rating: 4.9 },
    { id: '9', name: 'Webcam HD', price: 60, category: 'Peripherals', brand: 'BrandA', inStock: false, rating: 3.9 },
    { id: '10', name: 'Smartwatch', price: 250, category: 'Wearables', brand: 'BrandB', inStock: true, rating: 4.1 },
    { id: '11', name: 'Tablet Pro', price: 600, category: 'Electronics', brand: 'BrandA', inStock: true, rating: 4.3 },
    { id: '12', name: 'Bluetooth Speaker', price: 90, category: 'Audio', brand: 'BrandC', inStock: true, rating: 4.0 },
    { id: '13', name: 'Ergonomic Chair', price: 300, category: 'Furniture', brand: 'BrandE', inStock: true, rating: 4.8 },
    { id: '14', name: 'Desk Lamp', price: 40, category: 'Lighting', brand: 'BrandE', inStock: true, rating: 3.7 },
    { id: '15', name: 'Coffee Machine', price: 100, category: 'Appliances', brand: 'BrandF', inStock: true, rating: 4.2 },
  ];

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [minPriceAvailable, setMinPriceAvailable] = useState<number>(0);
  const [maxPriceAvailable, setMaxPriceAvailable] = useState<number>(0);
  const [availableCategories, setAvailableCategories] = useState<{ name: string; count: number }[]>([]);
  const [availableBrands, setAvailableBrands] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simular un retardo de red
    const timer = setTimeout(() => {
      let currentFiltered = allProducts.filter(product => {
        const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
        const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category);
        const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand);
        const matchesStock = !filters.inStock || product.inStock;
        const matchesQuery = product.name.toLowerCase().includes(filters.query.toLowerCase());
        return matchesPrice && matchesCategory && matchesBrand && matchesStock && matchesQuery;
      });

      // Calcular metadatos basados en los productos filtrados
      const prices = currentFiltered.map(p => p.price);
      const minP = prices.length > 0 ? Math.min(...prices) : 0;
      const maxP = prices.length > 0 ? Math.max(...prices) : 0;

      const categoryCounts = currentFiltered.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const categories = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

      const brandCounts = currentFiltered.reduce((acc, product) => {
        acc[product.brand] = (acc[product.brand] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const brands = Object.entries(brandCounts).map(([name, count]) => ({ name, count }));

      setFilteredProducts(currentFiltered);
      setMinPriceAvailable(minP);
      setMaxPriceAvailable(maxP);
      setAvailableCategories(categories);
      setAvailableBrands(brands);
      setLoading(false);
    }, 300); // Pequeño retardo para simular carga

    return () => clearTimeout(timer);
  }, [filters]);

  return {
    products: filteredProducts,
    loading,
    error: null,
    minPriceAvailable,
    maxPriceAvailable,
    availableCategories,
    availableBrands,
    totalResults: filteredProducts.length,
  };
};

interface AdvancedFiltersProps {
  initialPriceRange?: [number, number];
  maxOverallPrice?: number; // El precio máximo global posible
  minOverallPrice?: number; // El precio mínimo global posible
  onFilterChange: (filters: {
    priceRange: [number, number];
    categories: string[];
    brands: string[];
    inStock: boolean;
  }) => void;
  // Prop para simular la búsqueda general
  searchQuery: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  initialPriceRange = [0, 1500], // Rango inicial por defecto
  maxOverallPrice = 1500, // Precio máximo global
  minOverallPrice = 0, // Precio mínimo global
  onFilterChange,
  searchQuery,
}) => {
  const [priceRange, setPriceRange] = useState<[number, number]>(initialPriceRange);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Usamos un estado intermedio para los filtros que se pasan al hook
  // Esto previene un loop infinito si el hook usa `onFilterChange` para actualizar
  const [currentSearchFilters, setCurrentSearchFilters] = useState({
    priceRange: initialPriceRange,
    categories: selectedCategories,
    brands: selectedBrands,
    inStock: inStockOnly,
    query: searchQuery,
  });

  // Efecto para actualizar `currentSearchFilters` cuando cambian los filtros locales
  useEffect(() => {
    setCurrentSearchFilters({
      priceRange,
      categories: selectedCategories,
      brands: selectedBrands,
      inStock: inStockOnly,
      query: searchQuery,
    });
  }, [priceRange, selectedCategories, selectedBrands, inStockOnly, searchQuery]);

  // Hook que nos devuelve los productos y metadatos *basados en los filtros actuales*
  const {
    loading,
    minPriceAvailable,
    maxPriceAvailable,
    availableCategories,
    availableBrands,
    totalResults,
  } = useProductSearch(currentSearchFilters);

  // Efecto para notificar al componente padre cuando los filtros cambian
  useEffect(() => {
    onFilterChange({
      priceRange,
      categories: selectedCategories,
      brands: selectedBrands,
      inStock: inStockOnly,
    });
  }, [priceRange, selectedCategories, selectedBrands, inStockOnly, onFilterChange]);

  const handlePriceChange = useCallback((value: number[]) => {
    setPriceRange(value as [number, number]);
  }, []);

  const handleCategoryChange = useCallback((category: string, checked: boolean) => {
    setSelectedCategories(prev =>
      checked ? [...prev, category] : prev.filter(c => c !== category)
    );
  }, []);

  const handleBrandChange = useCallback((brand: string, checked: boolean) => {
    setSelectedBrands(prev =>
      checked ? [...prev, brand] : prev.filter(b => b !== brand)
    );
  }, []);

  const handleInStockChange = useCallback((checked: boolean) => {
    setInStockOnly(checked);
  }, []);

  const resetFilters = useCallback(() => {
    setPriceRange(initialPriceRange);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setInStockOnly(false);
  }, [initialPriceRange]);

  // Determinar los rangos de precios para el slider
  // Si no hay productos, o los disponibles están fuera del rango global, usar el rango global.
  const sliderMin = minPriceAvailable > 0 && minPriceAvailable < maxOverallPrice ? minPriceAvailable : minOverallPrice;
  const sliderMax = maxPriceAvailable > 0 && maxPriceAvailable > minOverallPrice ? maxPriceAvailable : maxOverallPrice;

  // Ajustar el rango de precios seleccionado si excede los límites disponibles
  useEffect(() => {
    if (priceRange[0] < minOverallPrice) {
      setPriceRange(prev => [minOverallPrice, prev[1]]);
    }
    if (priceRange[1] > maxOverallPrice) {
      setPriceRange(prev => [prev[0], maxOverallPrice]);
    }
  }, [minOverallPrice, maxOverallPrice, priceRange]);


  return (
    <div className="w-64 p-4 border-r bg-background h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Reiniciar
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['price', 'category', 'brand', 'stock']} className="w-full">
        {/* Filtro de Precio */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-base">Precio</AccordionTrigger>
          <AccordionContent className="pt-2">
            {loading ? (
              <div className="text-center text-sm text-muted-foreground">Cargando rangos...</div>
            ) : (
              <>
                {/* Solo mostrar el slider si hay un rango de precios válido */}
                {sliderMin < sliderMax && (
                  <Slider
                    min={sliderMin}
                    max={sliderMax}
                    step={10}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    className="mb-4"
                  />
                )}
                <div className="flex justify-between gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="min-price">Min:</Label>
                    <Input
                      id="min-price"
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange([Number(e.target.value), priceRange[1]])}
                      className="w-20"
                      min={sliderMin}
                      max={priceRange[1]}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Label htmlFor="max-price">Max:</Label>
                    <Input
                      id="max-price"
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange([priceRange[0], Number(e.target.value)])}
                      className="w-20"
                      min={priceRange[0]}
                      max={sliderMax}
                    />
                  </div>
                </div>
                {sliderMin >= sliderMax && (
                  <p className="text-sm text-muted-foreground mt-2">
                    No hay productos disponibles en este rango de precios.
                  </p>
                )}
                {/* Si no hay productos en el rango actual, pero sí en otros, indicarlo */}
                {totalResults === 0 && (
                  <p className="text-sm text-red-500 mt-2">
                    No hay productos que coincidan con los filtros actuales.
                  </p>
                )}
              </>
            )}
            <Separator className="my-4" />
          </AccordionContent>
        </AccordionItem>

        {/* Filtro de Categorías */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-base">Categoría</AccordionTrigger>
          <AccordionContent className="pt-2">
            {loading ? (
              <div className="text-center text-sm text-muted-foreground">Cargando categorías...</div>
            ) : availableCategories.length > 0 ? (
              <div className="space-y-2">
                {availableCategories.map(cat => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${cat.name}`}
                        checked={selectedCategories.includes(cat.name)}
                        onCheckedChange={(checked) => handleCategoryChange(cat.name, checked as boolean)}
                      />
                      <Label htmlFor={`category-${cat.name}`}>{cat.name}</Label>
                    </div>
                    <Badge variant="secondary">{cat.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay categorías disponibles.</p>
            )}
            <Separator className="my-4" />
          </AccordionContent>
        </AccordionItem>

        {/* Filtro de Marcas */}
        <AccordionItem value="brand">
          <AccordionTrigger className="text-base">Marca</AccordionTrigger>
          <AccordionContent className="pt-2">
            {loading ? (
              <div className="text-center text-sm text-muted-foreground">Cargando marcas...</div>
            ) : availableBrands.length > 0 ? (
              <div className="space-y-2">
                {availableBrands.map(brand => (
                  <div key={brand.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand.name}`}
                        checked={selectedBrands.includes(brand.name)}
                        onCheckedChange={(checked) => handleBrandChange(brand.name, checked as boolean)}
                      />
                      <Label htmlFor={`brand-${brand.name}`}>{brand.name}</Label>
                    </div>
                    <Badge variant="secondary">{brand.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay marcas disponibles.</p>
            )}
            <Separator className="my-4" />
          </AccordionContent>
        </AccordionItem>

        {/* Filtro de En Stock */}
        <AccordionItem value="stock">
          <AccordionTrigger className="text-base">Disponibilidad</AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={inStockOnly}
                  onCheckedChange={(checked) => handleInStockChange(checked as boolean)}
                />
                <Label htmlFor="in-stock">Mostrar solo en stock</Label>
              </div>
              {/* No mostramos conteo aquí, ya que el filtro se aplica antes de contar */}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};