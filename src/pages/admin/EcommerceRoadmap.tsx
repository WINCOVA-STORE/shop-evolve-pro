import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Filter, RefreshCw, Download } from "lucide-react";
import { useRoadmapItems } from "@/hooks/useRoadmapItems";
import { RoadmapProgressCard } from "@/components/admin/RoadmapProgressCard";
import { RoadmapItemCard } from "@/components/admin/RoadmapItemCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const EcommerceRoadmap = () => {
  const navigate = useNavigate();
  const { items, progress, loading, updateItemStatus, refetch } = useRoadmapItems();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Group items by phase
  const phaseGroups = useMemo(() => {
    const groups: Record<number, typeof items> = {};
    items.forEach((item) => {
      if (!groups[item.phase_number]) {
        groups[item.phase_number] = [];
      }
      groups[item.phase_number].push(item);
    });
    return groups;
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const statusMatch = filterStatus === 'all' || item.status === filterStatus;
      const phaseMatch = filterPhase === 'all' || item.phase_number.toString() === filterPhase;
      return statusMatch && phaseMatch;
    });
  }, [items, filterStatus, filterPhase]);

  // Group by sprint for display
  const sprintGroups = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};
    filteredItems.forEach((item) => {
      const key = `${item.phase_number}.${item.sprint_number}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return groups;
  }, [filteredItems]);

  const phases = [
    { number: 1, name: 'FUNCIONALIDAD CRÍTICA', color: 'bg-red-500' },
    { number: 2, name: 'OPTIMIZACIÓN UX/CONVERSIÓN', color: 'bg-orange-500' },
    { number: 3, name: 'SOPORTE & ENGAGEMENT', color: 'bg-yellow-500' },
    { number: 4, name: 'ADMIN & ANALYTICS', color: 'bg-green-500' },
    { number: 5, name: 'OPTIMIZACIÓN & GO-LIVE', color: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">🚀 E-Commerce Roadmap</h1>
              <Badge variant="outline" className="text-lg">
                Talla Mundial
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Sistema de auditoría y seguimiento en tiempo real del proyecto E-Commerce Wincova
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Button variant="outline" onClick={() => window.open('/ECOMMERCE_ROADMAP.md', '_blank')}>
              <Download className="mr-2 h-4 w-4" />
              Ver Roadmap Completo
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <RoadmapProgressCard progress={progress} loading={loading} />

        {/* Filters */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
                <CardDescription>
                  Filtra las tareas por estado, fase o sprint
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="todo">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="done">Completada</SelectItem>
                    <SelectItem value="blocked">Bloqueada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPhase} onValueChange={setFilterPhase}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Fase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las fases</SelectItem>
                    {phases.map((phase) => (
                      <SelectItem key={phase.number} value={phase.number.toString()}>
                        Fase {phase.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Phases Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">Todas las Fases</TabsTrigger>
            {phases.map((phase) => (
              <TabsTrigger key={phase.number} value={phase.number.toString()}>
                Fase {phase.number}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All Phases */}
          <TabsContent value="all" className="space-y-6 mt-6">
            {phases.map((phase) => {
              const phaseItems = phaseGroups[phase.number] || [];
              if (phaseItems.length === 0) return null;

              return (
                <Card key={phase.number}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded ${phase.color}`} />
                      <div>
                        <CardTitle>Fase {phase.number}: {phase.name}</CardTitle>
                        <CardDescription>
                          {phaseItems.filter(i => i.status === 'done').length} de {phaseItems.length} completadas
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {phaseItems
                        .filter(item => filterStatus === 'all' || item.status === filterStatus)
                        .map((item) => (
                          <RoadmapItemCard
                            key={item.id}
                            item={item}
                            onStatusChange={updateItemStatus}
                          />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Individual Phase Tabs */}
          {phases.map((phase) => (
            <TabsContent key={phase.number} value={phase.number.toString()} className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded ${phase.color}`} />
                    <div>
                      <CardTitle>Fase {phase.number}: {phase.name}</CardTitle>
                      <CardDescription>
                        Tareas detalladas de la fase {phase.number}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {(phaseGroups[phase.number] || [])
                      .filter(item => filterStatus === 'all' || item.status === filterStatus)
                      .map((item) => (
                        <RoadmapItemCard
                          key={item.id}
                          item={item}
                          onStatusChange={updateItemStatus}
                        />
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default EcommerceRoadmap;
