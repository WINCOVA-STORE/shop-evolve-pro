import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, Info, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MARKET_SOURCES, IMPACT_FORMULAS, getDataDisclaimer } from "@/lib/marketData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DailyLossCalculatorProps {
  diagnosisScores: {
    performance_score: number;
    seo_score: number;
    conversion_score?: number;
  };
  siteUrl: string;
}

export const DailyLossCalculator = ({ diagnosisScores, siteUrl }: DailyLossCalculatorProps) => {
  const [showMethodology, setShowMethodology] = useState(false);

  // Obtener datos actualizados dinámicamente
  const perfSource = MARKET_SOURCES.performance;
  const seoSource = MARKET_SOURCES.seo;
  const convSource = MARKET_SOURCES.conversion;
  const disclaimer = getDataDisclaimer();

  // CÁLCULOS BASADOS EN FÓRMULAS ACTUALIZADAS
  const performanceImpactPct = IMPACT_FORMULAS.performanceImpact(diagnosisScores.performance_score);
  const seoImpactPct = IMPACT_FORMULAS.seoImpact(diagnosisScores.seo_score);
  const totalImpactPct = performanceImpactPct + seoImpactPct;
  const estimatedRankingDrop = IMPACT_FORMULAS.rankingDrop(diagnosisScores.seo_score);

  return (
    <TooltipProvider>
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive animate-pulse" />
              <CardTitle className="text-xl">
                ⚠️ Impacto de Problemas Detectados
              </CardTitle>
            </div>
            <Dialog open={showMethodology} onOpenChange={setShowMethodology}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Metodología
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>🔬 Metodología y Fuentes de Datos</DialogTitle>
                  <DialogDescription>
                    Todos nuestros cálculos están basados en estudios verificables de la industria
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 mt-4">
                  {/* Disclaimer de Actualización */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      📅 Datos Actualizados Dinámicamente
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {disclaimer.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {disclaimer.transparency}
                    </p>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      📊 Fuente 1: {perfSource.name} ({perfSource.years})
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {perfSource.description}
                    </p>
                    <ul className="text-sm space-y-1 ml-4">
                      {perfSource.keyFindings.map((finding, idx) => (
                        <li key={idx}>• {finding}</li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-xs">
                        Última actualización: {perfSource.lastUpdated}
                      </Badge>
                      <a 
                        href={perfSource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Ver estudio <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      🔍 Fuente 2: {seoSource.name} ({seoSource.years})
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {seoSource.description}
                    </p>
                    <ul className="text-sm space-y-1 ml-4">
                      {seoSource.keyFindings.map((finding, idx) => (
                        <li key={idx}>• {finding}</li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-xs">
                        Última actualización: {seoSource.lastUpdated}
                      </Badge>
                      <a 
                        href={seoSource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Ver análisis <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      🛒 Fuente 3: {convSource.name} ({convSource.years})
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {convSource.description}
                    </p>
                    <ul className="text-sm space-y-1 ml-4">
                      {convSource.keyFindings.map((finding, idx) => (
                        <li key={idx}>• {finding}</li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-xs">
                        Última actualización: {convSource.lastUpdated}
                      </Badge>
                      <a 
                        href={convSource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Ver investigación <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-bold mb-2">📐 Nuestros Cálculos</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-semibold text-orange-900 dark:text-orange-100">1. Impacto de Performance:</p>
                        <code className="block bg-background p-2 rounded mt-1 text-xs">
                          Performance Impact (%) = ((90 - tu_score) / 10) × 7%
                        </code>
                        <p className="text-muted-foreground mt-1">
                          Ejemplo: Score 65 = ((90-65)/10) × 7 = 17.5% pérdida de conversiones
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-orange-900 dark:text-orange-100">2. Impacto de SEO:</p>
                        <code className="block bg-background p-2 rounded mt-1 text-xs">
                          SEO Impact (%) = ((80 - tu_score) / 10) × 15%
                        </code>
                        <p className="text-muted-foreground mt-1">
                          Ejemplo: Score 70 = ((80-70)/10) × 15 = 15% pérdida de tráfico
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-bold mb-2 text-green-900 dark:text-green-100">✅ Transparencia Total</h4>
                    <p className="text-sm text-muted-foreground">
                      No inventamos datos. Mostramos PORCENTAJES de impacto basados en tu score real vs. 
                      benchmarks de industria. Para calcular pérdidas en $, necesitarías conectar tu 
                      Google Analytics para obtener tráfico y conversiones reales.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Impacto por Score */}
          <div className="p-6 bg-destructive/10 rounded-lg border-2 border-destructive/30">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">Pérdida Estimada Total:</p>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Basado en estudios de Google y Backlinko. Ver "Metodología" para detalles.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-destructive">
                {totalImpactPct}%
              </span>
              <span className="text-lg text-muted-foreground">de tu potencial</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Combinación de problemas de performance y SEO
            </p>
          </div>

          {/* Desglose de Impactos */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">Impacto Performance</span>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Cálculo:</p>
                    <p className="text-xs">((90 - {diagnosisScores.performance_score}) / 10) × 7%</p>
                    <p className="text-xs mt-2">Fuente: {perfSource.name} {perfSource.lastUpdated}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-3xl font-bold text-destructive">
                -{performanceImpactPct}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">conversiones perdidas</p>
            </div>

            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">Impacto SEO</span>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Cálculo:</p>
                    <p className="text-xs">((80 - {diagnosisScores.seo_score}) / 10) × 15%</p>
                    <p className="text-xs mt-2">Fuente: {seoSource.name} {seoSource.lastUpdated}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-3xl font-bold text-destructive">
                -{seoImpactPct}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">tráfico orgánico perdido</p>
            </div>
          </div>

          {/* Estimación de Rankings */}
          {estimatedRankingDrop > 0 && (
            <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Posiciones de Ranking Estimadas Perdidas:</p>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Aproximación basada en tu SEO score</p>
                    <p className="text-xs mt-1">Cada 5 puntos perdidos ≈ 1 posición en Google</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                ~{estimatedRankingDrop} posiciones
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                por debajo de tu potencial
              </p>
            </div>
          )}

          {/* Advertencia de Datos */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              💡 ¿Quieres Números Exactos en Dólares?
            </h4>
            <p className="text-xs text-muted-foreground">
              Para calcular pérdidas específicas en $ necesitamos conectar tu <strong>Google Analytics</strong>.
              Esto nos daría tu tráfico real, tasa de conversión actual, y ticket promedio.
              Sin estos datos, solo podemos mostrar porcentajes de impacto basados en estudios de industria.
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              Conectar Google Analytics
            </Button>
          </div>

          {/* Mensaje de urgencia con respaldo */}
          <div className="p-4 bg-destructive text-destructive-foreground rounded-lg">
            <p className="font-bold text-center text-lg">
              🚨 Datos Reales, No Propaganda
            </p>
            <p className="text-sm text-center mt-2 opacity-90">
              Todo cálculo está respaldado por estudios verificables. Click en "Metodología" arriba para ver fuentes.
            </p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
