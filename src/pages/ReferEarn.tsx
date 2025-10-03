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
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            Programa de Referidos
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Invita y Gana Recompensas
          </h1>
          <p className="text-lg text-muted-foreground">
            Comparte tu link de referido y gana recompensas cuando tus amigos realicen compras.
            ¡Todos ganan!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referidos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">Amigos invitados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEarned.toLocaleString()} pts</div>
              <p className="text-xs text-muted-foreground">${(stats.totalEarned / 1000).toFixed(2)} en recompensas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponible</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRewards.toLocaleString()} pts</div>
              <p className="text-xs text-muted-foreground">${(stats.pendingRewards / 1000).toFixed(2)} listos para usar</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Tu Link de Referido</CardTitle>
              <CardDescription>
                Comparte este link con tus amigos para ganar recompensas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input value={referralLink} readOnly className="flex-1" />
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={shareViaWhatsApp} variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button onClick={shareViaEmail} variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button onClick={shareViaFacebook} variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">¿Cómo Funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Comparte</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Envía tu link único a tus amigos y familiares por WhatsApp, email o redes sociales.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. Ellos Compran</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cuando tus referidos hagan su primera compra, ambos ganan 1% del valor en puntos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>3. Todos Ganan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gana puntos con cada compra (1% del valor). 1,000 puntos = $1 USD para usar en tus próximas compras.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Beneficios del Programa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Recompensas Ilimitadas</h4>
                    <p className="text-sm text-muted-foreground">
                      No hay límite en cuánto puedes ganar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Bonos Instantáneos</h4>
                    <p className="text-sm text-muted-foreground">
                      Recibe tus recompensas inmediatamente
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Fácil de Usar</h4>
                    <p className="text-sm text-muted-foreground">
                      Solo comparte tu link y listo
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Seguimiento en Tiempo Real</h4>
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
