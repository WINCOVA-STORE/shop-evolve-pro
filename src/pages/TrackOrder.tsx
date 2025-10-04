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
  Calendar,
  MapPin,
  Box,
  Zap,
  Star,
  ShoppingBag
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
    
    const statusInfo = getStatusInfo(order.status);

    return (
      <Card 
        key={order.id} 
        className={`border-2 ${statusInfo.color} shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] overflow-hidden animate-fade-in`}
      >
        {/* Status gradient bar */}
        <div className={`h-2 ${
          order.status === 'delivered' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
          order.status === 'shipped' ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
          order.status === 'processing' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
          order.status === 'cancelled' ? 'bg-gradient-to-r from-red-400 to-orange-500' :
          'bg-gradient-to-r from-yellow-400 to-orange-500'
        }`}></div>
        
        <CardContent className="pt-6">
          {/* Status Header with Enhanced Design */}
          <div className="flex items-start gap-4 mb-6">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-20 blur-md"></div>
              
              {/* Icon container */}
              <div className={`relative p-3 rounded-xl shadow-lg ${
                order.status === 'delivered' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                order.status === 'shipped' ? 'bg-gradient-to-br from-purple-400 to-pink-500' :
                order.status === 'processing' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' :
                order.status === 'cancelled' ? 'bg-gradient-to-br from-red-400 to-orange-500' :
                'bg-gradient-to-br from-yellow-400 to-orange-500'
              }`}>
                <div className="text-white">
                  {statusInfo.icon}
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">
                  {statusInfo.label}
                </h2>
                {order.status === 'delivered' && (
                  <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                    Completado
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {statusInfo.description}
              </p>
              <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2 w-fit">
                <ShoppingBag className="h-3 w-3" />
                <span className="font-mono font-semibold">{order.order_number}</span>
              </div>
            </div>
          </div>

          {/* Tracking Number Section */}
          {order.tracking_number && (
            <div className="mt-4 p-5 bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/5 rounded-xl border-2 border-primary/20 shadow-inner">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-primary">Información de Rastreo</p>
                  </div>
                  
                  <div className="space-y-3 pl-9">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Número de Rastreo</p>
                      <p className="text-lg font-mono font-bold bg-background px-3 py-2 rounded-lg inline-block">
                        {order.tracking_number}
                      </p>
                    </div>
                    
                    {order.carrier && (
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Transportista: <span className="font-semibold text-primary">{order.carrier}</span>
                        </span>
                      </div>
                    )}
                    
                    {order.estimated_delivery_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Entrega estimada: <span className="font-semibold text-primary">
                            {formatShortDate(order.estimated_delivery_date)}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {trackingUrl && (
                  <Button 
                    asChild 
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Rastrear en Vivo
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="border-t-2 border-dashed mt-6 pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Pedido
                </span>
                <span className="font-semibold">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border-2 border-primary/20">
                <span className="text-base font-semibold flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  Total Pagado
                </span>
                <span className="font-bold text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  ${order.total.toFixed(2)}
                </span>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl relative">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:scale-105 transition-transform"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-purple-500 opacity-20 blur-xl"></div>
              
              {/* Main icon */}
              <div className="relative p-6 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-2xl shadow-primary/50">
                <Package className="h-16 w-16 text-white" />
              </div>
              
              {/* Floating decorative icons */}
              <div className="absolute -top-2 -right-2 p-2 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg animate-bounce">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 p-2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg animate-bounce" style={{ animationDelay: '0.3s' }}>
                <Star className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            Rastrear tu Pedido
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Seguimiento en <span className="font-semibold text-primary">tiempo real</span> de tu pedido. 
            Consulta el estado usando tu número de orden o buscando por fechas.
          </p>
          
          {/* Stats badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
              <Truck className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Envío 2-5 días</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold">Actualización 24h</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold">US & EU</span>
            </div>
          </div>
        </div>

        {/* Search Tabs */}
        <Card className="mb-8 shadow-2xl border-2 hover:shadow-primary/20 transition-all duration-300 animate-scale-in overflow-hidden">
          {/* Gradient header bar */}
          <div className="h-2 bg-gradient-to-r from-primary via-purple-600 to-primary"></div>
          
          <CardContent className="pt-6">
            <Tabs defaultValue="order-number">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-gradient-to-r from-primary/5 to-purple-500/5">
                <TabsTrigger 
                  value="order-number" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Por Número de Pedido
                </TabsTrigger>
                <TabsTrigger 
                  value="date-range"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                >
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

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all" 
                    disabled={isLoading}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {isLoading ? (
                      <>
                        <span className="animate-pulse">Buscando</span>
                        <span className="animate-bounce ml-1">...</span>
                      </>
                    ) : (
                      "Rastrear Pedido"
                    )}
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

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all" 
                    disabled={isLoading}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {isLoading ? (
                      <>
                        <span className="animate-pulse">Buscando</span>
                        <span className="animate-bounce ml-1">...</span>
                      </>
                    ) : (
                      "Buscar Pedidos"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results Section */}
        {orders.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            {orders.length > 1 && (
              <div className="text-center p-5 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-xl border-2 border-primary/20 shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <p className="text-lg font-bold">
                    ¡Encontrado! {orders.length} pedidos
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Todos los pedidos en el rango de fechas seleccionado
                </p>
              </div>
            )}
            
            {orders.map((order) => renderOrderCard(order))}

            {/* Help Section */}
            <Card className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/5 border-2 border-primary/20 shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-purple-600 to-primary"></div>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-primary to-purple-600">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-xl">¿Necesitas ayuda?</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-5">
                  Nuestro equipo está listo para ayudarte con cualquier pregunta sobre tu pedido.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    asChild 
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <a href="tel:6157289932">
                      📞 Llamar: 615-728-9932
                    </a>
                  </Button>
                  <Button 
                    asChild 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <a href="mailto:ventas@wincova.com">
                      ✉️ Email: ventas@wincova.com
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Information Card */}
        {orders.length === 0 && !isLoading && (
          <Card className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/5 border-2 border-primary/20 shadow-xl overflow-hidden animate-scale-in">
            <div className="h-1 bg-gradient-to-r from-primary via-purple-600 to-primary"></div>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-2xl">Información Importante</h3>
              </div>
              
              <div className="grid gap-3">
                <div className="flex gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:scale-[1.02] transition-transform">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm">El número de pedido se envía por <strong>correo inmediatamente</strong> después de tu compra.</span>
                </div>
                
                <div className="flex gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:scale-[1.02] transition-transform">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm">Si no encuentras el correo, <strong>revisa tu carpeta de spam</strong>.</span>
                </div>
                
                <div className="flex gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:scale-[1.02] transition-transform">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-sm">Los números de rastreo se actualizan <strong>cada 24 horas</strong> una vez que el pedido es enviado.</span>
                </div>
                
                <div className="flex gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:scale-[1.02] transition-transform">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span className="text-sm">Los envíos desde nuestros proveedores en <strong>US/EU tardan 2-5 días hábiles</strong>.</span>
                </div>
                
                <div className="flex gap-3 p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-red-500/10 border border-pink-500/20 hover:scale-[1.02] transition-transform">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-pink-600" />
                  </div>
                  <span className="text-sm">Si no tienes tu número de pedido, <strong>usa la búsqueda por fechas</strong>.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;
