import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  Zap,
  Target,
  BarChart3
} from "lucide-react";

interface ProjectManagementPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimatedDays: number;
  totalChanges: number;
  approvedChanges: number;
}

export const ProjectManagementPreview = ({ 
  open, 
  onOpenChange,
  estimatedDays,
  totalChanges,
  approvedChanges
}: ProjectManagementPreviewProps) => {
  // Calcular fases del proyecto basado en cambios
  const phases = [
    {
      name: "Análisis y Planificación",
      duration: "6-12 horas",
      progress: 100,
      status: "completed",
      tasks: [
        { name: "Auditoría técnica completa", completed: true },
        { name: "Priorización con IA", completed: true },
        { name: "Plan de implementación", completed: true }
      ]
    },
    {
      name: "Implementación Core",
      duration: `${Math.ceil(estimatedDays * 0.4)} días`,
      progress: approvedChanges > 0 ? 60 : 0,
      status: approvedChanges > 0 ? "in-progress" : "pending",
      tasks: [
        { name: `${approvedChanges}/${totalChanges} cambios aprobados`, completed: false },
        { name: "Optimizaciones SEO", completed: false },
        { name: "Mejoras de performance", completed: false },
        { name: "Ajustes de diseño", completed: false }
      ]
    },
    {
      name: "Testing y QA con IA",
      duration: "12-24 horas",
      progress: 0,
      status: "pending",
      tasks: [
        { name: "Pruebas automatizadas", completed: false },
        { name: "Validación de métricas", completed: false },
        { name: "Testing cross-browser", completed: false }
      ]
    },
    {
      name: "Deploy y Monitoreo",
      duration: "6-12 horas",
      progress: 0,
      status: "pending",
      tasks: [
        { name: "Despliegue gradual", completed: false },
        { name: "Configuración de alertas IA", completed: false },
        { name: "Documentación generada", completed: false }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-500">✓ Completado</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500">⚡ En Progreso</Badge>;
      case 'pending':
        return <Badge variant="outline">⏳ Pendiente</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Vista Previa: Sistema de Gestión Wincova PM
          </DialogTitle>
          <DialogDescription>
            Así gestionaríamos tu proyecto con transparencia total y automatización con IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Tiempo Total</span>
                </div>
                <p className="text-2xl font-bold">{estimatedDays}-{estimatedDays + 3}</p>
                <p className="text-xs text-muted-foreground">días hábiles</p>
              </CardContent>
            </Card>

            <Card className="bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Progreso</span>
                </div>
                <p className="text-2xl font-bold">
                  {Math.round((approvedChanges / totalChanges) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {approvedChanges}/{totalChanges} aprobados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-blue-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Equipo IA</span>
                </div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">agentes activos</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Riesgos</span>
                </div>
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-xs text-muted-foreground">detectados</p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline de Fases */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline de Implementación
            </h3>

            {phases.map((phase, idx) => (
              <Card key={idx} className={phase.status === 'in-progress' ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold">{phase.name}</h4>
                        {getStatusBadge(phase.status)}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Duración estimada: {phase.duration}
                      </p>
                    </div>
                  </div>

                  <Progress value={phase.progress} className="mb-3 h-2" />

                  <div className="space-y-2">
                    {phase.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} className="flex items-center gap-2 text-sm">
                        {task.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 flex-shrink-0" />
                        )}
                        <span className={task.completed ? 'text-muted-foreground line-through' : ''}>
                          {task.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features del Sistema */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Incluido en el Sistema de Gestión Wincova PM:
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Dashboard en tiempo real 24/7",
                "Alertas automáticas por IA",
                "Reportes semanales generados automáticamente",
                "Detección de riesgos con IA",
                "Comunicación directa en la plataforma",
                "Métricas de rendimiento en vivo",
                "Historial completo de cambios",
                "Documentación auto-generada"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comparación Sin vs Con PM */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 text-destructive">❌ Sin Gestión Profesional</h4>
                <ul className="space-y-2 text-sm">
                  <li>• No sabes en qué fase está</li>
                  <li>• Comunicación por email caótico</li>
                  <li>• Retrasos de 2-4 semanas</li>
                  <li>• Sin visibilidad de problemas</li>
                  <li>• Costo: $0 + 8-12 semanas perdidas</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 text-primary">✅ Con Wincova PM</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Transparencia total en tiempo real</li>
                  <li>• Todo centralizado en un dashboard</li>
                  <li>• Entrega en {estimatedDays}-{estimatedDays + 3} días</li>
                  <li>• IA detecta y resuelve problemas</li>
                  <li>• Costo: $0 incluido en el proyecto</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Final */}
          <div className="p-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg">
            <div className="text-center space-y-4">
              <BarChart3 className="h-12 w-12 mx-auto" />
              <h3 className="text-2xl font-bold">
                Este Nivel de Control es GRATIS
              </h3>
              <p className="text-sm opacity-90 max-w-2xl mx-auto">
                Incluido automáticamente cuando apruebas cambios. Sin costos adicionales.
                Solo Wincova te da esta transparencia.
              </p>
              <Button 
                size="lg"
                variant="secondary"
                className="mt-4"
                onClick={() => onOpenChange(false)}
              >
                Aprobar Cambios y Activar Sistema PM
              </Button>
              <p className="text-xs opacity-75">
                Ahorra 8-12 semanas de tiempo + elimina 100% del estrés
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
