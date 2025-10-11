import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChangelogCarousel } from "@/components/ChangelogCarousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Sparkles, Clock, TrendingUp, Heart, Shield, Rocket, ExternalLink, Calendar, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es, enUS, fr, pt, zhCN } from "date-fns/locale";

interface ImplementedFeature {
  id: string;
  feature_name: string;
  description: string | null;
  phase_name: string;
  phase_number: number;
  sprint_name: string;
  impact: string;
  completed_at: string;
  notes: string | null;
  execution_mode: string;
  customer_benefit?: string;
}

export default function Changelog() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [features, setFeatures] = useState<ImplementedFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'high-impact'>('all');
  const [carouselLoading, setCarouselLoading] = useState(true);

  // Get date-fns locale based on current language
  const getDateLocale = () => {
    switch (true) {
      case i18n.language?.startsWith('es'): return es;
      case i18n.language?.startsWith('fr'): return fr;
      case i18n.language?.startsWith('pt'): return pt;
      case i18n.language?.startsWith('zh'): return zhCN;
      default: return enUS;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true); // Set loading to true when language changes
    fetchImplementedFeatures();
  }, [i18n.language]); // Re-fetch when language changes

  const fetchImplementedFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('ecommerce_roadmap_items')
        .select('*')
        .eq('status', 'done')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      
      // Transform technical descriptions to customer benefits and translate
      const enrichedData = await Promise.all(
        (data || []).map(async (feature) => {
          try {
            // First get customer benefit in Spanish
            const { data: benefitData } = await supabase.functions.invoke('transform-to-customer-benefits', {
              body: {
                featureName: feature.feature_name,
                technicalDescription: feature.description,
                impact: feature.impact
              }
            });
            
            const originalName = feature.feature_name;
            const customerBenefit = benefitData?.customerBenefit || feature.description || feature.feature_name;
            
            // ALWAYS translate to target language (regardless of frontend language)
            // This ensures backend data (in Spanish) is translated to user's selected language
            try {
              const { data: translatedData } = await supabase.functions.invoke('translate-feature', {
                body: {
                  featureName: originalName,
                  description: customerBenefit,
                  targetLanguage: i18n.language
                }
              });
              
              // Only use translation if it's valid and not empty
              if (translatedData?.translatedName && translatedData?.translatedDescription) {
                return {
                  ...feature,
                  feature_name: translatedData.translatedName,
                  customer_benefit: translatedData.translatedDescription
                };
              }
            } catch (translationError) {
              console.error('Translation error, using original:', translationError);
            }
            
            // Fallback: use original text if translation fails or if in Spanish
            return {
              ...feature,
              feature_name: originalName,
              customer_benefit: customerBenefit
            };
          } catch (error) {
            console.error('Error processing feature:', error);
            // Always return something, never leave empty
            return {
              ...feature,
              feature_name: feature.feature_name,
              customer_benefit: feature.description || feature.feature_name || 'Feature description'
            };
          }
        })
      );
      
      setFeatures(enrichedData);
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFeatures = () => {
    if (filter === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return features.filter(f => new Date(f.completed_at) > oneWeekAgo);
    }
    if (filter === 'high-impact') {
      return features.filter(f => f.impact === 'high');
    }
    return features;
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Rocket className="h-5 w-5 text-primary" />;
      case 'medium':
        return <Sparkles className="h-5 w-5 text-primary/70" />;
      default:
        return <Heart className="h-5 w-5 text-primary/50" />;
    }
  };

  const getImpactLabel = (impact: string) => {
    const labels = {
      high: 'Alto Impacto',
      medium: 'Mejora Importante',
      low: 'Optimización',
    };
    return labels[impact as keyof typeof labels] || 'Mejora';
  };

  const getCategoryIcon = (phaseName: string) => {
    const lower = phaseName.toLowerCase();
    if (lower.includes('compra') || lower.includes('carrito')) return '🛒';
    if (lower.includes('experiencia') || lower.includes('usuario')) return '✨';
    if (lower.includes('producto') || lower.includes('búsqueda')) return '🔍';
    if (lower.includes('seguridad') || lower.includes('cuenta')) return '🔒';
    if (lower.includes('pago') || lower.includes('checkout')) return '💳';
    if (lower.includes('recompensa') || lower.includes('puntos')) return '🎁';
    return '🚀';
  };

  const getCustomerFriendlyCategory = (phaseName: string) => {
    const lower = phaseName.toLowerCase();
    if (lower.includes('funcionalidad crítica') || lower.includes('base')) return t('changelog.shopping_experience');
    if (lower.includes('experiencia')) return t('changelog.comfort_ease');
    if (lower.includes('integración')) return t('changelog.connected_services');
    if (lower.includes('optimización')) return t('changelog.performance');
    return phaseName;
  };

  const getFeatureLink = (feature: ImplementedFeature): string | null => {
    const name = feature.feature_name.toLowerCase();
    const desc = (feature.description || '').toLowerCase();
    
    // Mapeo de funcionalidades a rutas
    if (name.includes('carrito') || name.includes('cart')) return '/';
    if (name.includes('wishlist') || name.includes('deseos')) return '/wishlist';
    if (name.includes('compare') || name.includes('comparar')) return '/compare';
    if (name.includes('search') || name.includes('búsqueda') || name.includes('filtro')) return '/search';
    if (name.includes('checkout') || name.includes('pago')) return '/';
    if (name.includes('perfil') || name.includes('profile') || name.includes('cuenta')) return '/profile';
    if (name.includes('recompensa') || name.includes('reward') || name.includes('puntos')) return '/profile';
    if (name.includes('referral') || name.includes('referir')) return '/refer-earn';
    if (name.includes('track') || name.includes('rastreo')) return '/track-order';
    if (name.includes('faq')) return '/faq';
    
    // Por descripción
    if (desc.includes('carrito')) return '/';
    if (desc.includes('deseos')) return '/wishlist';
    if (desc.includes('comparar')) return '/compare';
    if (desc.includes('buscar') || desc.includes('filtro')) return '/search';
    
    return null;
  };

  const groupedByPhase = getFilteredFeatures().reduce((acc, feature) => {
    const categoryName = getCustomerFriendlyCategory(feature.phase_name);
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(feature);
    return acc;
  }, {} as Record<string, ImplementedFeature[]>);

  // Prepare carousel items from latest 3 high-impact features with AI-generated images
  const [carouselItems, setCarouselItems] = useState<Array<{
    title: string;
    description: string;
    icon: string;
    imageUrl?: string;
  }>>([]);

  useEffect(() => {
    const generateCarouselImages = async () => {
      if (features.length === 0) return;
      
      setCarouselLoading(true);
      const topFeatures = features
        .filter(f => f.impact === 'high')
        .slice(0, 3);

      const itemsWithImages = await Promise.all(
        topFeatures.map(async (f) => {
          try {
            const { data: imageData } = await supabase.functions.invoke('generate-changelog-image', {
              body: {
                featureName: f.feature_name,
                description: f.customer_benefit || f.description || ''
              }
            });

            return {
              title: f.feature_name,
              description: f.customer_benefit || f.description || '',
              icon: getCategoryIcon(f.phase_name),
              imageUrl: imageData?.imageUrl || undefined
            };
          } catch (error) {
            console.error('Error generating image for feature:', error);
            return {
              title: f.feature_name,
              description: f.customer_benefit || f.description || '',
              icon: getCategoryIcon(f.phase_name)
            };
          }
        })
      );

      setCarouselItems(itemsWithImages);
      setCarouselLoading(false);
    };

    if (features.length > 0) {
      generateCarouselImages();
    }
  }, [features, i18n.language]); // Re-generate when language changes

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('changelog.title')}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('changelog.subtitle')}
          </p>
        </div>

        {/* Carousel Banner */}
        {!carouselLoading && <ChangelogCarousel latestFeatures={carouselItems} />}
        {carouselLoading && (
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl p-8 mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <h2 className="text-2xl font-bold text-center">{t('changelog.banner_title')}</h2>
            </div>
            <div className="min-h-[280px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-primary/20">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">{features.length}</div>
              <p className="text-sm text-muted-foreground">{t('changelog.stats.active_improvements')}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-6 text-center">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">
                {features.filter(f => f.execution_mode === 'automatic').length}
              </div>
              <p className="text-sm text-muted-foreground">{t('changelog.stats.ai_powered')}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-6 text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">
                {features.filter(f => f.impact === 'high').length}
              </div>
              <p className="text-sm text-muted-foreground">{t('changelog.stats.high_impact')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="all">
              {t('changelog.filters.all')} ({features.length})
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-2" />
              {t('changelog.filters.recent')}
            </TabsTrigger>
            <TabsTrigger value="high-impact">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t('changelog.filters.featured')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">{t('changelog.loading')}</p>
              </div>
            ) : getFilteredFeatures().length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('changelog.no_improvements')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedByPhase).map(([categoryName, categoryFeatures]) => (
                  <Card key={categoryName} className="overflow-hidden border-primary/10">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-3xl">{getCategoryIcon(categoryName)}</span>
                        <span>{categoryName}</span>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {categoryFeatures.length} {t('changelog.improvements_count')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {categoryFeatures.map((feature) => {
                        const featureLink = getFeatureLink(feature);
                        const isClickable = featureLink !== null;
                        
                        return (
                          <div
                            key={feature.id}
                            onClick={() => isClickable && navigate(featureLink)}
                            className={`group p-6 border rounded-xl hover:shadow-lg hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-background to-primary/[0.02] ${
                              isClickable ? 'cursor-pointer hover:scale-[1.01]' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  {getImpactIcon(feature.impact)}
                                  <h3 className="font-bold text-xl group-hover:text-primary transition-colors flex items-center gap-2">
                                    {feature.feature_name || 'Feature'}
                                    {isClickable && (
                                      <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                  </h3>
                                </div>
                                
                                {/* Customer Benefit - Main focus */}
                                <div className="mb-4 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                                  <p className="text-base leading-relaxed text-foreground font-medium">
                                    {feature.customer_benefit || feature.description || t('changelog.no_improvements')}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {format(new Date(feature.completed_at), "d MMM yyyy", { locale: getDateLocale() })}
                                  </Badge>
                                  {isClickable && (
                                    <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                      {t('changelog.try_it')} →
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
