import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Package, Search, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TrackOrder = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber || !email) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    try {
      // Query order by order_number and email
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profileError || !profileData) {
        toast.error("No se encontró ningún pedido con estos datos");
        setOrderData(null);
        setIsLoading(false);
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            product_price,
            subtotal
          )
        `)
        .eq("order_number", orderNumber)
        .eq("user_id", profileData.id)
        .single();

      if (orderError || !orderData) {
        toast.error("No se encontró ningún pedido con estos datos");
        setOrderData(null);
      } else {
        setOrderData(orderData);
        toast.success("Pedido encontrado");
      }
    } catch (error) {
      console.error("Error tracking order:", error);
      toast.error("Error al buscar el pedido");
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="h-6 w-6 text-yellow-600" />,
          label: "Pendiente",
          description: "Tu pedido ha sido recibido y está siendo procesado.",
          color: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
        };
      case "processing":
        return {
          icon: <Package className="h-6 w-6 text-blue-600" />,
          label: "Procesando",
          description: "Tu pedido está siendo preparado para el envío.",
          color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
        };
      case "shipped":
        return {
          icon: <Truck className="h-6 w-6 text-purple-600" />,
          label: "Enviado",
          description: "Tu pedido ha sido enviado y está en camino.",
          color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800"
        };
      case "delivered":
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          label: "Entregado",
          description: "Tu pedido ha sido entregado exitosamente.",
          color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
        };
      case "cancelled":
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          label: "Cancelado",
          description: "Este pedido ha sido cancelado.",
          color: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
        };
      default:
        return {
          icon: <Package className="h-6 w-6 text-gray-600" />,
          label: "Desconocido",
          description: "Estado del pedido no disponible.",
          color: "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800"
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Package className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Rastrear tu Pedido</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ingresa tu número de pedido y correo electrónico para ver el estado actual de tu envío.
          </p>
        </div>

        {/* Track Order Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Número de Pedido</Label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder="Ej: ORD-2025-001234"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Puedes encontrar tu número de pedido en el correo de confirmación.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  El correo electrónico que usaste para realizar la compra.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? "Buscando..." : "Rastrear Pedido"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Results */}
        {orderData && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card className={`border ${getStatusInfo(orderData.status).color}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-background">
                    {getStatusInfo(orderData.status).icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      Estado: {getStatusInfo(orderData.status).label}
                    </h2>
                    <p className="text-muted-foreground">
                      {getStatusInfo(orderData.status).description}
                    </p>
                  </div>
                </div>

                {orderData.tracking_number && (
                  <div className="mt-4 p-4 bg-background rounded-lg">
                    <p className="text-sm font-semibold mb-1">Número de Rastreo:</p>
                    <p className="text-lg font-mono">{orderData.tracking_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Detalles del Pedido</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número de Pedido:</span>
                    <span className="font-semibold">{orderData.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de Pedido:</span>
                    <span className="font-semibold">{formatDate(orderData.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold text-lg">${orderData.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Dirección de Envío:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{orderData.shipping_address.street}</p>
                    <p>
                      {orderData.shipping_address.city}, {orderData.shipping_address.state}{" "}
                      {orderData.shipping_address.zipCode}
                    </p>
                    <p>{orderData.shipping_address.country}</p>
                  </div>
                </div>

                {orderData.order_items && orderData.order_items.length > 0 && (
                  <div className="border-t mt-4 pt-4">
                    <h4 className="font-semibold mb-3">Productos:</h4>
                    <div className="space-y-2">
                      {orderData.order_items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.product_name} x {item.quantity}
                          </span>
                          <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2">¿Necesitas ayuda con tu pedido?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Si tienes alguna pregunta o problema con tu pedido, no dudes en contactarnos.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="outline" className="flex-1">
                    <a href="tel:6157289932">
                      Llamar: 615-728-9932
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <a href="mailto:ventas@wincova.com">
                      Email: ventas@wincova.com
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Information Card */}
        {!orderData && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-3">Información Importante</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>El número de pedido se envía a tu correo electrónico inmediatamente después de realizar la compra.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>El estado del pedido se actualiza cada 24 horas.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Los tiempos de envío varían entre 2-5 días hábiles dependiendo de tu ubicación.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;
