import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Check, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Zap,
  TrendingUp,
  Shield
} from "lucide-react";

interface ManualVsAIComparisonProps {
  changeTitle: string;
  category: string;
  estimatedImpact: number;
}

export const ManualVsAIComparison = ({ 
  changeTitle, 
  category,
  estimatedImpact 
}: ManualVsAIComparisonProps) => {
  // Tiempos agresivos basados en la realidad de Wincova + IA
  const manualTime = category === 'SEO' ? '2-3 semanas' : 
                     category === 'Diseño' ? '3-4 semanas' :
                     category === 'Performance' ? '1-2 semanas' : '2-3 semanas';
  
  const aiTime = category === 'SEO' ? '24-48 horas' :
                 category === 'Diseño' ? '48-72 horas' :
                 category === 'Performance' ? '12-24 horas' : '24-48 horas';

  const manualCost = category === 'SEO' ? 3500 :
                     category === 'Diseño' ? 5000 :
                     category === 'Performance' ? 2500 : 3000;

  const aiCost = 499; // Precio disruptivo
  const savings = Math.round(((manualCost - aiCost) / manualCost) * 100);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Comparación: Método Tradicional vs Agente IA Wincova
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* MÉTODO TRADICIONAL (MANUAL) */}
          <div className="p-6 bg-destructive/5 rounded-lg border-2 border-destructive/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg">❌ Implementación Manual</h4>
              <Badge variant="destructive">Método Antiguo</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">Tiempo: {manualTime}</p>
                  <p className="text-sm text-muted-foreground">
                    Desarrollo lento, múltiples iteraciones, pruebas manuales
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">
                    Costo: ${manualCost.toLocaleString()} - ${(manualCost + 2000).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Desarrollador senior + tiempo + revisiones
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">Alto Riesgo de Errores</p>
                  <p className="text-sm text-muted-foreground">
                    Errores humanos, implementación inconsistente
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">Sin Optimización Continua</p>
                  <p className="text-sm text-muted-foreground">
                    Una vez implementado, se queda estático
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">ROI esperado:</p>
                <p className="text-2xl font-bold text-destructive">
                  +{Math.round(estimatedImpact * 0.6)}%
                </p>
                <p className="text-xs text-muted-foreground">Menor impacto por errores y demoras</p>
              </div>
            </div>
          </div>

          {/* MÉTODO CON AGENTE IA */}
          <div className="p-6 bg-primary/10 rounded-lg border-2 border-primary relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 text-white">
                ⚡ AHORRA {savings}%
              </Badge>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-primary">✅ Con Agente IA Wincova</h4>
              <Badge className="bg-primary">Disruptivo</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-primary">Tiempo: {aiTime}</p>
                  <p className="text-sm text-muted-foreground">
                    Implementación automatizada + pruebas con IA
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-primary">
                    Costo: ${aiCost} fijo
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    💰 Ahorras ${(manualCost - aiCost).toLocaleString()} ({savings}%)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-primary">99.9% Precisión</p>
                  <p className="text-sm text-muted-foreground">
                    IA entrenada en miles de implementaciones
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-primary">Optimización Automática 24/7</p>
                  <p className="text-sm text-muted-foreground">
                    Monitoreo continuo y ajustes automáticos
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-primary/20">
                <p className="text-sm text-muted-foreground">ROI esperado:</p>
                <p className="text-3xl font-bold text-primary">
                  +{estimatedImpact}%
                </p>
                <p className="text-xs text-muted-foreground">Máximo impacto con IA optimizada</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-sm font-bold text-center">
                🎯 Resultado: Mismo objetivo, {savings}% menos costo, 10x más rápido
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Agresivo */}
        <div className="mt-6 p-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg">
          <div className="text-center space-y-3">
            <p className="text-2xl font-bold">
              ¿Seguir Pagando 10x Más y Esperar 10x Más Tiempo?
            </p>
            <p className="text-sm opacity-90">
              O ser inteligente y usar tecnología del 2025
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="mt-4"
            >
              Contratar Agente IA - ${aiCost} (Ahorra ${(manualCost - aiCost).toLocaleString()})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
