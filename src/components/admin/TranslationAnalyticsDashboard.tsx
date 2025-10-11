import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, DollarSign, Globe, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export const TranslationAnalyticsDashboard = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['translation-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: branding } = useQuery({
    queryKey: ['translation-branding'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_branding')
        .select('*')
        .eq('store_id', 'wincova_main')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  // Calculate totals
  const totalTranslated = analytics?.reduce((sum, a) => sum + a.products_translated, 0) || 0;
  const totalAICalls = analytics?.reduce((sum, a) => sum + a.ai_calls_used, 0) || 0;
  const totalSaved = analytics?.reduce((sum, a) => sum + Number(a.cost_saved_usd), 0) || 0;
  const totalCost = analytics?.reduce((sum, a) => sum + Number(a.total_cost_usd), 0) || 0;

  // Calculate efficiency
  const efficiency = totalAICalls > 0 ? ((totalTranslated / totalAICalls) * 100).toFixed(0) : 0;

  // By language
  const byLanguage = analytics?.reduce((acc, a) => {
    if (!acc[a.language]) {
      acc[a.language] = { translated: 0, calls: 0 };
    }
    acc[a.language].translated += a.products_translated;
    acc[a.language].calls += a.ai_calls_used;
    return acc;
  }, {} as Record<string, { translated: number; calls: number }>);

  const languageNames: Record<string, string> = {
    es: '🇪🇸 Español',
    fr: '🇫🇷 Français',
    pt: '🇧🇷 Português',
    zh: '🇨🇳 中文'
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Traducidos</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTranslated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              En {Object.keys(byLanguage || {}).length} idiomas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Llamadas a IA</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAICalls.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">
              <TrendingDown className="inline h-3 w-3" /> {efficiency}% eficiencia vs individual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ahorro Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalSaved.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs traducción tradicional
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Real</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Invertido en traducciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Usage (if enabled) */}
      {branding?.api_enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Uso de API Externa</CardTitle>
            <CardDescription>
              Consumo del API público de traducción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {branding.current_api_usage.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  de {branding.monthly_api_quota.toLocaleString()} llamadas mensuales
                </p>
              </div>
              <div className="text-right">
                <Badge variant={
                  (branding.current_api_usage / branding.monthly_api_quota) > 0.8 
                    ? 'destructive' 
                    : 'default'
                }>
                  {((branding.current_api_usage / branding.monthly_api_quota) * 100).toFixed(1)}% usado
                </Badge>
              </div>
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ 
                  width: `${Math.min((branding.current_api_usage / branding.monthly_api_quota) * 100, 100)}%` 
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* By Language */}
      <Card>
        <CardHeader>
          <CardTitle>Traducciones por Idioma</CardTitle>
          <CardDescription>
            Desglose de productos traducidos por idioma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(byLanguage || {}).map(([lang, stats]) => (
              <div key={lang} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{languageNames[lang] || lang}</span>
                  <div>
                    <p className="font-medium">{stats.translated.toLocaleString()} productos</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.calls} llamadas a IA
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {((stats.translated / stats.calls) * 100).toFixed(0)}% eficiencia
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas traducciones realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics?.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">
                    {languageNames[item.language] || item.language}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.products_translated} productos • {item.ai_calls_used} llamadas
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    Ahorro: ${Number(item.cost_saved_usd).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};