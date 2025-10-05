import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface StickyFiltersProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

export const StickyFilters = ({ sortBy, onSortChange }: StickyFiltersProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Sticky Filters - Amazon Style */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-40 p-4">
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="newest">Más Recientes</SelectItem>
              <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
            </SelectContent>
          </Select>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Filtros avanzados próximamente
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Filters Bar */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="newest">Más Recientes</SelectItem>
              <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
