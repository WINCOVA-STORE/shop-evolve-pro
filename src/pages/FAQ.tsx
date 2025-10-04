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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
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
          <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            En Wincova, entendemos que puedas tener preguntas sobre nuestros productos, servicios y políticas. 
            Para hacer tu experiencia de compra lo más fluida posible, hemos reunido respuestas a algunas de las preguntas más frecuentes.
          </p>
        </div>

        {/* Shipping Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <TruckIcon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Envíos</h2>
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
                  Los tiempos de entrega varían según la ubicación y el transportista. Generalmente, el envío estándar toma de 3 a 7 días hábiles.
                  Una vez enviado, recibirás un número de seguimiento para monitorear tu pedido.
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

        {/* Payments Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Pagos</h2>
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
                  Visita nuestra página de seguimiento de pedidos e ingresa tu número de pedido y el correo electrónico asociado a la compra.
                  Podrás verificar el estado de tu pedido en tiempo real.
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
                  <p className="mb-2">Si no estás satisfecho, puedes devolverlo dentro de 30 días. Sigue estos pasos:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li><strong>Solicita la devolución:</strong> Ve a gestión de devoluciones e ingresa tu número de pedido y selecciona la razón de devolución.</li>
                    <li><strong>Recibe la etiqueta de devolución:</strong> Si es elegible, te enviaremos por correo una etiqueta de envío de devolución.</li>
                    <li><strong>Empaca el producto:</strong> Asegúrate de que se devuelva en su empaque original y sin daños.</li>
                    <li><strong>Envía el paquete:</strong> Deja el paquete en la oficina del transportista designado o programa una recogida.</li>
                    <li><strong>Procesamos tu reembolso:</strong> Una vez que recibamos el producto y verifiquemos su condición, procesaremos tu reembolso dentro de 5 a 10 días hábiles.</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="return-2">
                <AccordionTrigger>Condiciones generales para devoluciones y cambios</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Puedes devolver productos dentro de 30 días de la entrega.</li>
                    <li>Los productos deben estar sin usar, en su empaque original y con todas las etiquetas adjuntas.</li>
                    <li>Algunos productos no son elegibles para devolución (ver lista de excepciones abajo).</li>
                    <li>No ofrecemos cambios directos, pero puedes devolver el producto y hacer un nuevo pedido.</li>
                    <li>Si el error fue nuestro (producto incorrecto o defectuoso), cubriremos los costos de envío de devolución.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="return-3">
                <AccordionTrigger>Razones válidas para una devolución</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Producto defectuoso o dañado</li>
                    <li>Artículo incorrecto recibido</li>
                    <li>El producto no coincide con la descripción</li>
                    <li>Problemas de talla o ajuste</li>
                    <li>Partes o accesorios faltantes</li>
                    <li>Cambio de opinión (el cliente es responsable del costo de envío de devolución)</li>
                  </ul>
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
                  Solo si el producto era defectuoso o incorrecto. En otros casos, el cliente es responsable de los costos de envío de devolución.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">¿No encuentras la respuesta que buscas?</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Si no encuentras la información que necesitas, no dudes en contactar a nuestro equipo de servicio al cliente. 
              Estaremos encantados de ayudarte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex items-center gap-2">
                <a href="tel:6157289932">
                  <Phone className="h-4 w-4" />
                  615-728-9932
                </a>
              </Button>
              <Button asChild variant="outline" className="flex items-center gap-2">
                <a href="mailto:ventas@wincova.com">
                  <Mail className="h-4 w-4" />
                  ventas@wincova.com
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;