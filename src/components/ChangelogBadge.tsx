import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface ChangelogBadgeProps {
  isNew?: boolean;
  isImproved?: boolean;
  className?: string;
}

export const ChangelogBadge = ({ isNew, isImproved, className }: ChangelogBadgeProps) => {
  if (!isNew && !isImproved) return null;

  return (
    <Badge 
      className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white ${className}`}
      variant="default"
    >
      <Sparkles className="h-3 w-3 mr-1" />
      {isNew ? '¡Nuevo!' : '¡Mejorado!'}
    </Badge>
  );
};
