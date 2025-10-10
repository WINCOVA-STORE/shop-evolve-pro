import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, Users, DollarSign, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DailyLossCalculatorProps {
  diagnosisScores: {
    performance_score: number;
    seo_score: number;
    conversion_score?: number;
  };
  siteUrl: string;
}

export const DailyLossCalculator = ({ diagnosisScores, siteUrl }: DailyLossCalculatorProps) => {
  const [daysPassed, setDaysPassed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDaysPassed(prev => prev + 1);
    }, 86400000); // 24 horas

    return () => clearInterval(interval);
  }, []);

  // Cálculos agresivos basados en scores bajos
  const avgMonthlyTraffic = 5000; // Estimado conservador
  const avgConversionRate = 2.0; // 2% típico ecommerce
  const avgOrderValue = 75; // Ticket promedio

  // Calcular pérdidas por cada problema
  const performanceLoss = diagnosisScores.performance_score < 70 
    ? Math.round((70 - diagnosisScores.performance_score) * 2.5) // Por cada punto perdido = 2.5% de pérdida
    : 0;

  const seoLoss = diagnosisScores.seo_score < 70
    ? Math.round((70 - diagnosisScores.seo_score) * 3) // SEO impacta más = 3% por punto
    : 0;

  const dailyVisitorsLost = Math.round((avgMonthlyTraffic / 30) * ((performanceLoss + seoLoss) / 100));
  const dailyRevenueLost = Math.round(dailyVisitorsLost * (avgConversionRate / 100) * avgOrderValue);
  const monthlyRevenueLost = dailyRevenueLost * 30;
  const yearlyRevenueLost = dailyRevenueLost * 365;

  // Rankings perdidos por SEO
  const rankingsLost = diagnosisScores.seo_score < 70
    ? Math.round((70 - diagnosisScores.seo_score) / 5)
    : 0;

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive animate-pulse" />
          <CardTitle className="text-xl">
            ⚠️ Lo Que Pierdes CADA DÍA Sin Actuar
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contador en tiempo real */}
        <div className="p-6 bg-destructive/10 rounded-lg border-2 border-destructive/30">
          <p className="text-sm text-muted-foreground mb-2">Pérdidas estimadas HOY:</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-destructive">
              ${dailyRevenueLost.toLocaleString()}
            </span>
            <span className="text-lg text-muted-foreground">/día</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Contador reinicia cada 24 horas
          </p>
        </div>

        {/* Grid de pérdidas */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Visitantes Perdidos</span>
            </div>
            <p className="text-3xl font-bold text-destructive">
              {dailyVisitorsLost}
            </p>
            <p className="text-xs text-muted-foreground mt-1">personas/día</p>
          </div>

          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Conversiones Perdidas</span>
            </div>
            <p className="text-3xl font-bold text-destructive">
              {Math.round(dailyVisitorsLost * (avgConversionRate / 100))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">ventas/día</p>
          </div>

          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Rankings en Google</span>
            </div>
            <p className="text-3xl font-bold text-destructive">
              -{rankingsLost}
            </p>
            <p className="text-xs text-muted-foreground mt-1">posiciones/mes</p>
          </div>
        </div>

        {/* Proyección de pérdidas */}
        <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Si sigues esperando sin actuar:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Esta semana perderás:</span>
              <span className="font-bold text-orange-600">${(dailyRevenueLost * 7).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Este mes perderás:</span>
              <span className="font-bold text-orange-700">${monthlyRevenueLost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground font-medium">Este año perderás:</span>
              <span className="font-bold text-destructive text-lg">${yearlyRevenueLost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Mensaje de urgencia */}
        <div className="p-4 bg-destructive text-destructive-foreground rounded-lg">
          <p className="font-bold text-center text-lg">
            🚨 Tus Competidores NO Están Esperando
          </p>
          <p className="text-sm text-center mt-2 opacity-90">
            Cada día que pasa, ellos capturan los clientes que tú estás perdiendo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
