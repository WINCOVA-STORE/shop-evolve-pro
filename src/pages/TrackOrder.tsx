import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Package, 
  Search, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle,
  ExternalLink,
  Calendar 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  shipping_address: any;
  billing_address: any;
  created_at: string;
  updated_at: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    product_price: number;
    subtotal: number;
  }>;
}

const TrackOrder = () => {
  const navigate = useNavigate();
  
  // Search by Order Number
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  
  // Search by Date Range
  const [dateEmail, setDateEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getCarrierTrackingUrl = (carrier: string | undefined, trackingNumber: string) => {
    if (!carrier || !trackingNumber) return null;
    
    const carrierLower = carrier.toLowerCase();
    
    if (carrierLower.includes('usps')) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    } else if (carrierLower.includes('ups')) {
      return `https://www.ups.com/track?track=yes&trackNums=${trackingNumber}`;
    } else if (carrierLower.includes('fedex')) {
      return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    } else if (carrierLower.includes('dhl')) {
      return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
    }
    
    return null;
  };

  const handleTrackByOrderNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim() || !email.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    setOrders([]);
    setSelectedOrder(null);
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (profileError || !profileData) {
        toast.error("No se encontró ningún pedido con este correo electrónico");
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
        .eq("order_number", orderNumber.trim().toUpperCase())
        .eq("user_id", profileData.id)
        .maybeSingle();

      if (orderError || !orderData) {
        toast.error("No se encontró ningún pedido con este número");
      } else {
        setSelectedOrder(orderData as Order);
        setOrders([orderData as Order]);
        toast.success("¡Pedido encontrado!");
      }
    } catch (error) {
      console.error("Error tracking order:", error);
      toast.error("Error al buscar el pedido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackByDate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dateEmail.trim() || !startDate || !endDate) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("La fecha inicial debe ser anterior a la fecha final");
      return;
    }

    setIsLoading(true);
    setOrders([]);
    setSelectedOrder(null);
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", dateEmail.trim().toLowerCase())
        .maybeSingle();

      if (profileError || !profileData) {
        toast.error("No se encontró ningún pedido con este correo electrónico");
        return;
      }

      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      const { data: ordersData, error: ordersError } = await supabase
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
        .eq("user_id", profileData.id)
        .gte("created_at", startDateTime.toISOString())
        .lte("created_at", endDateTime.toISOString())
        .order("created_at", { ascending: false });

      if (ordersError) {
        toast.error("Error al buscar pedidos");
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        toast.error("No se encontraron pedidos en este rango de fechas");
      } else {
        setOrders(ordersData as Order[]);
        if (ordersData.length === 1) {
          setSelectedOrder(ordersData[0] as Order);
        }
        toast.success(`Se encontraron ${ordersData.length} pedido(s)`);
      }
    } catch (error) {
      console.error("Error tracking orders by date:", error);
      toast.error("Error al buscar pedidos");
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
          description: "Tu pedido está siendo preparado para el envío por nuestro proveedor.",
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

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const renderOrderCard = (order: Order) => {
    const trackingUrl = order.tracking_number && order.carrier
      ? getCarrierTrackingUrl(order.carrier, order.tracking_number)
      : null;

    return (
      <Card key={order.id} className={`border ${getStatusInfo(order.status).color}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 rounded-lg bg-background">
              {getStatusInfo(order.status).icon}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">
                Estado: {getStatusInfo(order.status).label}
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                {getStatusInfo(order.status).description}
              </p>
              <p className="text-xs text-muted-foreground">
                Pedido: <span className="font-mono font-semibold">{order.order_number}</span>
              </p>
            </div>
          </div>

          {order.tracking_number && (
            <div className="mt-4 p-4 bg-background rounded-lg border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">Número de Rastreo:</p>
                  <p className="text-lg font-mono mb-2">{order.tracking_number}</p>
                  {order.carrier && (
                    <p className="text-sm text-muted-foreground">
                      Transportista: <span className="font-semibold">{order.carrier}</span>
                    </p>
                  )}
                  {order.estimated_delivery_date && (
                    <p className="text-sm text-muted-foreground">
                      Entrega estimada: <span className="font-semibold">
                        {formatShortDate(order.estimated_delivery_date)}
                      </span>
                    </p>
                  )}
                </div>
                {trackingUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Rastrear
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="border-t mt-4 pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-semibold">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold text-lg">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.order_items && order.order_items.length > 0 && (
            <div className="border-t mt-4 pt-4">
              <h4 className="font-semibold text-sm mb-3">Productos ({order.order_items.length}):</h4>
              <div className="space-y-2">
                {order.order_items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product_name} x {item.quantity}
                    </span>
                    <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.shipping_address && (
            <div className="border-t mt-4 pt-4">
              <h4 className="font-semibold text-sm mb-2">Dirección de Envío:</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                {typeof order.shipping_address === 'string' ? (
                  <p>{order.shipping_address}</p>
                ) : (
                  <>
                    {order.shipping_address.street && <p>{order.shipping_address.street}</p>}
                    {order.shipping_address.city && (
                      <p>
                        {order.shipping_address.city}
                        {order.shipping_address.state && `, ${order.shipping_address.state}`}
                        {order.shipping_address.zipCode && ` ${order.shipping_address.zipCode}`}
                      </p>
                    )}
                    {order.shipping_address.country && <p>{order.shipping_address.country}</p>}
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
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
            Consulta el estado de tu pedido usando tu número de orden o buscando por rango de fechas.
          </p>
        </div>

        {/* Search Tabs */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Tabs defaultValue="order-number">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="order-number">
                  <Package className="h-4 w-4 mr-2" />
                  Por Número de Pedido
                </TabsTrigger>
                <TabsTrigger value="date-range">
                  <Calendar className="h-4 w-4 mr-2" />
                  Por Rango de Fechas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="order-number" className="mt-6">
                <form onSubmit={handleTrackByOrderNumber} className="space-y-4">
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
                    <p className="text-xs text-muted-foreground">
                      Lo encuentras en el correo de confirmación de tu compra.
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
                    <p className="text-xs text-muted-foreground">
                      El correo usado para realizar la compra.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    {isLoading ? "Buscando..." : "Rastrear Pedido"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="date-range" className="mt-6">
                <form onSubmit={handleTrackByDate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateEmail">Correo Electrónico</Label>
                    <Input
                      id="dateEmail"
                      type="email"
                      placeholder="tu@email.com"
                      value={dateEmail}
                      onChange={(e) => setDateEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Desde</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">Hasta</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Busca todos los pedidos realizados en un rango de fechas específico.
                  </p>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    {isLoading ? "Buscando..." : "Buscar Pedidos"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results Section */}
        {orders.length > 0 && (
          <div className="space-y-6">
            {orders.length > 1 && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm font-semibold">
                  Se encontraron {orders.length} pedidos en este rango de fechas
                </p>
              </div>
            )}
            
            {orders.map((order) => renderOrderCard(order))}

            {/* Help Section */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2">¿Necesitas ayuda con tu pedido?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Si tienes alguna pregunta o problema, contáctanos:
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
        {orders.length === 0 && !isLoading && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-3">Información Importante</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>El número de pedido se envía por correo inmediatamente después de tu compra.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Si no encuentras el correo, revisa tu carpeta de spam.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Los números de rastreo se actualizan cada 24 horas una vez que el pedido es enviado.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Los envíos desde nuestros proveedores en US/EU tardan 2-5 días hábiles.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Si no tienes tu número de pedido, usa la búsqueda por fechas.</span>
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
