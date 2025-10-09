import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Shield,
  Eye,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  FileText,
  HelpCircle,
  Info,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

interface Diagnosis {
  id: string;
  client_name: string;
  site_url: string;
  platform: string;
  performance_score: number;
  seo_score: number;
  security_score: number;
  accessibility_score: number;
  compliance_score: number;
  overall_score: number;
  competitors_data: any;
  diagnosis_data: any;
}

interface Change {
  id: string;
  category: string;
  title: string;
  description: string;
  technical_details: string;
  safety_score: number;
  impact_score: number;
  complexity_score: number;
  confidence_score: number;
  risk_level: string;
  estimated_performance_gain: number;
  estimated_conversion_gain: number;
  estimated_revenue_impact: number;
  status: string;
  approval_required: boolean;
  before_image_url: string | null;
  after_image_url: string | null;
}

export default function WincovaDiagnosis() {
  const { diagnosisId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [generatingVisuals, setGeneratingVisuals] = useState<string | null>(null);
  const changeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchDiagnosis();
  }, [diagnosisId]);

  const fetchDiagnosis = async () => {
    try {
      setIsLoading(true);

      // Fetch diagnosis
      const { data: diagnosisData, error: diagnosisError } = await supabase
        .from('wincova_diagnoses')
        .select('*')
        .eq('id', diagnosisId)
        .single();

      if (diagnosisError) throw diagnosisError;
      setDiagnosis(diagnosisData);

      // Fetch changes
      const { data: changesData, error: changesError } = await supabase
        .from('wincova_changes')
        .select('*')
        .eq('diagnosis_id', diagnosisId)
        .order('impact_score', { ascending: false });

      if (changesError) throw changesError;
      setChanges(changesData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVisuals = async (change: Change) => {
    if (!diagnosis) return;

    try {
      setGeneratingVisuals(change.id);

      // Guardar la posición del scroll antes de generar
      const changeElement = changeRefs.current[change.id];
      
      const { data, error } = await supabase.functions.invoke('wincova-generate-visuals', {
        body: {
          changeTitle: change.title,
          changeDescription: change.description,
          category: change.category,
          siteUrl: diagnosis.site_url
        }
      });

      if (error) throw error;

      // Update the change with the generated images
      const { error: updateError } = await supabase
        .from('wincova_changes')
        .update({
          before_image_url: data.beforeImageUrl,
          after_image_url: data.afterImageUrl,
        })
        .eq('id', change.id);

      if (updateError) throw updateError;

      toast({
        title: "Visualización generada",
        description: "Las imágenes de antes/después están listas",
      });

      await fetchDiagnosis();
      
      // Mantener el scroll en la misma posición después de actualizar
      setTimeout(() => {
        if (changeElement) {
          changeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
    } catch (error: any) {
      console.error("Error generating visuals:", error);
      toast({
        title: "Error",
        description: "No se pudieron generar las visualizaciones: " + error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingVisuals(null);
    }
  };

  const handleToggleApproval = async (changeId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'approved' ? 'proposed' : 'approved';
      const { error } = await supabase
        .from('wincova_changes')
        .update({
          status: newStatus,
          approved_at: newStatus === 'approved' ? new Date().toISOString() : null,
        })
        .eq('id', changeId);

      if (error) throw error;

      toast({
        title: newStatus === 'approved' ? "Cambio aprobado" : "Aprobación cancelada",
        description: newStatus === 'approved' 
          ? "El cambio ha sido marcado para implementación" 
          : "El cambio ha vuelto a estado propuesto",
      });

      fetchDiagnosis();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const glossary = {
    "Safety Score": {
      title: "Nivel de Seguridad",
      description: "Indica qué tan seguro es implementar este cambio. Un puntaje alto significa que el cambio no afectará negativamente tu sitio."
    },
    "Impact Score": {
      title: "Impacto Esperado",
      description: "Mide el beneficio que este cambio traerá a tu sitio. Un puntaje alto significa mayor mejora en rendimiento, conversiones o experiencia del usuario."
    },
    "Complexity": {
      title: "Nivel de Complejidad",
      description: "Indica qué tan complejo es implementar este cambio. Un puntaje bajo significa que es fácil y rápido de implementar."
    },
    "AI Confidence": {
      title: "Confianza de la IA",
      description: "Nivel de certeza de nuestra IA en la recomendación. Un puntaje alto significa que la IA está muy segura de que este cambio es beneficioso."
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getRiskBadge = (risk: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive",
    };
    return <Badge variant={variants[risk] || "default"}>{risk.toUpperCase()}</Badge>;
  };

  const filteredChanges = selectedCategory === "all"
    ? changes
    : changes.filter(c => c.category === selectedCategory);

  const categories = ["all", ...new Set(changes.map(c => c.category))];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Cargando diagnóstico...</p>
        </div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Diagnóstico no encontrado</p>
          <Button onClick={() => navigate('/wincova')} className="mt-4">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          {/* Branding Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => navigate('/wincova')} className="mb-4 -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-2 h-12 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">{diagnosis.client_name}</h1>
                  <a 
                    href={diagnosis.site_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {diagnosis.site_url}
                  </a>
                </div>
              </div>
            </div>
            
            {/* Glossary Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Glosario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Glosario de Términos</DialogTitle>
                  <DialogDescription>
                    Explicación de las métricas utilizadas en el diagnóstico
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {Object.entries(glossary).map(([key, value]) => (
                    <div key={key} className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold text-lg">{value.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{value.description}</p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Scores Dashboard */}
          <div className="grid md:grid-cols-6 gap-4 mb-8">
            <Card className="bg-card border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Puntuación General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-5xl font-bold ${getScoreColor(diagnosis.overall_score)}`}>
                  {Math.round(diagnosis.overall_score)}
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <Progress value={diagnosis.overall_score} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-card hover:border-primary/50 transition-colors cursor-help">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm">Velocidad</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getScoreColor(diagnosis.performance_score)}`}>
                      {Math.round(diagnosis.performance_score)}
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Velocidad de Carga</p>
                <p className="text-sm">Qué tan rápido carga tu sitio web. Un sitio más rápido mantiene a los visitantes y mejora las ventas.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-card hover:border-primary/50 transition-colors cursor-help">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm">SEO</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getScoreColor(diagnosis.seo_score)}`}>
                      {Math.round(diagnosis.seo_score)}
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Posicionamiento en Google</p>
                <p className="text-sm">Qué tan fácil es que Google encuentre y muestre tu sitio. Mejor SEO = más visitantes orgánicos.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-card hover:border-primary/50 transition-colors cursor-help">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm">Seguridad</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getScoreColor(diagnosis.security_score)}`}>
                      {Math.round(diagnosis.security_score)}
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Protección del Sitio</p>
                <p className="text-sm">Qué tan protegido está tu sitio contra amenazas. Un sitio seguro genera confianza en tus clientes.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-card hover:border-primary/50 transition-colors cursor-help">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm">Accesibilidad</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getScoreColor(diagnosis.accessibility_score)}`}>
                      {Math.round(diagnosis.accessibility_score)}
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Facilidad de Uso</p>
                <p className="text-sm">Qué tan fácil es usar tu sitio para todos, incluyendo personas con discapacidades.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-card hover:border-primary/50 transition-colors cursor-help">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm">Cumplimiento</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getScoreColor(diagnosis.compliance_score)}`}>
                      {Math.round(diagnosis.compliance_score)}
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Normativas Legales</p>
                <p className="text-sm">Si tu sitio cumple con leyes de privacidad y regulaciones web internacionales.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Changes Section */}
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <CardTitle className="text-2xl">Mejoras Recomendadas ({changes.length})</CardTitle>
              </div>
              <CardDescription>
                Ordenadas por impacto y facilidad de implementación
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {/* Category Filter */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
                <TabsList className="bg-muted/50">
                  {categories.map(cat => (
                    <TabsTrigger key={cat} value={cat} className="capitalize">
                      {cat === "all" ? "Todas" : cat} ({cat === "all" ? changes.length : changes.filter(c => c.category === cat).length})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Changes List */}
              <div className="space-y-6">
                {filteredChanges.map((change) => (
                  <Card 
                    key={change.id}
                    ref={(el) => changeRefs.current[change.id] = el}
                    className="border-l-4 hover:shadow-md transition-shadow" 
                    style={{
                      borderLeftColor: change.risk_level === 'low' ? 'hsl(var(--primary))' :
                        change.risk_level === 'medium' ? '#eab308' :
                        change.risk_level === 'high' ? '#ef4444' : '#dc2626'
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="capitalize font-medium">{change.category}</Badge>
                            <Badge 
                              variant={change.risk_level === 'low' ? 'secondary' : change.risk_level === 'high' ? 'destructive' : 'default'}
                              className="capitalize"
                            >
                              {change.risk_level === 'low' ? 'Fácil' : change.risk_level === 'medium' ? 'Medio' : 'Complejo'}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">{change.title}</CardTitle>
                          <CardDescription className="text-base leading-relaxed">
                            {change.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* AI Scores with Tooltips */}
                      <div className="grid md:grid-cols-4 gap-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-2 cursor-help">
                              <div className="flex items-center gap-2 text-sm">
                                <Shield className="w-4 h-4 text-primary" />
                                <span className="font-medium">Seguridad</span>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </div>
                              <div className="flex items-center gap-3">
                                <Progress value={change.safety_score} className="flex-1 h-2" />
                                <span className="text-lg font-bold min-w-[3ch]">
                                  {Math.round(change.safety_score)}
                                  <span className="text-xs text-muted-foreground">/100</span>
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold">Nivel de Seguridad</p>
                            <p className="text-sm">Qué tan seguro es este cambio. Un puntaje alto significa bajo riesgo.</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-2 cursor-help">
                              <div className="flex items-center gap-2 text-sm">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="font-medium">Impacto</span>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </div>
                              <div className="flex items-center gap-3">
                                <Progress value={change.impact_score} className="flex-1 h-2" />
                                <span className="text-lg font-bold min-w-[3ch]">
                                  {Math.round(change.impact_score)}
                                  <span className="text-xs text-muted-foreground">/100</span>
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold">Beneficio Esperado</p>
                            <p className="text-sm">Cuánto mejorará tu sitio. Mayor puntaje = mayor beneficio.</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-2 cursor-help">
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="font-medium">Dificultad</span>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </div>
                              <div className="flex items-center gap-3">
                                <Progress value={change.complexity_score} className="flex-1 h-2" />
                                <span className="text-lg font-bold min-w-[3ch]">
                                  {Math.round(change.complexity_score)}
                                  <span className="text-xs text-muted-foreground">/100</span>
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold">Nivel de Complejidad</p>
                            <p className="text-sm">Qué tan difícil es implementar. Menor puntaje = más fácil.</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-2 cursor-help">
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span className="font-medium">Confianza</span>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </div>
                              <div className="flex items-center gap-3">
                                <Progress value={change.confidence_score} className="flex-1 h-2" />
                                <span className="text-lg font-bold min-w-[3ch]">
                                  {Math.round(change.confidence_score)}
                                  <span className="text-xs text-muted-foreground">/100</span>
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold">Confianza de la IA</p>
                            <p className="text-sm">Certeza en la recomendación. Mayor puntaje = más segura.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Visual Before/After Section */}
                      {change.before_image_url && change.after_image_url ? (
                        <div className="border rounded-lg overflow-hidden bg-muted/30">
                          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-3 border-b">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-primary" />
                              <h4 className="font-semibold text-sm">Visualización del Cambio</h4>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Compara cómo se ve ahora vs. cómo se verá después del cambio
                            </p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-0">
                            <div className="relative group">
                              <div className="absolute top-3 left-3 z-10">
                                <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                                  ❌ Antes
                                </Badge>
                              </div>
                              <img 
                                src={change.before_image_url} 
                                alt="Estado actual"
                                className="w-full h-auto object-cover"
                              />
                              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                            </div>
                            <div className="relative group border-l">
                              <div className="absolute top-3 left-3 z-10">
                                <Badge variant="default" className="bg-primary text-primary-foreground">
                                  ✅ Después
                                </Badge>
                              </div>
                              <img 
                                src={change.after_image_url} 
                                alt="Estado mejorado"
                                className="w-full h-auto object-cover"
                              />
                              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/0 transition-colors" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleGenerateVisuals(change)}
                          variant="outline"
                          className="w-full border-dashed"
                          disabled={generatingVisuals === change.id}
                        >
                          {generatingVisuals === change.id ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                              Generando visualización...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Ver Antes/Después con IA
                            </>
                          )}
                        </Button>
                      )}

                      {/* Technical Details */}
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                          <span className="group-open:rotate-90 transition-transform">▶</span>
                          Detalles técnicos
                        </summary>
                        <div className="mt-3 p-4 bg-muted/50 rounded-lg text-sm leading-relaxed border">
                          {change.technical_details}
                        </div>
                      </details>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleToggleApproval(change.id, change.status)}
                        variant={change.status === 'approved' ? 'secondary' : 'default'}
                        className="w-full"
                        size="lg"
                      >
                        {change.status === 'approved' ? (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar Aprobación
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Aprobar para Implementación
                          </>
                        )}
                      </Button>
                      
                      {change.status === 'approved' && (
                        <p className="text-xs text-center text-muted-foreground">
                          Este cambio está listo para ser implementado por el equipo de Wincova
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </TooltipProvider>
  );
}
