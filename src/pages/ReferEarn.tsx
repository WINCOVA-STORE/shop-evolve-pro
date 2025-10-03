import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Mail, Share2, Users, Gift, TrendingUp, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ReferralStats {
  totalReferrals: number;
  totalEarned: number;
  pendingRewards: number;
}

const ReferEarn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalEarned: 0,
    pendingRewards: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    try {
      // Generate or get referral code
      const code = `REF-${user!.id.substring(0, 8).toUpperCase()}`;
      setReferralCode(code);

      // Get referral stats
      const { data: referrals, error: referralsError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id);

      if (referralsError) throw referralsError;

      // Total earned is in points now (1000 points = $1)
      const totalEarnedPoints = referrals?.reduce((sum, ref) => sum + Number(ref.reward_earned), 0) || 0;

      // Get pending rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", user!.id);

      if (rewardsError) throw rewardsError;

      const pendingRewardsPoints = rewards?.filter(r => r.type === "referral").reduce((sum, r) => sum + Number(r.amount), 0) || 0;

      setStats({
        totalReferrals: referrals?.length || 0,
        totalEarned: totalEarnedPoints,
        pendingRewards: pendingRewardsPoints,
      });
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de referidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "¡Copiado!",
      description: "El link de referido se copió al portapapeles",
    });
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=¡Te invito a Wincova!&body=Usa mi código de referido para obtener descuentos: ${referralLink}`;
  };

  const shareViaWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        `¡Mira esta tienda increíble! Usa mi link de referido: ${referralLink}`
      )}`
    );
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 relative">
          <div className="absolute inset-0 bg-[var(--gradient-hero)] rounded-3xl blur-3xl opacity-30 -z-10" />
          <Badge className="mb-6 animate-fade-in" variant="secondary">
            <Gift className="h-3 w-3 mr-1" />
            Programa de Referidos
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
            Invita y Gana <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Recompensas</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Comparte tu link de referido y gana recompensas cuando tus amigos realicen compras.
            ¡Todos ganan!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <div className="absolute inset-0 bg-[var(--gradient-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Total Referidos</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{stats.totalReferrals}</div>
              <p className="text-sm text-muted-foreground mt-1">Amigos invitados</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <div className="absolute inset-0 bg-[var(--gradient-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                <Gift className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">{stats.totalEarned.toLocaleString()} <span className="text-lg">pts</span></div>
              <p className="text-sm text-muted-foreground mt-1">En recompensas</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <div className="absolute inset-0 bg-[var(--gradient-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Disponible</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">{stats.pendingRewards.toLocaleString()} <span className="text-lg">pts</span></div>
              <p className="text-sm text-muted-foreground mt-1">Listos para usar</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Tu Link de Referido</CardTitle>
              <CardDescription className="text-base">
                Comparte este link con tus amigos para ganar recompensas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                <Input 
                  value={referralLink} 
                  readOnly 
                  className="flex-1 border-0 bg-transparent text-base font-mono" 
                />
                <Button onClick={copyToClipboard} size="lg" className="bg-[var(--gradient-primary)] hover:opacity-90">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <Button onClick={shareViaWhatsApp} variant="outline" size="lg" className="hover:border-primary hover:text-primary transition-colors">
                  <Share2 className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button onClick={shareViaEmail} variant="outline" size="lg" className="hover:border-primary hover:text-primary transition-colors">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button onClick={shareViaFacebook} variant="outline" size="lg" className="hover:border-primary hover:text-primary transition-colors">
                  <Share2 className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">¿Cómo Funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-[var(--gradient-primary)] flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Share2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">1. Comparte</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Envía tu link único a tus amigos y familiares por WhatsApp, email o redes sociales.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-[var(--gradient-primary)] flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">2. Ellos Compran</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Cuando tus referidos hagan su primera compra, ambos ganan 1% del valor en puntos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-[var(--gradient-primary)] flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">3. Todos Ganan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Gana puntos con cada compra (1% del valor). 1,000 puntos = $1 USD para usar en tus próximas compras.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-5xl mx-auto">
          <Card className="bg-[var(--gradient-accent)] border-2 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-center text-3xl mb-2">Beneficios del Programa</CardTitle>
              <CardDescription className="text-center text-base">Todo lo que necesitas saber sobre nuestras recompensas</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-background/50 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Recompensas Ilimitadas</h4>
                    <p className="text-sm text-muted-foreground">
                      No hay límite en cuánto puedes ganar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-background/50 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Bonos Instantáneos</h4>
                    <p className="text-sm text-muted-foreground">
                      Recibe tus recompensas inmediatamente
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-background/50 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Fácil de Usar</h4>
                    <p className="text-sm text-muted-foreground">
                      Solo comparte tu link y listo
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-background/50 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Seguimiento en Tiempo Real</h4>
                    <p className="text-sm text-muted-foreground">
                      Ve tus estadísticas actualizadas
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReferEarn;
