import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Gift, Users, ArrowLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RewardsBalance } from "@/components/RewardsBalance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  currency: string;
}

interface Referral {
  id: string;
  referral_code: string;
  created_at: string;
  reward_earned: number;
}

interface Reward {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  birthday: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [ordersRes, referralsRes, rewardsRes, profileRes] = await Promise.all([
        supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("referrals").select("*").eq("referrer_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("rewards").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("id", user!.id).single(),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (referralsRes.error) throw referralsRes.error;
      if (rewardsRes.error) throw rewardsRes.error;
      if (profileRes.error) throw profileRes.error;

      setOrders(ordersRes.data || []);
      setReferrals(referralsRes.data || []);
      setRewards(rewardsRes.data || []);
      setProfile(profileRes.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || !user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          birthday: profile.birthday,
          address: profile.address,
          city: profile.city,
          country: profile.country,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tus datos se han guardado correctamente",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalRewards = rewards.reduce((sum, reward) => sum + Number(reward.amount), 0);
  
  // Convert points to dollars (1000 points = $1)
  const pointsToDollars = (points: number) => (points / 1000).toFixed(2);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    return status === "paid" ? (
      <Badge variant="default">Pagado</Badge>
    ) : (
      <Badge variant="secondary">{status}</Badge>
    );
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
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la tienda
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">
              <Package className="mr-2 h-4 w-4" />
              Órdenes
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Users className="mr-2 h-4 w-4" />
              Referidos
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <Gift className="mr-2 h-4 w-4" />
              Recompensas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Órdenes</CardTitle>
                <CardDescription>
                  Todas tus compras realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes órdenes aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              ${Number(order.total).toFixed(2)} {order.currency}
                            </p>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex gap-2">
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.payment_status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Programa de Referidos</CardTitle>
                <CardDescription>
                  Invita amigos y gana recompensas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Total de referidos exitosos
                  </p>
                  <p className="text-3xl font-bold">{referrals.length}</p>
                </div>

                {referrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aún no has referido a nadie</p>
                    <Button className="mt-4" onClick={() => navigate("/refer-earn")}>
                      Comenzar a Referir
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">{referral.referral_code}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(referral.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <Badge variant="default">
                          +${Number(referral.reward_earned).toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <RewardsBalance />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
