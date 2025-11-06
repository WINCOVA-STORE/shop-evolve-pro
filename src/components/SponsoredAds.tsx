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
    <Card className="p-2.5 border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-xs text-primary">{t('ads.sponsored')}</h3>
      </div>
      
      <div className="space-y-2.5">
        {ads.slice(0, 2).map((ad) => (
          <Card 
            key={ad.id} 
            className="overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
          >
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={ad.image} 
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {ad.badge && (
                <Badge className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                  {ad.badge}
                </Badge>
              )}
            </div>
            <div className="p-2 space-y-1.5">
              <h4 className="font-semibold text-xs line-clamp-1">{ad.title}</h4>
              <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">{ad.description}</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-[10px] h-7"
                asChild
              >
                <a href={ad.link} target="_blank" rel="noopener noreferrer">
                  {t('ads.learn_more')}
                  <ExternalLink className="ml-1 h-2.5 w-2.5" />
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
