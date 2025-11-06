import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  href: string;
}

export const CategoryCard = ({ name, icon: Icon, href }: CategoryCardProps) => {
  return (
    <Link
      to={href}
      className="flex flex-col items-center justify-center gap-2 p-4 bg-card rounded-2xl aspect-square hover:bg-primary/5 transition-all duration-300 hover:scale-105 border border-border/50 hover:border-primary/30 hover:shadow-lg group"
    >
      <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 transition-all duration-300">
        <Icon className="h-7 w-7 text-foreground group-hover:text-primary transition-colors" />
      </div>
      <span className="text-xs font-semibold text-center text-foreground group-hover:text-primary transition-colors leading-tight">
        {name}
      </span>
    </Link>
  );
};
