import { Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FreeShippingBadgeProps {
  variant?: "default" | "large";
}

export const FreeShippingBadge = ({ variant = "default" }: FreeShippingBadgeProps) => {
  if (variant === "large") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20">
        <Truck className="h-5 w-5" />
        <span className="font-semibold text-sm">Envío Gratis</span>
      </div>
    );
  }

  return (
    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
      <Truck className="h-3 w-3 mr-1" />
      Envío Gratis
    </Badge>
  );
};
