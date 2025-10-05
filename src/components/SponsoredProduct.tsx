import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SponsoredProductProps {
  title: string;
  description: string;
  image: string;
  link: string;
}

export const SponsoredProduct = ({ title, description, image, link }: SponsoredProductProps) => {
  return (
    <Card className="col-span-2 lg:col-span-3 xl:col-span-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="w-full sm:w-32 h-32 flex-shrink-0">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Destacado
            </Badge>
          </div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          <Button size="sm" variant="outline">
            Ver más
          </Button>
        </div>
      </div>
    </Card>
  );
};
