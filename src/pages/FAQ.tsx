import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Package, CreditCard, RefreshCw, TruckIcon, HelpCircle, Phone, Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

const FAQ = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:scale-105 transition-transform"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        {/* Hero Section - PREMIUM */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
            <HelpCircle className="h-4 w-4 text-secondary" />
            <span className="text-sm font-semibold">Respuestas Instantáneas</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            ¿Tienes Preguntas?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            <span className="font-semibold text-foreground">Respuestas claras.</span> Sin vueltas. 
            Todo lo que necesitas saber para <span className="text-primary font-semibold">comprar con confianza</span>.
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
              <span className="text-2xl">⚡</span>
              <span className="text-sm font-semibold">Envío 2-5 días</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
              <span className="text-2xl">🛡️</span>
              <span className="text-sm font-semibold">Compra Segura</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-2xl">💰</span>
              <span className="text-sm font-semibold">Mejores Precios</span>
            </div>
          </div>
        </div>

        {/* Shipping Section - PREMIUM DESIGN */}
        <Card className="mb-6 border-2 hover:shadow-xl transition-all duration-300">
          <div className="h-1 bg-gradient-to-r from-primary to-secondary"></div>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Envíos Rápidos</h2>
                <p className="text-sm text-muted-foreground">Entrega garantizada en 2-5 días</p>
              </div>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="shipping-1">
                <AccordionTrigger>¿Qué métodos de envío están disponibles?</AccordionTrigger>
                <AccordionContent>
                  Actualmente, ofrecemos envío terrestre dentro de los Estados Unidos y Puerto Rico a través de transportistas confiables. 
                  No ofrecemos envío acelerado o aéreo en este momento.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping-2">
                <AccordionTrigger>¿Ofrecen envío internacional?</AccordionTrigger>
                <AccordionContent>
                  Por el momento, solo enviamos dentro de los Estados Unidos y Puerto Rico. Estamos trabajando para ofrecer envío internacional en el futuro.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping-3">
                <AccordionTrigger>¿Cuánto tarda la entrega?</AccordionTrigger>
                <AccordionContent>
                  Los tiempos de entrega varían según la ubicación del proveedor y tu dirección. 
                  Generalmente, los envíos desde Estados Unidos y Europa toman de 2 a 5 días hábiles.
                  Una vez enviado, recibirás un número de seguimiento para <Link to="/track-order" className="text-primary hover:underline">monitorear tu pedido</Link>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping-4">
                <AccordionTrigger>¿Cómo sabré si mi pedido ha sido enviado?</AccordionTrigger>
                <AccordionContent>
                  Te enviaremos un correo electrónico con información de seguimiento una vez que tu pedido haya sido despachado.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping-5">
                <AccordionTrigger>¿Puedo cambiar la dirección después de que mi pedido ha sido enviado?</AccordionTrigger>
                <AccordionContent>
                  No, pero en algunos casos, el transportista puede redirigir el paquete. Contáctanos lo antes posible si necesitas hacer un cambio.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Payments Section - PREMIUM */}
        <Card className="mb-6 border-2 hover:shadow-xl transition-all duration-300">
          <div className="h-1 bg-gradient-to-r from-secondary to-primary"></div>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-primary shadow-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Pagos Seguros</h2>
                <p className="text-sm text-muted-foreground">Protección 100% garantizada</p>
              </div>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="payment-1">
                <AccordionTrigger>¿Qué métodos de pago aceptan?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Aceptamos:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Tarjetas de crédito y débito (Visa, MasterCard, American Express, Discover, Diners Club, JCB, Maestro)</li>
                    <li>PayPal, Apple Pay, Google Pay</li>
                    <li>Afterpay y Klarna (compra ahora, paga después)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-2">
                <AccordionTrigger>¿Es seguro comprar en línea?</AccordionTrigger>
                <AccordionContent>
                  Sí, protegemos tus datos con encriptación SSL y seguridad avanzada. Tu información de pago está completamente segura.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Orders Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Pedidos</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="order-1">
                <AccordionTrigger>¿Cómo hago un pedido?</AccordionTrigger>
                <AccordionContent>
                  Simplemente agrega productos a tu carrito y procede al pago ingresando tus datos de envío y pago. 
                  Es rápido y sencillo.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="order-2">
                <AccordionTrigger>¿Cómo cancelo o modifico mi pedido?</AccordionTrigger>
                <AccordionContent>
                  Puedes cancelar tu pedido antes de que sea enviado desde tu cuenta en la sección "Mis Pedidos". 
                  Si ya ha sido enviado, necesitarás iniciar una devolución.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="order-3">
                <AccordionTrigger>¿Cómo rastreo mi pedido?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    Recibirás un correo electrónico con el número de rastreo una vez que tu pedido sea enviado. 
                    También puedes visitar nuestra <Link to="/track-order" className="text-primary hover:underline font-semibold">página de rastreo de pedidos</Link> e 
                    ingresar tu número de pedido y correo electrónico para verificar el estado en tiempo real.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="order-4">
                <AccordionTrigger>Estados del pedido y qué significan</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    <li><strong>Procesando:</strong> Tu pedido ha sido recibido y está siendo preparado para el envío.</li>
                    <li><strong>Enviado:</strong> Tu pedido ha salido de nuestro almacén y está en camino a tu dirección.</li>
                    <li><strong>En Tránsito:</strong> El paquete está en camino y puedes rastrear su ubicación.</li>
                    <li><strong>Entregado:</strong> Tu pedido ha sido entregado en la dirección indicada.</li>
                    <li><strong>Retrasado:</strong> Puede haber retrasos del transportista; verifica la información de seguimiento.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="order-5">
                <AccordionTrigger>¿Qué pasa si mi pedido muestra como entregado pero no lo he recibido?</AccordionTrigger>
                <AccordionContent>
                  Primero, verifica con vecinos o áreas cercanas. Si aún no lo encuentras, contacta al transportista o a nuestro equipo de soporte para asistencia.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Returns and Exchanges Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Devoluciones y Cambios</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="return-1">
                <AccordionTrigger>¿Cómo devuelvo un producto?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Debes reportar cualquier problema dentro de 15 días de recibir tu pedido. Sigue estos pasos:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li><strong>Contáctanos inmediatamente:</strong> Envía un correo a <a href="mailto:ventas@wincova.com" className="text-primary hover:underline">ventas@wincova.com</a> o llama al <a href="tel:6157289932" className="text-primary hover:underline">615-728-9932</a> con tu número de pedido.</li>
                    <li><strong>Proporciona evidencia:</strong> Envía fotos claras del problema (producto dañado, incorrecto, defectuoso, etc.).</li>
                    <li><strong>Recibe la etiqueta de devolución:</strong> Si es elegible, te enviaremos por correo una etiqueta de envío de devolución.</li>
                    <li><strong>Empaca el producto:</strong> Asegúrate de que se devuelva en su empaque original y sin usar.</li>
                    <li><strong>Envía el paquete:</strong> Usa la etiqueta proporcionada y envíanos el número de rastreo.</li>
                    <li><strong>Procesamos tu reembolso:</strong> Una vez que recibamos el producto y verifiquemos su condición, procesaremos tu reembolso dentro de 5 a 10 días hábiles.</li>
                  </ol>
                  <p className="mt-3 text-sm">
                    Para más detalles, consulta nuestra <Link to="/return-policy" className="text-primary hover:underline font-semibold">Política de Devoluciones completa</Link>.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="return-2">
                <AccordionTrigger>Condiciones generales para devoluciones y cambios</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Debes reportar problemas dentro de 15 días de recibir el producto.</li>
                    <li>Los productos deben estar sin usar, en su empaque original y con todas las etiquetas adjuntas.</li>
                    <li>Algunos productos no son elegibles para devolución (ver lista de excepciones abajo).</li>
                    <li>No ofrecemos cambios directos, pero puedes devolver el producto y hacer un nuevo pedido.</li>
                    <li>Si el error fue nuestro (producto incorrecto o defectuoso), cubriremos los costos de envío de devolución.</li>
                  </ul>
                  <p className="mt-3 text-sm">
                    Consulta nuestra <Link to="/return-policy" className="text-primary hover:underline font-semibold">Política de Devoluciones</Link> para información detallada.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="return-3">
                <AccordionTrigger>Razones válidas para una devolución</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Producto defectuoso o dañado durante el transporte</li>
                    <li>Artículo incorrecto recibido</li>
                    <li>El producto no coincide con la descripción</li>
                    <li>Partes o accesorios faltantes</li>
                    <li>Cambio de opinión (depende del proveedor; el cliente es responsable del costo de envío de devolución)</li>
                  </ul>
                  <p className="mt-3 text-sm">
                    <strong>Nota:</strong> Lee nuestra <Link to="/return-policy" className="text-primary hover:underline font-semibold">Política de Devoluciones</Link> para entender todos los detalles y condiciones.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="return-4">
                <AccordionTrigger>Productos no elegibles para devolución</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Productos de higiene personal (cepillos de dientes, rastrillos, cosméticos abiertos)</li>
                    <li>Ropa íntima o interior</li>
                    <li>Productos personalizados o hechos a pedido</li>
                    <li>Artículos en liquidación o venta final</li>
                    <li>Tarjetas de regalo y productos digitales</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Refunds Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Reembolsos</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="refund-1">
                <AccordionTrigger>¿Cuándo recibiré mi reembolso?</AccordionTrigger>
                <AccordionContent>
                  Una vez que el producto sea recibido y aprobado, procesaremos tu reembolso dentro de 5 a 10 días hábiles.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="refund-2">
                <AccordionTrigger>¿Cómo recibiré mi reembolso?</AccordionTrigger>
                <AccordionContent>
                  Los reembolsos se emitirán al mismo método de pago utilizado para la compra.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="refund-3">
                <AccordionTrigger>¿Se reembolsarán mis costos de envío?</AccordionTrigger>
                <AccordionContent>
                  Sí, si el producto era defectuoso, incorrecto o no coincide con la descripción. 
                  En casos de cambio de opinión, el cliente es responsable de los costos de envío de devolución.
                  Para más información, consulta nuestra <Link to="/return-policy" className="text-primary hover:underline font-semibold">Política de Devoluciones</Link>.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact CTA - ULTRA PREMIUM */}
        <Card className="bg-gradient-to-br from-secondary/5 via-primary/5 to-secondary/5 border-2 border-primary/20 shadow-2xl overflow-hidden animate-scale-in">
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
          <CardContent className="pt-8">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary to-secondary shadow-xl mb-4">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">¿Aún tienes dudas?</h2>
              <p className="text-muted-foreground text-lg">
                Nuestro equipo élite está <span className="font-semibold text-foreground">listo para ayudarte</span> en segundos
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <Button 
                asChild 
                size="lg"
                className="bg-secondary hover:bg-secondary/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <a href="tel:6157289932" className="flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5" />
                  <div className="text-left">
                    <div className="text-xs opacity-90">Llámanos Ya</div>
                    <div className="font-bold">615-728-9932</div>
                  </div>
                </a>
              </Button>
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <a href="https://wa.me/16157289932" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <span className="text-xl">💬</span>
                  <div className="text-left">
                    <div className="text-xs opacity-90">WhatsApp</div>
                    <div className="font-bold">Chat Instantáneo</div>
                  </div>
                </a>
              </Button>
            </div>
            
            {/* FOMO Element */}
            <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-semibold">
                ⚡ <span className="text-primary">Respuesta promedio: 2 minutos</span> | 
                🎯 Más de 1,000 clientes satisfechos este mes
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;