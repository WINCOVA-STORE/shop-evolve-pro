import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Upload,
  X,
  Target,
  DollarSign,
  Loader2,
  Clock,
  AlertTriangle,
  ArrowRight,
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
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const changeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchDiagnosis();
  }, [diagnosisId]);

  const fetchDiagnosis = async () => {
    try {
      setIsLoading(true);

      const { data: diagnosisData, error: diagnosisError } = await supabase
        .from('wincova_diagnoses')
        .select('*')
        .eq('id', diagnosisId)
        .single();

      if (diagnosisError) throw diagnosisError;

      const { data: changesData, error: changesError } = await supabase
        .from('wincova_changes')
        .select('*')
        .eq('diagnosis_id', diagnosisId)
        .order('impact_score', { ascending: false });

      if (changesError) throw changesError;

      setDiagnosis(diagnosisData);
      setChanges(changesData || []);
    } catch (error: any) {
      console.error('Error fetching diagnosis:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el diagnóstico",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChanges = async () => {
    const { data: changesData } = await supabase
      .from('wincova_changes')
      .select('*')
      .eq('diagnosis_id', diagnosisId)
      .order('impact_score', { ascending: false });

    setChanges(changesData || []);
  };

  const handleImageUpload = async (changeId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Archivo inválido",
        description: "Por favor sube una imagen (PNG, JPG, WEBP)",
        variant: "destructive"
      });
      return;
    }

    setUploadingImage(changeId);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });

      const base64Image = reader.result as string;

      const { error: updateError } = await supabase
        .from('wincova_changes')
        .update({ before_image_url: base64Image })
        .eq('id', changeId);

      if (updateError) throw updateError;

      await fetchChanges();
      
      toast({
        title: "✅ Imagen cargada",
        description: "Ahora genera la versión mejorada"
      });

    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la imagen",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(null);
    }
  };

  const handleGenerateVisuals = async (changeId: string) => {
    if (!diagnosis) return;
    
    const change = changes.find(c => c.id === changeId);
    if (!change) return;

    if (!change.before_image_url) {
      setGeneratingVisuals(changeId);
      
      try {
        const { data, error } = await supabase.functions.invoke('wincova-generate-visuals', {
          body: {
            changeTitle: change.title,
            changeDescription: change.description,
            category: change.category,
            siteUrl: diagnosis.site_url
          }
        });

        if (error) {
          if (error.message?.includes('NO_SCREENSHOT')) {
            toast({
              title: "Screenshot no disponible",
              description: "Por favor sube una imagen real de tu sitio",
              variant: "destructive"
            });
            return;
          }
          throw error;
        }

        await supabase
          .from('wincova_changes')
          .update({ before_image_url: data.beforeImageUrl })
          .eq('id', changeId);
          
        await fetchChanges();
        
        toast({
          title: "Screenshot capturado",
          description: "Ahora genera la visualización mejorada"
        });

      } catch (error: any) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: error.message || "No se pudo capturar screenshot",
          variant: "destructive"
        });
      } finally {
        setGeneratingVisuals(null);
      }
      return;
    }

    setGeneratingVisuals(changeId);

    try {
      const { data, error } = await supabase.functions.invoke('wincova-generate-visuals', {
        body: {
          changeTitle: change.title,
          changeDescription: change.description,
          category: change.category,
          siteUrl: diagnosis.site_url
        }
      });

      if (error) throw error;

      await supabase
        .from('wincova_changes')
        .update({ after_image_url: data.afterImageUrl })
        .eq('id', changeId);

      await fetchChanges();
      
      toast({
        title: "Visualización generada",
        description: "La mejora se aplicó sobre tu imagen real"
      });

      setTimeout(() => {
        changeRefs.current[changeId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo generar visualización",
        variant: "destructive"
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

  const getProgressColor = (score: number): string => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const shouldGenerateVisuals = (category: string, title: string): boolean => {
    const noVisualCategories = ['backend', 'database', 'api', 'security', 'server'];
    const noVisualKeywords = [
      'código', 'función', 'backend', 'servidor', 'base de datos', 
      'api', 'endpoint', 'cache', 'log', 'error handling',
      'authentication', 'authorization', 'token', 'session'
    ];
    
    const lowerCategory = category.toLowerCase();
    const lowerTitle = title.toLowerCase();
    
    if (noVisualCategories.some(cat => lowerCategory.includes(cat))) {
      return false;
    }
    
    if (noVisualKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return false;
    }
    
    return true;
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
          <Button variant="ghost" onClick={() => navigate('/wincova')} className="mb-6 -ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          {/* Hero Section con Resumen Ejecutivo */}
          <div className="bg-gradient-to-br from-primary/10 via-background to-background p-8 rounded-2xl mb-8 border-2 border-primary/20">
            <div className="mb-6">
              <Badge variant="outline" className="mb-3">
                <Target className="w-3 h-3 mr-1" />
                Análisis Completado
              </Badge>
              <h1 className="text-4xl font-bold mb-2">{diagnosis.client_name}</h1>
              <p className="text-xl text-muted-foreground mb-4">{diagnosis.site_url}</p>
              
              {/* Resumen Ejecutivo */}
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <Card className="bg-background/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">ROI Estimado</span>
                    </div>
                    <p className="text-2xl font-bold">
                      ${changes?.reduce((sum, c) => sum + (c.estimated_revenue_impact || 0), 0).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Ingresos adicionales anuales</p>
                  </CardContent>
                </Card>

                <Card className="bg-background/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">Mejoras Detectadas</span>
                    </div>
                    <p className="text-2xl font-bold">{changes?.length || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {changes?.filter(c => c.risk_level === 'low').length || 0} de bajo riesgo
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-background/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Tiempo Estimado</span>
                    </div>
                    <p className="text-2xl font-bold">2-4 sem</p>
                    <p className="text-xs text-muted-foreground mt-1">Implementación completa</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="flex gap-4 mt-6">
              <Button size="lg" className="gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Aprobar Cambios Prioritarios
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline">
                    <Info className="w-5 h-5 mr-2" />
                    Entender Métricas
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
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${getProgressColor(diagnosis.performance_score)}`}
                        style={{ width: `${diagnosis.performance_score}%` }}
                      />
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
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${getProgressColor(diagnosis.seo_score)}`}
                        style={{ width: `${diagnosis.seo_score}%` }}
                      />
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
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${getProgressColor(diagnosis.security_score)}`}
                        style={{ width: `${diagnosis.security_score}%` }}
                      />
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
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${getProgressColor(diagnosis.accessibility_score)}`}
                        style={{ width: `${diagnosis.accessibility_score}%` }}
                      />
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
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${getProgressColor(diagnosis.compliance_score)}`}
                        style={{ width: `${diagnosis.compliance_score}%` }}
                      />
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
                Ordenadas por impacto y ROI estimado
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
                <TabsList className="bg-muted/50">
                  {categories.map(cat => (
                    <TabsTrigger key={cat} value={cat} className="capitalize">
                      {cat === "all" ? "Todas" : cat} ({cat === "all" ? changes.length : changes.filter(c => c.category === cat).length})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

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
                            {change.estimated_revenue_impact && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                +${change.estimated_revenue_impact}/año
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl mb-2">{change.title}</CardTitle>
                          <CardDescription className="text-base leading-relaxed">
                            {change.description}
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => handleToggleApproval(change.id, change.status)}
                          variant={change.status === 'approved' ? 'default' : 'outline'}
                          size="sm"
                        >
                          {change.status === 'approved' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Aprobado
                            </>
                          ) : (
                            'Aprobar'
                          )}
                        </Button>
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

                      {/* Sistema de Imágenes Reales */}
                      {shouldGenerateVisuals(change.category, change.title) && (
                        <div className="mt-6 space-y-4">
                          {/* Sin imagen "antes" - ofrecer subir o capturar */}
                          {!change.before_image_url && (
                            <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
                              <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h4 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
                                      Imagen Real Requerida
                                    </h4>
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                                      Para crear una comparación auténtica, necesitamos una imagen real de tu sitio.
                                      Solo trabajamos con imágenes reales para mostrarte exactamente cómo se verá el cambio.
                                    </p>
                                    
                                    <div className="flex gap-3">
                                      <Label htmlFor={`upload-${change.id}`} className="cursor-pointer">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors">
                                          <Upload className="w-4 h-4" />
                                          Subir Imagen de Mi Sitio
                                        </div>
                                        <Input
                                          id={`upload-${change.id}`}
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleImageUpload(change.id, file);
                                          }}
                                          disabled={uploadingImage === change.id}
                                        />
                                      </Label>
                                      
                                      <Button
                                        onClick={() => handleGenerateVisuals(change.id)}
                                        disabled={generatingVisuals === change.id}
                                        variant="outline"
                                        size="sm"
                                      >
                                        {generatingVisuals === change.id ? (
                                          <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Capturando...
                                          </>
                                        ) : (
                                          <>
                                            <ImageIcon className="w-4 h-4 mr-2" />
                                            O Capturar Screenshot
                                          </>
                                        )}
                                      </Button>
                                    </div>

                                    {uploadingImage === change.id && (
                                      <div className="flex items-center gap-2 mt-3 text-sm text-yellow-700">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Subiendo imagen...
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Con imagen "antes", sin "después" */}
                          {change.before_image_url && !change.after_image_url && (
                            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                              <CardContent className="pt-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-sm font-medium">Tu Sitio Actual (Real)</p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                          await supabase
                                            .from('wincova_changes')
                                            .update({ before_image_url: null })
                                            .eq('id', change.id);
                                          fetchChanges();
                                        }}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <img 
                                      src={change.before_image_url} 
                                      alt="Estado actual"
                                      className="w-full rounded border shadow-lg"
                                    />
                                  </div>
                                  <div className="flex items-center justify-center">
                                    <Button
                                      onClick={() => handleGenerateVisuals(change.id)}
                                      disabled={generatingVisuals === change.id}
                                      size="lg"
                                      className="gap-2"
                                    >
                                      {generatingVisuals === change.id ? (
                                        <>
                                          <Loader2 className="w-5 h-5 animate-spin" />
                                          Aplicando con IA...
                                        </>
                                      ) : (
                                        <>
                                          <Zap className="w-5 h-5" />
                                          Generar Versión Mejorada
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Comparación completa */}
                          {change.before_image_url && change.after_image_url && (
                            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                              <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-4">
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                                    Comparación Real: Antes vs Después
                                  </h4>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium mb-2 text-center">
                                      Tu Sitio Ahora (Imagen Real)
                                    </p>
                                    <img 
                                      src={change.before_image_url} 
                                      alt="Estado actual"
                                      className="w-full rounded border shadow-lg"
                                    />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium mb-2 text-center">
                                      Con Esta Mejora Aplicada
                                    </p>
                                    <img 
                                      src={change.after_image_url} 
                                      alt="Mejora aplicada"
                                      className="w-full rounded border shadow-lg ring-2 ring-green-500/50"
                                    />
                                  </div>
                                </div>
                                <div className="mt-4 p-3 bg-background rounded text-center">
                                  <p className="text-sm text-muted-foreground">
                                    ✓ Esta visualización se generó aplicando los cambios sobre la imagen REAL de tu sitio
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
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
