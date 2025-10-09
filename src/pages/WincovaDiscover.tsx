import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Brain, 
  Sparkles, 
  Target,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function WincovaDiscover() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [siteUrl, setSiteUrl] = useState("");
  const [clientName, setClientName] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAddCompetitor = () => {
    if (competitorInput.trim() && competitors.length < 3) {
      setCompetitors([...competitors, competitorInput.trim()]);
      setCompetitorInput("");
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const handleStartDiagnosis = async () => {
    if (!siteUrl || !clientName) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa URL del sitio y nombre del cliente",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);

      const { data, error } = await supabase.functions.invoke('wincova-diagnose', {
        body: {
          site_url: siteUrl,
          client_name: clientName,
          competitors: competitors,
        },
      });

      if (error) throw error;

      toast({
        title: "¡Diagnóstico completado!",
        description: `Hemos analizado ${siteUrl} y encontrado ${data.changes_count} oportunidades de mejora`,
      });

      // Navegar al diagnóstico
      navigate(`/wincova/diagnosis/${data.diagnosis_id}`);
    } catch (error: any) {
      console.error('Error en diagnóstico:', error);
      toast({
        title: "Error en análisis",
        description: error.message || "No se pudo completar el diagnóstico",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <Badge className="mb-2" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Wincova 360° Safe Deploy
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold">
            Transforma sitios web con IA
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Diagnóstico inteligente, cambios seguros, resultados medibles
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 text-primary mb-2" />
              <CardTitle>AI Guardian Layer</CardTitle>
              <CardDescription>
                Cada cambio clasificado por seguridad, impacto y complejidad
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Intelligence Network</CardTitle>
              <CardDescription>
                Aprendizaje colectivo de miles de implementaciones exitosas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Revenue Impact Tracker</CardTitle>
              <CardDescription>
                Correlación directa entre mejoras técnicas y resultados de negocio
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Analysis Form */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="w-6 h-6" />
              Iniciar Diagnóstico Inteligente
            </CardTitle>
            <CardDescription>
              Analizaremos tu sitio web y proporcionaremos un plan de acción personalizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL del Sitio Web *</label>
              <Input
                type="url"
                placeholder="https://ejemplo.com"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Cliente *</label>
              <Input
                type="text"
                placeholder="Empresa ABC"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Competidores (opcional, máx. 3)
              </label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://competidor.com"
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCompetitor()}
                  disabled={isAnalyzing || competitors.length >= 3}
                />
                <Button
                  onClick={handleAddCompetitor}
                  disabled={isAnalyzing || competitors.length >= 3 || !competitorInput.trim()}
                  variant="outline"
                >
                  Agregar
                </Button>
              </div>
              {competitors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {competitors.map((comp, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveCompetitor(idx)}
                    >
                      {comp} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleStartDiagnosis}
              disabled={isAnalyzing}
              size="lg"
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando con IA...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Iniciar Diagnóstico 360°
                </>
              )}
            </Button>

            {isAnalyzing && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analizando performance y SEO...</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluando seguridad y compliance...</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Comparando con competidores...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Qué obtienes
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Diagnóstico completo en 60 segundos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>5-10 cambios priorizados por impacto</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Estimación de ROI para cada mejora</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Análisis de compliance (GDPR, WCAG)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Garantías de seguridad
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Sandbox de pruebas antes de desplegar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>A/B testing con 5-10% del tráfico</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Rollback automático si hay problemas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Monitoreo 48h post-deploy</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
