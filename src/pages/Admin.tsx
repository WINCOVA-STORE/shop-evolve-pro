import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ShoppingBag, Users, DollarSign, ArrowLeft, Shield, RefreshCw, Truck, Gift, FolderKanban, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "react-i18next";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  user_id: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

const Admin = () => {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setIsAdmin(true);
        fetchAdminData();
      } else {
        toast({
          title: t("admin.access_denied"),
          description: t("admin.no_permissions"),
          variant: "destructive",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    } finally {
      setCheckingAdmin(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [ordersRes, productsRes, profilesRes] = await Promise.all([
        supabase.from("orders").select("*, profiles(email, full_name)").order("created_at", { ascending: false }).limit(10),
        supabase.from("products").select("id"),
        supabase.from("profiles").select("id"),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: productsRes.data?.length || 0,
        totalUsers: profilesRes.data?.length || 0,
      });

      setRecentOrders(orders);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: t("admin.error_loading"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  if (authLoading || checkingAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">{t("admin.title")}</h1>
            </div>
            <p className="text-muted-foreground">{t("admin.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="default" onClick={() => navigate("/admin/ecommerce-roadmap")}>
              <FolderKanban className="mr-2 h-4 w-4" />
              🚀 Roadmap E-Commerce
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/project")}>
              <FolderKanban className="mr-2 h-4 w-4" />
              Panel de Proyecto
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/woocommerce-sync")}>
              <RefreshCw className="mr-2 h-4 w-4" />
              WooCommerce Sync
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("admin.back_to_store")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.total_orders")}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.total_revenue")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.products")}</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.users")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">{t("admin.recent_orders")}</TabsTrigger>
            <TabsTrigger value="products">{t("admin.products")}</TabsTrigger>
            <TabsTrigger value="users">{t("admin.users")}</TabsTrigger>
          </TabsList>

          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => navigate("/admin/recovery-guide")} className="bg-green-600 hover:bg-green-700">
              <Shield className="mr-2 h-4 w-4" />
              Manual de Recuperación
            </Button>
            <Button onClick={() => navigate("/admin/system-backup")} variant="outline">
              <Database className="mr-2 h-4 w-4" />
              {t("admin.system_backup")}
            </Button>
            <Button onClick={() => navigate("/admin/woocommerce-sync")} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              WooCommerce Sync
            </Button>
            <Button onClick={() => navigate("/admin/shipping-settings")} variant="outline">
              <Truck className="mr-2 h-4 w-4" />
              Configuración de Envíos
            </Button>
            <Button onClick={() => navigate("/admin/rewards-settings")} variant="outline">
              <Gift className="mr-2 h-4 w-4" />
              Sistema de Recompensas
            </Button>
          </div>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.recent_orders")}</CardTitle>
                <CardDescription>
                  {t("admin.recent_orders_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t("admin.no_orders")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.profiles?.email || order.profiles?.full_name || t("admin.user_label")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString(i18n.language, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              ${Number(order.total).toFixed(2)}
                            </p>
                            <div className="mt-2">
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.product_management")}</CardTitle>
                <CardDescription>
                  {t("admin.product_management_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("admin.coming_soon")}</p>
                  <p className="text-sm mt-2">{t("admin.coming_soon_products")}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.user_management")}</CardTitle>
                <CardDescription>
                  {t("admin.user_management_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("admin.coming_soon")}</p>
                  <p className="text-sm mt-2">{t("admin.coming_soon_users")}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
