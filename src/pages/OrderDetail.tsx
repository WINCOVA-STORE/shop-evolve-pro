import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Package, MapPin, CreditCard, Truck, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "react-i18next";

interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  currency: string;
  shipping_address: string | null;
  billing_address: string | null;
  tracking_number: string | null;
  carrier: string | null;
  estimated_delivery_date: string | null;
  notes: string | null;
}

const OrderDetail = () => {
  const { orderId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const dateLocale = () => {
    const lang = i18n.language?.split('-')[0];
    switch (lang) {
      case 'es': return 'es-ES';
      case 'fr': return 'fr-FR';
      case 'pt': return 'pt-PT';
      case 'zh': return 'zh-CN';
      default: return 'en-US';
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && orderId) {
      fetchOrderDetails();
    }
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user!.id)
        .single();
      if (orderError) throw orderError;
      if (!orderData) {
        toast({
          title: t("order_detail.order_not_found"),
          description: t("order_detail.could_not_load"),
          variant: "destructive",
        });
        navigate("/profile");
        return;
      }

      setOrder(orderData);

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la orden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCarrierTrackingUrl = (carrier: string | null, trackingNumber: string) => {
    if (!carrier) return null;
    
    const carrierLower = carrier.toLowerCase();
    
    if (carrierLower.includes('ups')) {
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    } else if (carrierLower.includes('fedex')) {
      return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    } else if (carrierLower.includes('usps')) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    } else if (carrierLower.includes('dhl')) {
      return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
    }
    
    return null;
  };

  const getStatusInfo = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any; color: string }> = {
      pending: { 
        label: t("order_detail.status_pending"), 
        variant: "secondary", 
        icon: Package,
        color: "text-amber-600"
      },
      confirmed: { 
        label: t("order_detail.status_confirmed"), 
        variant: "default", 
        icon: CheckCircle2,
        color: "text-blue-600"
      },
      processing: { 
        label: t("order_detail.status_processing"), 
        variant: "default", 
        icon: Package,
        color: "text-blue-600"
      },
      shipped: { 
        label: t("order_detail.status_shipped"), 
        variant: "default", 
        icon: Truck,
        color: "text-primary"
      },
      delivered: { 
        label: t("order_detail.status_delivered"), 
        variant: "default", 
        icon: CheckCircle2,
        color: "text-green-600"
      },
      cancelled: { 
        label: t("order_detail.status_cancelled"), 
        variant: "destructive", 
        icon: Package,
        color: "text-destructive"
      },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">{t("order_detail.order_not_found")}</h2>
          <Button onClick={() => navigate("/profile")}>{t("order_detail.back_to_profile")}</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          className="mb-6 hover:scale-105 transition-transform"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("order_detail.back_to_profile")}
        </Button>

        {/* Header Section - PREMIUM */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-2">
                Orden {order.order_number}
              </h1>
              <p className="text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${statusInfo.color} bg-opacity-10 backdrop-blur-sm`}>
                <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
              </div>
              <div>
                <Badge variant={statusInfo.variant} className="text-sm px-3 py-1">
                  {statusInfo.label}
                </Badge>
                {order.payment_status === "paid" && (
                  <Badge variant="default" className="ml-2 bg-green-600">
                    Pagado
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Tracking Info - PREMIUM */}
          {order.tracking_number && (
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Número de Seguimiento</p>
                    <p className="text-lg font-bold text-primary">{order.tracking_number}</p>
                  </div>
                  {order.carrier && (
                    <Badge variant="outline">{order.carrier}</Badge>
                  )}
                </div>
                {order.estimated_delivery_date && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Entrega estimada: {new Date(order.estimated_delivery_date).toLocaleDateString('es-ES')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Items - PREMIUM */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Productos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 hover:bg-primary/5 transition-all cursor-pointer group"
                      onClick={() => item.product_id ? navigate(`/product/${item.product_id}`, { state: { fromOrder: orderId } }) : navigate("/")}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {item.product_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ${Number(item.product_price).toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-lg group-hover:text-primary transition-colors">
                          ${Number(item.subtotal).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Addresses */}
            <div className="grid gap-6">
              {order.shipping_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                      Dirección de Envío
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-line">{order.shipping_address}</p>
                  </CardContent>
                </Card>
              )}

              {order.billing_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Dirección de Facturación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-line">{order.billing_address}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Order Summary - PREMIUM */}
            <Card className="sticky top-24 overflow-hidden border-2 border-primary/20 shadow-xl">
              <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
              <CardHeader className="bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardTitle>Resumen de Orden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${Number(order.subtotal).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium">
                      {Number(order.shipping) === 0 ? "Gratis" : `$${Number(order.shipping).toFixed(2)}`}
                    </span>
                  </div>
                  
                  {Number(order.tax) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Impuestos</span>
                      <span className="font-medium">${Number(order.tax).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-3xl" style={{ color: "hsl(var(--secondary))" }}>
                    ${Number(order.total).toFixed(2)} {order.currency}
                  </span>
                </div>

                {order.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-1">Notas</p>
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    </div>
                  </>
                )}

                {/* CTA Section */}
                <div className="pt-4 space-y-2">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 hover:scale-105 transition-all shadow-lg"
                    onClick={() => navigate("/")}
                  >
                    Seguir Comprando
                  </Button>
                  
                  {order.tracking_number && (
                    <Button 
                      variant="outline" 
                      className="w-full border-primary/40 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:border-primary hover:scale-105 transition-all hover:shadow-lg"
                      onClick={() => {
                        const trackingUrl = getCarrierTrackingUrl(order.carrier, order.tracking_number!);
                        if (trackingUrl) {
                          window.open(trackingUrl, '_blank');
                        } else {
                          toast({
                            title: "Rastreo en vivo",
                            description: `Número de seguimiento: ${order.tracking_number}`,
                          });
                        }
                      }}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Rastrear en Vivo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Need Help Card */}
            <Card className="bg-gradient-to-br from-secondary/5 to-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium mb-2">¿Necesitas ayuda?</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Nuestro equipo está listo para asistirte
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full hover:scale-105 transition-transform"
                  onClick={() => navigate("/faq")}
                >
                  Contactar Soporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderDetail;
