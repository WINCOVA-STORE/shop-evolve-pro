import React, { useState, useEffect } from 'react';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

// Shadcn/ui components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react'; // Icono para el drawer en mobile

const SearchPage: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    results,
    totalResults,
    suggestions,
    availableCategories,
    loading,
    error,
    currentPage,
    totalPages,
    handlePageChange,
  } = useAdvancedSearch({ pageSize: 12 }); // Mostrar 12 productos por página

  // Estado local para el slider de precio (para mostrar el valor actual mientras se arrastra)
  const [priceRange, setPriceRange] = useState<[number, number]>([filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    setPriceRange([filters.minPrice, filters.maxPrice]);
  }, [filters.minPrice, filters.maxPrice]);

  const handlePriceChangeCommit = (value: [number, number]) => {
    setFilters({ minPrice: value[0], maxPrice: value[1] });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setFilters({ categories: [...filters.categories, category] });
    } else {
      setFilters({ categories: filters.categories.filter(c => c !== category) });
    }
  };

  const handleRatingChange = (value: string) => {
    setFilters({ minRating: parseFloat(value) });
  };

  const handleStockChange = (checked: boolean) => {
    setFilters({ inStock: checked });
  };

  const renderProductCard = (product: typeof results[0]) => (
    <Card key={product.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-t-md" />
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <CardTitle className="text-lg font-semibold mb-1 truncate">{product.name}</CardTitle>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-base font-bold text-gray-900 dark:text-gray-50 mb-1">
                <span>${product.price.toFixed(2)}</span>
                <Badge variant="secondary">{product.category}</Badge>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>Rating: {product.rating} ★</span>
                <span className="ml-auto">Stock: {product.stock}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFilters = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Precio</h3>
        <div className="px-1">
          <Slider
            min={0}
            max={200} // Asegúrate de que esto coincida con el maxPrice en useAdvancedSearch
            step={1}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            onValueCommit={(value) => handlePriceChangeCommit(value as [number, number])}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>${priceRange[0].toFixed(2)}</span>
            <span>${priceRange[1].toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3">Categorías</h3>
        <div className="space-y-2">
          {availableCategories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
              />
              <label htmlFor={`category-${category}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3">Rating mínimo</h3>
        <Select value={filters.minRating.toString()} onValueChange={handleRatingChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un rating" />
          </SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3, 4, 5].map(rating => (
              <SelectItem key={rating} value={rating.toString()}>
                {rating} Estrellas o más
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3">Disponibilidad</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock}
            onCheckedChange={(checked) => handleStockChange(checked as boolean)}
          />
          <label htmlFor="in-stock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            En Stock
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Búsqueda de Productos</h1>

      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Busca productos por nombre..."
          className="w-full pr-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery.length >= 3 && suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                onClick={() => setSearchQuery(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtros para desktop */}
        <aside className="hidden lg:block lg:w-1/4">
          {renderFilters()}
        </aside>

        {/* Filtros para mobile (Sheet/Drawer) */}
        <div className="lg:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Menu className="mr-2 h-4 w-4" /> Abrir Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[300px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros de Búsqueda</SheetTitle>
                <SheetDescription>
                  Ajusta los filtros para encontrar el producto perfecto.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                {renderFilters()}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Resultados de búsqueda */}
        <main className="flex-1">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="flex flex-col h-full">
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-md"></div>
                  <CardContent className="p-4 flex-grow flex flex-col">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-auto"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 text-center">{error}</p>}

          {!loading && !error && results.length === 0 && (
            <p className="text-center text-gray-500">No se encontraron productos que coincidan con tu búsqueda.</p>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Mostrando {results.length} de {totalResults} resultados.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(renderProductCard)}
              </div>

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;