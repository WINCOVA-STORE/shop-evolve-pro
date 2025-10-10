import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChangelogCarousel } from "@/components/ChangelogCarousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Sparkles, Clock, TrendingUp, Zap, Calendar, Heart, Shield, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  const [features, setFeatures] = useState<ImplementedFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'high-impact'>('all');

  useEffect(() => {
    fetchImplementedFeatures();
  }, []);

  const fetchImplementedFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('ecommerce_roadmap_items')
        .select('*')
        .eq('status', 'done')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      
      // Transform technical descriptions to customer benefits
      const enrichedData = await Promise.all(
        (data || []).map(async (feature) => {
          try {
            const { data: benefitData } = await supabase.functions.invoke('transform-to-customer-benefits', {
              body: {
                featureName: feature.feature_name,
                technicalDescription: feature.description,
                impact: feature.impact
              }
            });
            
            return {
              ...feature,
              customer_benefit: benefitData?.customerBenefit || feature.description
            };
          } catch (error) {
            console.error('Error transforming feature:', error);
            return {
              ...feature,
              customer_benefit: feature.description
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
    if (phaseName.toLowerCase().includes('funcionalidad')) return '🎯';
    if (phaseName.toLowerCase().includes('experiencia')) return '✨';
    if (phaseName.toLowerCase().includes('integración')) return '🔗';
    if (phaseName.toLowerCase().includes('optimización')) return '⚡';
    return '🚀';
  };

  const groupedByPhase = getFilteredFeatures().reduce((acc, feature) => {
    const categoryName = feature.phase_name.replace(/FUNCIONALIDAD CRÍTICA|MEJORAS DE EXPERIENCIA|INTEGRACIONES|OPTIMIZACIONES/gi, '')
      .trim() || feature.phase_name;
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(feature);
    return acc;
  }, {} as Record<string, ImplementedFeature[]>);

  // Prepare carousel items from latest 3 high-impact features
  const carouselItems = features
    .filter(f => f.impact === 'high')
    .slice(0, 3)
    .map(f => ({
      title: f.feature_name,
      description: f.customer_benefit || f.description || '',
      icon: getCategoryIcon(f.phase_name)
    }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Novedades de la Tienda
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubre cómo cada mejora hace tu experiencia más fácil, rápida y segura
          </p>
        </div>

        {/* Carousel Banner */}
        <ChangelogCarousel latestFeatures={carouselItems} />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-primary/20">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">{features.length}</div>
              <p className="text-sm text-muted-foreground">Mejoras Activas</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-6 text-center">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">
                {features.filter(f => f.execution_mode === 'automatic').length}
              </div>
              <p className="text-sm text-muted-foreground">Potenciadas con IA</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-6 text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">
                {features.filter(f => f.impact === 'high').length}
              </div>
              <p className="text-sm text-muted-foreground">De Alto Impacto</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="all">
              Todas ({features.length})
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="h-4 w-4 mr-2" />
              Recientes
            </TabsTrigger>
            <TabsTrigger value="high-impact">
              <TrendingUp className="h-4 w-4 mr-2" />
              Destacadas
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Cargando mejoras...</p>
              </div>
            ) : getFilteredFeatures().length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay mejoras en esta categoría</p>
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
                        {categoryFeatures.length} mejoras que transforman tu experiencia
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {categoryFeatures.map((feature) => (
                        <div
                          key={feature.id}
                          className="group p-6 border rounded-xl hover:shadow-lg hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-background to-primary/[0.02]"
                        >
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                {getImpactIcon(feature.impact)}
                                <h3 className="font-bold text-xl group-hover:text-primary transition-colors">
                                  {feature.feature_name}
                                </h3>
                              </div>
                              
                              {/* Customer Benefit - Main focus */}
                              <div className="mb-4 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                                <p className="text-base leading-relaxed text-foreground font-medium">
                                  {feature.customer_benefit || feature.description || 'Mejora en tu experiencia de compra'}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {format(new Date(feature.completed_at), "d MMM yyyy", { locale: es })}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
