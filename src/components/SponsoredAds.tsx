import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SponsoredAd {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  badge?: string;
}

export const SponsoredAds = () => {
  const { t } = useTranslation();

  // Static sponsored ads - can be made dynamic later
  const ads: SponsoredAd[] = [
    {
      id: "1",
      title: t('ads.premium_service'),
      description: t('ads.premium_service_desc'),
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      link: "#",
      badge: t('ads.featured')
    },
    {
      id: "2",
      title: t('ads.fast_delivery'),
      description: t('ads.fast_delivery_desc'),
      image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop",
      link: "#",
      badge: t('ads.partner')
    },
    {
      id: "3",
      title: t('ads.tech_support'),
      description: t('ads.tech_support_desc'),
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
      link: "#"
    }
  ];

  return (
    <Card className="p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg text-primary">{t('ads.sponsored')}</h3>
      </div>
      
      <div className="space-y-4">
        {ads.map((ad) => (
          <Card 
            key={ad.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
          >
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={ad.image} 
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {ad.badge && (
                <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                  {ad.badge}
                </Badge>
              )}
            </div>
            <div className="p-3 space-y-2">
              <h4 className="font-semibold text-sm line-clamp-1">{ad.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{ad.description}</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs"
                asChild
              >
                <a href={ad.link} target="_blank" rel="noopener noreferrer">
                  {t('ads.learn_more')}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
