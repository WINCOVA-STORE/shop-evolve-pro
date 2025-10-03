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
      className="flex flex-col items-center justify-center gap-3 p-6 bg-card rounded-full aspect-square hover:bg-primary/10 transition-all hover:scale-105 border border-border group"
    >
      <div className="p-4 bg-muted rounded-full group-hover:bg-primary/20 transition-colors">
        <Icon className="h-8 w-8 text-foreground group-hover:text-primary transition-colors" />
      </div>
      <span className="text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors">
        {name}
      </span>
    </Link>
  );
};
