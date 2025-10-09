import { useEffect, useState } from "react";
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
  TrendingUp,
  Search,
  Shield,
  Eye,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Play,
  FileText,
  DollarSign,
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
}

export default function WincovaDiagnosis() {
  const { diagnosisId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  const handleApproveChange = async (changeId: string) => {
    try {
      const { error } = await supabase
        .from('wincova_changes')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', changeId);

      if (error) throw error;

      toast({
        title: "Cambio aprobado",
        description: "El cambio ha sido marcado para implementación",
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
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p>Diagnóstico no encontrado</p>
          <Button onClick={() => navigate('/wincova')} className="mt-4">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const totalRevenue = changes.reduce((sum, c) => sum + (c.estimated_revenue_impact || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/wincova')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Wincova Discover
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{diagnosis.client_name}</h1>
          <a href={diagnosis.site_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {diagnosis.site_url}
          </a>
        </div>

        {/* Scores Dashboard */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Overall</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getScoreColor(diagnosis.overall_score)}`}>
                {Math.round(diagnosis.overall_score)}
              </div>
              <Progress value={diagnosis.overall_score} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Zap className="w-4 h-4 text-yellow-500 mb-1" />
              <CardTitle className="text-sm">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(diagnosis.performance_score)}`}>
                {Math.round(diagnosis.performance_score)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Search className="w-4 h-4 text-blue-500 mb-1" />
              <CardTitle className="text-sm">SEO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(diagnosis.seo_score)}`}>
                {Math.round(diagnosis.seo_score)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Shield className="w-4 h-4 text-green-500 mb-1" />
              <CardTitle className="text-sm">Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(diagnosis.security_score)}`}>
                {Math.round(diagnosis.security_score)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Eye className="w-4 h-4 text-purple-500 mb-1" />
              <CardTitle className="text-sm">Accessibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(diagnosis.accessibility_score)}`}>
                {Math.round(diagnosis.accessibility_score)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <FileText className="w-4 h-4 text-orange-500 mb-1" />
              <CardTitle className="text-sm">Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(diagnosis.compliance_score)}`}>
                {Math.round(diagnosis.compliance_score)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Impact */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Impacto Estimado en Ingresos
            </CardTitle>
            <CardDescription>
              Si implementas todos los cambios propuestos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}/mes
            </div>
          </CardContent>
        </Card>

        {/* Changes Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cambios Propuestos ({changes.length})</CardTitle>
            <CardDescription>
              Priorizados por AI Guardian Layer según impacto y seguridad
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Category Filter */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
              <TabsList className="flex-wrap h-auto">
                {categories.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    {cat} ({cat === "all" ? changes.length : changes.filter(c => c.category === cat).length})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Changes List */}
            <div className="space-y-4">
              {filteredChanges.map((change) => (
                <Card key={change.id} className="border-l-4" style={{
                  borderLeftColor: change.risk_level === 'low' ? '#22c55e' :
                    change.risk_level === 'medium' ? '#eab308' :
                    change.risk_level === 'high' ? '#ef4444' : '#dc2626'
                }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="capitalize">{change.category}</Badge>
                          {getRiskBadge(change.risk_level)}
                        </div>
                        <CardTitle className="text-lg">{change.title}</CardTitle>
                        <CardDescription className="mt-2">{change.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* AI Scores */}
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Safety Score</div>
                        <div className="flex items-center gap-2">
                          <Progress value={change.safety_score} className="flex-1" />
                          <span className="text-sm font-medium">{Math.round(change.safety_score)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Impact Score</div>
                        <div className="flex items-center gap-2">
                          <Progress value={change.impact_score} className="flex-1" />
                          <span className="text-sm font-medium">{Math.round(change.impact_score)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Complexity</div>
                        <div className="flex items-center gap-2">
                          <Progress value={change.complexity_score} className="flex-1" />
                          <span className="text-sm font-medium">{Math.round(change.complexity_score)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">AI Confidence</div>
                        <div className="flex items-center gap-2">
                          <Progress value={change.confidence_score} className="flex-1" />
                          <span className="text-sm font-medium">{Math.round(change.confidence_score)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Estimated Gains */}
                    <div className="grid md:grid-cols-3 gap-4 mb-4 bg-muted p-3 rounded-lg">
                      {change.estimated_performance_gain && (
                        <div>
                          <div className="text-xs text-muted-foreground">Performance Gain</div>
                          <div className="text-sm font-semibold text-green-600">
                            +{change.estimated_performance_gain}%
                          </div>
                        </div>
                      )}
                      {change.estimated_conversion_gain && (
                        <div>
                          <div className="text-xs text-muted-foreground">Conversion Gain</div>
                          <div className="text-sm font-semibold text-blue-600">
                            +{change.estimated_conversion_gain}%
                          </div>
                        </div>
                      )}
                      {change.estimated_revenue_impact && (
                        <div>
                          <div className="text-xs text-muted-foreground">Revenue Impact</div>
                          <div className="text-sm font-semibold text-purple-600">
                            +${change.estimated_revenue_impact}/mes
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Technical Details (Collapsible) */}
                    <details className="mb-4">
                      <summary className="cursor-pointer text-sm font-medium mb-2">
                        Ver detalles técnicos
                      </summary>
                      <div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
                        {change.technical_details}
                      </div>
                    </details>

                    {/* Action Button */}
                    {change.status === 'proposed' && (
                      <Button
                        onClick={() => handleApproveChange(change.id)}
                        className="w-full"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Aprobar para implementación
                      </Button>
                    )}
                    {change.status === 'approved' && (
                      <Badge variant="secondary" className="w-full justify-center py-2">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Aprobado - Listo para deploy
                      </Badge>
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
  );
}
