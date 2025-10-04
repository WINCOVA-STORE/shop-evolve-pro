import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Mail, Share2, Users, Gift, TrendingUp, CheckCircle, Loader2, ExternalLink, Calendar, ShoppingBag, User, Clock, Cake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useRewards } from "@/hooks/useRewards";

interface ReferralStats {
  totalReferrals: number;
  totalEarned: number;
  pendingRewards: number;
}

interface ReferralDetail {
  id: string;
  referral_code: string;
  reward_earned: number;
  created_at: string;
  referred_id: string;
}

interface OrderDetail {
  id: string;
  order_number: string;
  total: number;
  created_at: string;
  points_earned: number;
}

const ReferEarn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { rewards, availablePoints } = useRewards();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalEarned: 0,
    pendingRewards: 0,
  });
  
  // Sheets state
  const [referralsSheetOpen, setReferralsSheetOpen] = useState(false);
  const [earnedSheetOpen, setEarnedSheetOpen] = useState(false);
  const [availableSheetOpen, setAvailableSheetOpen] = useState(false);
  
  // Details data
  const [referralDetails, setReferralDetails] = useState<ReferralDetail[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);

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
      const code = `REF-${user!.id.substring(0, 8).toUpperCase()}`;
      setReferralCode(code);

      // Get referrals with details
      const { data: referrals, error: referralsError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      setReferralDetails(referrals || []);
      const totalEarnedPoints = referrals?.reduce((sum, ref) => sum + Number(ref.reward_earned), 0) || 0;

      // Get orders with points earned
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          total,
          created_at
        `)
        .eq("user_id", user!.id)
        .eq("payment_status", "completed")
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get rewards for these orders to show points earned
      const { data: rewardsData } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", user!.id)
        .eq("type", "purchase");

      const ordersWithPoints = orders?.map(order => {
        const orderReward = rewardsData?.find(r => r.order_id === order.id);
        return {
          ...order,
          points_earned: orderReward ? Number(orderReward.amount) : 0
        };
      }) || [];

      setOrderDetails(ordersWithPoints);

      setStats({
        totalReferrals: referrals?.length || 0,
        totalEarned: totalEarnedPoints,
        pendingRewards: availablePoints,
      });
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
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
      title: "¡Link copiado!",
      description: "Ahora puedes compartirlo con tus amigos",
    });
  };

  const handleShare = () => {
    copyToClipboard();
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=¡Únete a Wincova!&body=Descubre productos increíbles en Wincova. Usa mi link: ${referralLink}`;
  };

  const shareViaWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        `¡Descubre Wincova! Usa mi link de referido: ${referralLink}`
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
            Comparte tu link y gana puntos cuando tus amigos compren. ¡Es simple y todos ganan!
          </p>
        </div>

        {/* Stats Cards - Now Clickable with Enhanced Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
          <Card 
            className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-500/50 cursor-pointer bg-gradient-to-br from-background via-blue-50/30 to-background dark:from-background dark:via-blue-950/20 dark:to-background"
            onClick={() => setReferralsSheetOpen(true)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Total Referidos</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-5xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalReferrals}</div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1 font-medium">
                Amigos invitados <ExternalLink className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </p>
            </CardContent>
          </Card>

          <Card 
            className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-amber-500/50 cursor-pointer bg-gradient-to-br from-background via-amber-50/30 to-background dark:from-background dark:via-amber-950/20 dark:to-background"
            onClick={() => setEarnedSheetOpen(true)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-5xl font-bold bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {(orderDetails.reduce((sum, order) => sum + order.points_earned, 0) + stats.totalEarned).toLocaleString()} <span className="text-lg">pts</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1 font-medium">
                En todas tus compras <ExternalLink className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </p>
            </CardContent>
          </Card>

          <Card 
            className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-emerald-500/50 cursor-pointer bg-gradient-to-br from-background via-emerald-50/30 to-background dark:from-background dark:via-emerald-950/20 dark:to-background"
            onClick={() => setAvailableSheetOpen(true)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Disponible</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-5xl font-bold bg-gradient-to-br from-emerald-600 to-green-600 bg-clip-text text-transparent">{availablePoints.toLocaleString()} <span className="text-lg">pts</span></div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1 font-medium">
                Listos para usar <ExternalLink className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Section - Enhanced with Color */}
        <div className="max-w-3xl mx-auto mb-16">
          <Card className="border-2 shadow-2xl bg-gradient-to-br from-background to-muted/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl -z-0" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full blur-3xl -z-0" />
            
            <CardHeader className="text-center pb-6 relative z-10">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
                Comparte y Gana
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Haz click en "Compartir" para copiar tu link automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="flex justify-center">
                <Button 
                  onClick={handleShare} 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white text-lg px-16 py-7 h-auto shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold"
                >
                  <Copy className="h-5 w-5 mr-3" />
                  Compartir Link
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground font-medium">O COMPARTE EN</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={shareViaWhatsApp} 
                  variant="outline" 
                  size="lg" 
                  className="hover:border-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 transition-all duration-300 border-2"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  onClick={shareViaEmail} 
                  variant="outline" 
                  size="lg" 
                  className="hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-300 border-2"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button 
                  onClick={shareViaFacebook} 
                  variant="outline" 
                  size="lg" 
                  className="hover:border-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-300 border-2"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded-xl border border-border/50">
                <p className="text-xs text-muted-foreground text-center font-mono break-all">{referralLink}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How it Works - Enhanced with Gradient Backgrounds */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-center mb-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
            ¿Cómo Funciona?
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">Tres pasos simples para comenzar a ganar</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-2 hover:border-purple-500/50 relative overflow-hidden bg-gradient-to-br from-background via-purple-50/30 to-background dark:from-background dark:via-purple-950/20 dark:to-background">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl" />
              <CardHeader className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 mx-auto shadow-2xl transform hover:rotate-12 transition-transform duration-300">
                  <Share2 className="h-10 w-10 text-white" />
                </div>
                <div className="inline-block px-4 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-bold mb-2">
                  PASO 1
                </div>
                <CardTitle className="text-2xl font-bold">Comparte</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground leading-relaxed text-base">
                  Envía tu link único a amigos y familiares. Es simple y rápido.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-2 hover:border-blue-500/50 relative overflow-hidden bg-gradient-to-br from-background via-blue-50/30 to-background dark:from-background dark:via-blue-950/20 dark:to-background">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl" />
              <CardHeader className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 mx-auto shadow-2xl transform hover:rotate-12 transition-transform duration-300">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div className="inline-block px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold mb-2">
                  PASO 2
                </div>
                <CardTitle className="text-2xl font-bold">Ellos Compran</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground leading-relaxed text-base">
                  Cuando tus amigos compren usando tu link, ambos reciben puntos de recompensa.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-2 hover:border-orange-500/50 relative overflow-hidden bg-gradient-to-br from-background via-orange-50/30 to-background dark:from-background dark:via-orange-950/20 dark:to-background">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full blur-2xl" />
              <CardHeader className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-6 mx-auto shadow-2xl transform hover:rotate-12 transition-transform duration-300">
                  <Gift className="h-10 w-10 text-white" />
                </div>
                <div className="inline-block px-4 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-bold mb-2">
                  PASO 3
                </div>
                <CardTitle className="text-2xl font-bold">Todos Ganan</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground leading-relaxed text-base">
                  Acumula puntos con cada compra y úsalos para pagar parte de futuras órdenes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits - Enhanced with Rich Colors */}
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-2 border-indigo-200/50 dark:border-indigo-800/50 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-full blur-3xl" />
            <CardHeader className="relative z-10 text-center pb-8">
              <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold mb-4 shadow-lg">
                BENEFICIOS EXCLUSIVOS
              </div>
              <CardTitle className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Beneficios del Programa
              </CardTitle>
              <CardDescription className="text-base text-foreground/70">
                Todo lo que necesitas saber sobre nuestras recompensas
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-5 rounded-xl bg-white/60 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300 border border-indigo-200/50 dark:border-indigo-800/50 hover:shadow-lg hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-foreground">Recompensas Ilimitadas</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      No hay límite en cuánto puedes ganar. Mientras más compartes, más ganas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 rounded-xl bg-white/60 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-foreground">Recompensas Inmediatas</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Los puntos se acreditan al instante después de cada compra exitosa.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 rounded-xl bg-white/60 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300 border border-pink-200/50 dark:border-pink-800/50 hover:shadow-lg hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-foreground">Fácil de Usar</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Solo comparte tu link y listo. Sin complicaciones ni requisitos complejos.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 rounded-xl bg-white/60 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-300 border border-orange-200/50 dark:border-orange-800/50 hover:shadow-lg hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-foreground">Seguimiento en Tiempo Real</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ve tus estadísticas actualizadas en tiempo real desde tu panel.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* Referrals Details Dialog */}
      <Dialog open={referralsSheetOpen} onOpenChange={setReferralsSheetOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Tus Referidos
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            {referralDetails.length === 0 ? (
              <div className="space-y-6">
                {/* Estado vacío con ejemplo visual */}
                <div className="text-center py-8 px-4 bg-muted/30 rounded-lg border-2 border-dashed">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-semibold text-lg mb-2">Aún no tienes referidos</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comparte tu link para empezar a ganar puntos
                  </p>
                  <Button onClick={() => setReferralsSheetOpen(false)} variant="outline" size="sm">
                    Compartir ahora
                  </Button>
                </div>

                {/* Vista previa de cómo se verá */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-3 text-center">Vista previa de cómo se verá:</p>
                  
                  <Card className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            María González
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            15 de marzo, 2025
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          +2,500 pts
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="opacity-40 mt-3">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Juan Pérez
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            10 de marzo, 2025
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          +3,000 pts
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              referralDetails.map((referral) => (
                <Card key={referral.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          Referido #{referral.id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(referral.created_at).toLocaleDateString('es', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        +{referral.reward_earned.toLocaleString()} pts
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Earned Points Details Dialog */}
      <Dialog open={earnedSheetOpen} onOpenChange={setEarnedSheetOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Gift className="h-6 w-6 text-primary" />
              Puntos Ganados
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            {orderDetails.length === 0 ? (
              <div className="space-y-6">
                {/* Estado vacío con ejemplo visual */}
                <div className="text-center py-8 px-4 bg-muted/30 rounded-lg border-2 border-dashed">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-semibold text-lg mb-2">No hay compras aún</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cada compra que realices te dará puntos de recompensa
                  </p>
                  <Button onClick={() => {
                    setEarnedSheetOpen(false);
                    navigate('/');
                  }} variant="outline" size="sm">
                    Ir a comprar
                  </Button>
                </div>

                {/* Vista previa de cómo se verá */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-3 text-center">Vista previa de cómo se verá:</p>
                  
                  <Card className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">Orden #WIN-2025-001</p>
                            <Badge variant="outline" className="text-xs">Completada</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            20 de marzo, 2025
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          +4,500 pts
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t text-sm">
                        <span className="text-muted-foreground">Total de orden:</span>
                        <span className="font-medium">450,000 pts</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="opacity-40 mt-3">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">Orden #WIN-2025-002</p>
                            <Badge variant="outline" className="text-xs">Completada</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            18 de marzo, 2025
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          +2,800 pts
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t text-sm">
                        <span className="text-muted-foreground">Total de orden:</span>
                        <span className="font-medium">280,000 pts</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              orderDetails.map((order) => (
                <Card 
                  key={order.id} 
                  className="hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigate('/profile?tab=orders')}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium group-hover:text-primary transition-colors">Orden {order.order_number}</p>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <Badge variant="outline" className="text-xs">Completada</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString('es', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        +{order.points_earned.toLocaleString()} pts
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t text-sm">
                      <span className="text-muted-foreground">Total de orden:</span>
                      <span className="font-medium">${order.total.toLocaleString()}</span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t bg-muted/30 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                      <p className="text-sm text-muted-foreground mb-2">¿Te gustó tu compra?</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={(e) => {
                          e.stopPropagation();
                          setEarnedSheetOpen(false);
                          navigate('/');
                        }}>
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          Comprar de nuevo
                        </Button>
                        <Button size="sm" variant="outline" onClick={(e) => {
                          e.stopPropagation();
                          navigate('/profile?tab=orders');
                        }}>
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Available Points Details Dialog */}
      <Dialog open={availableSheetOpen} onOpenChange={setAvailableSheetOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Balance Disponible
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-6">
            {/* Balance principal */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-2 border-primary/20 shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">Tu balance actual</p>
                <div className="text-6xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-3">
                  {availablePoints.toLocaleString()}
                </div>
                <p className="text-lg text-muted-foreground">puntos disponibles</p>
                
                {availablePoints > 0 && (
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      Puedes usar estos puntos para pagar parte de tu próxima compra
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Historial de recompensas */}
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Historial de Recompensas
              </h3>
              
              {rewards.length === 0 ? (
                <div className="space-y-6">
                  <div className="text-center py-8 px-4 bg-muted/30 rounded-lg border-2 border-dashed">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-semibold text-lg mb-2">No hay recompensas aún</p>
                    <p className="text-sm text-muted-foreground">
                      Gana puntos comprando, refiriendo amigos o en tu cumpleaños
                    </p>
                  </div>

                  {/* Vista previa */}
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-3 text-center">Ejemplo de recompensas:</p>
                    
                    <Card className="opacity-60 mb-3">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Gift className="h-4 w-4 text-primary" />
                              </div>
                              <p className="font-medium">Bono de bienvenida</p>
                            </div>
                            <p className="text-sm text-muted-foreground ml-10 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Al registrarte
                            </p>
                          </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    +500 pts
                  </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="opacity-40 mb-3">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <p className="font-medium">Por referir a María</p>
                            </div>
                            <p className="text-sm text-muted-foreground ml-10 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              15 de marzo, 2025
                            </p>
                          </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    +500 pts
                  </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="opacity-30">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                              </div>
                              <p className="font-medium">Puntos por compra</p>
                            </div>
                            <p className="text-sm text-muted-foreground ml-10 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Orden #WIN-2025-001
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            +4,500 pts
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {rewards.map((reward) => {
                    const rewardIcon = reward.type === 'welcome' ? Gift :
                                     reward.type === 'referral' ? User :
                                     reward.type === 'purchase' ? ShoppingBag :
                                     reward.type === 'birthday' ? Cake : TrendingUp;
                    const RewardIcon = rewardIcon;
                    
                    return (
                      <Card key={reward.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <RewardIcon className="h-4 w-4 text-primary" />
                                </div>
                                <p className="font-medium">{reward.description}</p>
                              </div>
                              <p className="text-sm text-muted-foreground ml-10 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(reward.created_at).toLocaleDateString('es', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              {reward.expires_at && (
                                <p className="text-xs text-amber-600 ml-10 mt-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Expira: {new Date(reward.expires_at).toLocaleDateString('es')}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="bg-primary/10 text-primary shrink-0">
                              +{reward.amount.toLocaleString()} pts
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferEarn;
