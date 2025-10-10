import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Link2, 
  AlertTriangle, 
  Timer, 
  ArrowRight, 
  Sparkles,
  Info
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const RoadmapLegend = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                <div className="text-left">
                  <CardTitle className="text-base">📖 Guía de Visualización</CardTitle>
                  <CardDescription>
                    Entiende los colores y badges de las tareas
                  </CardDescription>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {isOpen ? '▼' : '▶'}
              </span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Dependencies */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                  <Link2 className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm">🔗 Dependencias (Azul)</p>
                  <p className="text-xs text-muted-foreground">
                    Indica qué otras tareas deben completarse antes de empezar esta
                  </p>
                </div>
              </div>
            </div>

            {/* Risks */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-orange-700 dark:text-orange-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm">⚠️ Riesgos (Naranja)</p>
                  <p className="text-xs text-muted-foreground">
                    Riesgos técnicos o de negocio identificados automáticamente por IA
                  </p>
                </div>
              </div>
            </div>

            {/* Time Estimation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-semibold text-sm">⏱️ Estimación (Azul Claro)</p>
                  <p className="text-xs text-muted-foreground">
                    Horas calculadas por IA basándose en complejidad y archivos afectados
                  </p>
                </div>
              </div>
            </div>

            {/* Implementation Order */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="font-semibold text-sm">🎯 Orden (Púrpura)</p>
                  <p className="text-xs text-muted-foreground">
                    Secuencia óptima de implementación calculada por impacto vs esfuerzo
                  </p>
                </div>
              </div>
            </div>

            {/* AI Badge */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI
                </Badge>
                <div>
                  <p className="font-semibold text-sm">✨ Badge AI (Índigo)</p>
                  <p className="text-xs text-muted-foreground">
                    Indica que la tarea fue generada automáticamente por IA
                  </p>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-md">
                  <Sparkles className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm">💡 Recomendaciones (Índigo Claro)</p>
                  <p className="text-xs text-muted-foreground">
                    Sugerencias de la IA para optimizar la implementación
                  </p>
                </div>
              </div>
            </div>

            {/* Priority Badges */}
            <div className="space-y-2">
              <p className="font-semibold text-sm mb-2">🏷️ Prioridades</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-red-100 text-red-600 dark:bg-red-950">CRITICAL</Badge>
                <Badge className="bg-orange-100 text-orange-600 dark:bg-orange-950">HIGH</Badge>
                <Badge className="bg-yellow-100 text-yellow-600 dark:bg-yellow-950">MEDIUM</Badge>
                <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800">LOW</Badge>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
