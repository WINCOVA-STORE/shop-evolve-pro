import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Copy, Mail, Share2, Users, Gift, TrendingUp, CheckCircle, Loader2, ExternalLink, Calendar } from "lucide-react";
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

        {/* Stats Cards - Now Clickable */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
          <Card 
            className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer"
            onClick={() => setReferralsSheetOpen(true)}
          >
            <div className="absolute inset-0 bg-[var(--gradient-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Total Referidos</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{stats.totalReferrals}</div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                Amigos invitados <ExternalLink className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>

          <Card 
            className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer"
            onClick={() => setEarnedSheetOpen(true)}
          >
            <div className="absolute inset-0 bg-[var(--gradient-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                <Gift className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                {(orderDetails.reduce((sum, order) => sum + order.points_earned, 0) + stats.totalEarned).toLocaleString()} <span className="text-lg">pts</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                En todas tus compras <ExternalLink className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>

          <Card 
            className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer"
            onClick={() => setAvailableSheetOpen(true)}
          >
            <div className="absolute inset-0 bg-[var(--gradient-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Disponible</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">{availablePoints.toLocaleString()} <span className="text-lg">pts</span></div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                Listos para usar <ExternalLink className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Section - Simplified */}
        <div className="max-w-3xl mx-auto mb-16">
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl">Comparte y Gana</CardTitle>
              <CardDescription className="text-base">
                Haz click en "Compartir" para copiar tu link automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Button 
                  onClick={handleShare} 
                  size="lg" 
                  className="bg-[var(--gradient-primary)] hover:opacity-90 text-lg px-12 py-6 h-auto"
                >
                  <Copy className="h-5 w-5 mr-2" />
                  Compartir Link
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">o comparte en</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
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

              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground text-center font-mono break-all">{referralLink}</p>
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
                  Envía tu link único a amigos y familiares. Es simple y rápido.
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
                  Cuando tus amigos compren usando tu link, ambos reciben puntos de recompensa.
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
                  Acumula puntos con cada compra y úsalos como descuento en futuras órdenes.
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
                    <h4 className="font-semibold text-lg mb-1">Recompensas Inmediatas</h4>
                    <p className="text-sm text-muted-foreground">
                      Los puntos se acreditan al instante
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

      {/* Referrals Details Sheet */}
      <Sheet open={referralsSheetOpen} onOpenChange={setReferralsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background">{/* ... keep existing code */}
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Tus Referidos
            </SheetTitle>
            <SheetDescription>
              Lista de amigos que se unieron con tu link
            </SheetDescription>
          </SheetHeader>
          
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
                            <Users className="h-4 w-4 text-primary" />
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
                            <Users className="h-4 w-4 text-primary" />
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
                          <Users className="h-4 w-4 text-primary" />
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
        </SheetContent>
      </Sheet>

      {/* Earned Points Details Sheet */}
      <Sheet open={earnedSheetOpen} onOpenChange={setEarnedSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background">{/* ... keep existing code */}
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="text-2xl flex items-center gap-2">
              <Gift className="h-6 w-6 text-primary" />
              Puntos Ganados
            </SheetTitle>
            <SheetDescription>
              Historial completo de puntos ganados en compras
            </SheetDescription>
          </SheetHeader>
          
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
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">Orden {order.order_number}</p>
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
                      <span className="font-medium">{order.total.toLocaleString()} pts</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Available Points Details Sheet */}
      <Sheet open={availableSheetOpen} onOpenChange={setAvailableSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background">{/* ... keep existing code */}
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Balance Disponible
            </SheetTitle>
            <SheetDescription>
              Tus puntos listos para usar en cualquier compra
            </SheetDescription>
          </SheetHeader>
          
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
                      Puedes usar estos puntos como descuento en tu próxima compra
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
                            +2,000 pts
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
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                              <p className="font-medium">Por referir a María</p>
                            </div>
                            <p className="text-sm text-muted-foreground ml-10 flex items-center gap-1">
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

                    <Card className="opacity-30">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Gift className="h-4 w-4 text-primary" />
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
                                     reward.type === 'referral' ? Users :
                                     reward.type === 'purchase' ? Gift :
                                     reward.type === 'birthday' ? Gift : TrendingUp;
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
                                <p className="text-xs text-muted-foreground ml-10 mt-1">
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
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ReferEarn;
