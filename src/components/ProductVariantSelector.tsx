import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  available: boolean;
  image?: string;
}

export interface VariantGroup {
  name: string;
  variants: ProductVariant[];
}

interface ProductVariantSelectorProps {
  groups: VariantGroup[];
  onVariantChange: (groupName: string, variantId: string) => void;
  selectedVariants?: Record<string, string>;
  className?: string;
}

/**
 * Selector visual de variantes estilo Amazon
 * Soporta colores con preview, tamaños y atributos personalizados
 * 
 * @example
 * <ProductVariantSelector
 *   groups={[
 *     {
 *       name: "Color",
 *       variants: [
 *         { id: "red", name: "Rojo", value: "#FF0000", available: true },
 *         { id: "blue", name: "Azul", value: "#0000FF", available: true }
 *       ]
 *     },
 *     {
 *       name: "Talla",
 *       variants: [
 *         { id: "s", name: "S", value: "S", available: true },
 *         { id: "m", name: "M", value: "M", available: false }
 *       ]
 *     }
 *   ]}
 *   onVariantChange={(group, variantId) => console.log(group, variantId)}
 * />
 */
export const ProductVariantSelector = ({
  groups,
  onVariantChange,
  selectedVariants = {},
  className
}: ProductVariantSelectorProps) => {
  const [localSelected, setLocalSelected] = useState<Record<string, string>>(selectedVariants);

  const handleSelect = (groupName: string, variantId: string) => {
    const newSelected = { ...localSelected, [groupName]: variantId };
    setLocalSelected(newSelected);
    onVariantChange(groupName, variantId);
  };

  const isColorVariant = (value: string) => {
    return value.startsWith('#') || value.startsWith('rgb');
  };

  return (
    <div className={cn("space-y-6", className)}>
      {groups.map((group) => {
        const selectedId = localSelected[group.name];
        const selectedVariant = group.variants.find(v => v.id === selectedId);
        const isColor = group.variants.some(v => isColorVariant(v.value));

        return (
          <div key={group.name} className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-foreground">
                {group.name}:
              </span>
              {selectedVariant && (
                <span className="text-sm font-medium text-primary">
                  {selectedVariant.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {group.variants.map((variant) => {
                const isSelected = localSelected[group.name] === variant.id;
                
                if (isColor) {
                  // Color swatches estilo Amazon
                  return (
                    <button
                      key={variant.id}
                      onClick={() => variant.available && handleSelect(group.name, variant.id)}
                      disabled={!variant.available}
                      className={cn(
                        "relative w-10 h-10 rounded-full border-2 transition-all duration-200",
                        isSelected 
                          ? "border-primary ring-2 ring-primary/30 scale-110" 
                          : "border-border hover:border-primary/50 hover:scale-105",
                        !variant.available && "opacity-40 cursor-not-allowed"
                      )}
                      style={{ backgroundColor: variant.value }}
                      aria-label={`Seleccionar ${variant.name}`}
                      title={variant.name}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white drop-shadow-lg" strokeWidth={3} />
                        </div>
                      )}
                      {!variant.available && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-[2px] bg-destructive rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                }

                // Botones de texto para tallas y otros atributos
                return (
                  <Button
                    key={variant.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => variant.available && handleSelect(group.name, variant.id)}
                    disabled={!variant.available}
                    className={cn(
                      "min-w-[3rem] transition-all duration-200",
                      isSelected && "ring-2 ring-primary/30",
                      !variant.available && "opacity-40 line-through"
                    )}
                  >
                    {variant.name}
                  </Button>
                );
              })}
            </div>

            {!selectedVariant && (
              <p className="text-xs text-muted-foreground">
                Selecciona una opción
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
