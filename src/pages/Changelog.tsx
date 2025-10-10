import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Sparkles, Clock, TrendingUp, Zap, Calendar } from "lucide-react";
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
      setFeatures(data || []);
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
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <Sparkles className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  const groupedByPhase = getFilteredFeatures().reduce((acc, feature) => {
    if (!acc[feature.phase_name]) {
      acc[feature.phase_name] = [];
    }
    acc[feature.phase_name].push(feature);
    return acc;
  }, {} as Record<string, ImplementedFeature[]>);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Novedades de la Tienda</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Descubre todas las mejoras y nuevas funcionalidades implementadas
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {features.length} Mejoras Implementadas
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              {features.filter(f => f.execution_mode === 'automatic').length} Con IA
            </Badge>
          </div>
        </div>

        {/* Filtros */}
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
              Alto Impacto
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Cargando novedades...</p>
              </div>
            ) : getFilteredFeatures().length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay funcionalidades en esta categoría</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedByPhase).map(([phaseName, phaseFeatures]) => (
                  <Card key={phaseName}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-primary rounded" />
                        {phaseName}
                      </CardTitle>
                      <CardDescription>
                        {phaseFeatures.length} funcionalidades implementadas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {phaseFeatures.map((feature) => (
                        <div
                          key={feature.id}
                          className="p-4 border rounded-lg hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getImpactIcon(feature.impact)}
                                <h3 className="font-semibold text-lg">{feature.feature_name}</h3>
                              </div>
                              {feature.description && (
                                <p className="text-muted-foreground mb-3">
                                  {feature.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={getImpactBadge(feature.impact)}>
                                  Impacto: {feature.impact.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">
                                  {feature.sprint_name}
                                </Badge>
                                {feature.execution_mode === 'automatic' && (
                                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Implementado con IA
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(feature.completed_at), "d 'de' MMMM, yyyy", { locale: es })}
                              </div>
                              <div className="mt-1">
                                {format(new Date(feature.completed_at), 'HH:mm', { locale: es })}
                              </div>
                            </div>
                          </div>
                          {feature.notes && (
                            <div className="mt-3 p-3 bg-muted rounded text-sm">
                              <strong className="text-primary">Notas: </strong>
                              {feature.notes}
                            </div>
                          )}
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
