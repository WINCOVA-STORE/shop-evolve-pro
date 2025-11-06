import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, AlertCircle, CheckCircle, XCircle, Mail, Phone } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

const ReturnPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
            <Package className="h-4 w-4 text-secondary" />
            <span className="text-sm font-semibold">Política Clara y Justa</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Devoluciones y Reembolsos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
            <span className="font-semibold text-foreground">Tu satisfacción es nuestra prioridad.</span> 
            Política transparente, proceso simple, <span className="text-primary font-semibold">reembolso garantizado</span>.
          </p>
          <p className="text-sm text-muted-foreground">
            Última actualización: Octubre 2025
          </p>
          
          {/* Trust Badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/10 border-2 border-secondary/20">
            <span className="text-2xl">🛡️</span>
            <span className="font-semibold">Compra 100% Protegida</span>
          </div>
        </div>

        {/* Important Notice - PREMIUM */}
        <Card className="mb-8 border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 shadow-xl">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
                <AlertCircle className="h-6 w-6 text-white flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Nuestro Modelo de Negocio</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Wincova trabaja con <span className="font-semibold text-foreground">proveedores certificados en diferentes partes de Estados Unidos y el mundo</span>. 
                  <span className="text-primary font-semibold"> Los tiempos de entrega varían según la ubicación del proveedor y el producto</span>, con políticas claras que protegen tus derechos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Window - PREMIUM */}
        <Card className="mb-6 border-2 hover:shadow-xl transition-all duration-300">
          <div className="h-1 bg-gradient-to-r from-primary to-secondary"></div>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Plazo para Devoluciones</h2>
                <p className="text-sm text-muted-foreground">15 días de garantía</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Debes reportar cualquier problema con tu pedido dentro de los <strong className="text-foreground">15 días calendario</strong> después 
                de recibir el producto. Después de este período, el pedido se considera entregado satisfactoriamente.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">⏰ Importante sobre el plazo:</p>
                <p className="text-sm text-muted-foreground">
                  Los 15 días se cuentan desde la fecha de entrega confirmada por el transportista. 
                  Te recomendamos revisar tu paquete inmediatamente al recibirlo y contactarnos de inmediato si hay algún problema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valid Reasons - PREMIUM */}
        <Card className="mb-6 border-2 hover:shadow-xl transition-all duration-300">
          <div className="h-1 bg-gradient-to-r from-secondary to-primary"></div>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-primary shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Razones Válidas</h2>
                <p className="text-sm text-muted-foreground">Siempre protegemos tu compra</p>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-4">
              Aceptamos devoluciones en las siguientes situaciones:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Producto Defectuoso o Dañado</p>
                  <p className="text-sm text-muted-foreground">
                    Si el producto llegó con defectos de fabricación o daños durante el transporte. 
                    <strong> Cubrimos el 100% del costo de devolución y envío del reemplazo.</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Producto Incorrecto</p>
                  <p className="text-sm text-muted-foreground">
                    Si recibiste un producto diferente al que ordenaste. 
                    <strong> Cubrimos todos los costos asociados.</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Producto No Coincide con la Descripción</p>
                  <p className="text-sm text-muted-foreground">
                    Si el producto difiere significativamente de lo mostrado en nuestro sitio web. 
                    <strong> Cubrimos los costos de devolución.</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Partes o Accesorios Faltantes</p>
                  <p className="text-sm text-muted-foreground">
                    Si el producto llegó incompleto según lo especificado en la descripción.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Cambio de Opinión</p>
                  <p className="text-sm text-muted-foreground">
                    Depende del proveedor del producto. Algunos aceptan devoluciones por cambio de opinión, otros no. 
                    <strong> El cliente es responsable del costo de envío de devolución</strong> y el producto debe estar 
                    sin usar, con etiquetas originales y empaque intacto.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Non-Returnable Items */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold">Productos No Elegibles para Devolución</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              Por razones de higiene, seguridad y regulaciones, los siguientes productos NO pueden ser devueltos:
            </p>

            <ul className="space-y-2">
              <li className="flex gap-2 items-start">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Productos de higiene personal (cepillos de dientes, rastrillos, cosméticos abiertos)</span>
              </li>
              <li className="flex gap-2 items-start">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Ropa interior o prendas íntimas</span>
              </li>
              <li className="flex gap-2 items-start">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Productos personalizados o hechos a pedido</span>
              </li>
              <li className="flex gap-2 items-start">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Artículos en liquidación o venta final (marcados claramente como "Venta Final")</span>
              </li>
              <li className="flex gap-2 items-start">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Tarjetas de regalo y productos digitales</span>
              </li>
              <li className="flex gap-2 items-start">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Productos que hayan sido usados, lavados o alterados de cualquier forma</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Return Process */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Proceso de Devolución Paso a Paso</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Para procesar una devolución, sigue estos pasos cuidadosamente:
            </p>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Contáctanos Dentro del Plazo</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Comunícate con nuestro equipo de soporte dentro de los 15 días de recibir tu pedido a través de:
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>📧 Email: <a href="mailto:ventas@wincova.com" className="text-primary hover:underline">ventas@wincova.com</a></p>
                    <p>📱 Teléfono: <a href="tel:6157289932" className="text-primary hover:underline">615-728-9932</a></p>
                    <p>📦 <Link to="/faq" className="text-primary hover:underline">Ver Preguntas Frecuentes</Link></p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Proporciona Evidencia Fotográfica</h3>
                  <p className="text-sm text-muted-foreground">
                    Envíanos fotos claras que muestren el problema: producto dañado, incorrecto, defectuoso, etc. 
                    Incluye fotos del empaque si es relevante. También necesitaremos tu número de pedido.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Evaluación y Aprobación</h3>
                  <p className="text-sm text-muted-foreground">
                    Nuestro equipo revisará tu caso en un plazo de 24-48 horas hábiles y coordinará con el proveedor. 
                    Te informaremos si tu devolución es aprobada y te enviaremos instrucciones específicas.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Etiqueta de Devolución</h3>
                  <p className="text-sm text-muted-foreground">
                    Si la devolución es elegible, te enviaremos una etiqueta de envío de devolución por correo electrónico 
                    con instrucciones sobre dónde y cómo enviar el producto.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Empaca y Envía el Producto</h3>
                  <p className="text-sm text-muted-foreground">
                    Empaca el producto de forma segura en su empaque original (si es posible). El producto debe estar sin usar 
                    y con todas las etiquetas originales adjuntas. Envía el paquete usando la etiqueta proporcionada.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  6
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Proporciona el Número de Rastreo</h3>
                  <p className="text-sm text-muted-foreground">
                    Una vez que hayas enviado el paquete, envíanos el número de rastreo. Esto es obligatorio para procesar 
                    tu reembolso o reemplazo.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  7
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Procesamiento del Reembolso o Reemplazo</h3>
                  <p className="text-sm text-muted-foreground">
                    Una vez que el proveedor reciba y verifique el producto devuelto, procesaremos tu reembolso o enviaremos 
                    el reemplazo dentro de 5 a 10 días hábiles.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refunds Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Reembolsos</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Cuándo recibiré mi reembolso?</h3>
                <p className="text-sm text-muted-foreground">
                  Una vez que el proveedor reciba y apruebe el producto devuelto, procesaremos tu reembolso dentro de 
                  <strong> 5 a 10 días hábiles</strong>. El tiempo que tarde en reflejarse en tu cuenta bancaria depende 
                  de tu institución financiera (generalmente 3-5 días adicionales).
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">¿Cómo recibiré mi reembolso?</h3>
                <p className="text-sm text-muted-foreground">
                  Los reembolsos se emitirán al mismo método de pago utilizado para la compra original 
                  (tarjeta de crédito/débito, PayPal, etc.).
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">¿Se reembolsarán los costos de envío?</h3>
                <ul className="text-sm text-muted-foreground space-y-2 mt-2">
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span><strong>Sí</strong>, si el producto era defectuoso, incorrecto o no coincide con la descripción. 
                    Reembolsaremos el costo total del producto y el envío original.</span>
                  </li>
                  <li className="flex gap-2">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <span><strong>No</strong>, si la devolución es por cambio de opinión. En este caso, el cliente es 
                    responsable de los costos de envío de devolución y solo se reembolsa el precio del producto.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Reembolsos parciales</h3>
                <p className="text-sm text-muted-foreground">
                  Se pueden emitir reembolsos parciales si el producto se devuelve en condiciones que no son óptimas 
                  (ej: empaque dañado pero producto intacto, sin accesorios originales, etc.).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Cases */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Casos Especiales</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">📦 Paquete Entregado pero No Recibido</h3>
                <p className="text-sm text-muted-foreground">
                  Si el rastreo muestra que tu paquete fue entregado pero no lo recibiste, primero verifica con vecinos 
                  o en áreas cercanas a tu puerta. Si no aparece, debes presentar un reclamo directamente con el 
                  transportista. Contáctanos y te asistiremos en el proceso.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">📍 Error en la Dirección de Envío</h3>
                <p className="text-sm text-muted-foreground">
                  Si el paquete fue devuelto al proveedor debido a una dirección incorrecta proporcionada por el cliente, 
                  el costo de reenvío será responsabilidad del cliente.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">⏰ Pedido Retrasado</h3>
                <p className="text-sm text-muted-foreground">
                  Si tu pedido no ha sido procesado o enviado dentro del tiempo acordado y deseas cancelarlo, contáctanos. 
                  El proveedor procesará un reembolso completo. Ten en cuenta que en temporadas de alto volumen 
                  (Black Friday, Navidad), los tiempos de procesamiento pueden ser más largos.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">📦 Empaque Dañado pero Producto Intacto</h3>
                <p className="text-sm text-muted-foreground">
                  Si solo el empaque está dañado pero el producto está en perfectas condiciones, debes presentar un 
                  reclamo directamente con el transportista. No podemos procesar una devolución en este caso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchanges */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Cambios por Otro Producto</h2>
            <p className="text-muted-foreground">
              Actualmente <strong>no ofrecemos cambios directos</strong> de un producto por otro (por ejemplo, cambiar 
              una talla o color). Si deseas un producto diferente, debes:
            </p>
            <ol className="list-decimal list-inside space-y-2 mt-4 text-muted-foreground">
              <li>Solicitar la devolución del producto original siguiendo el proceso descrito arriba</li>
              <li>Esperar a recibir tu reembolso</li>
              <li>Realizar un nuevo pedido con el producto correcto</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-4">
              Esta política nos permite procesar cada caso de manera más rápida y eficiente.
            </p>
          </CardContent>
        </Card>

        {/* Contact CTA - ULTRA PREMIUM */}
        <Card className="bg-gradient-to-br from-secondary/5 via-primary/5 to-secondary/5 border-2 border-primary/20 shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
          <CardContent className="pt-8">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary to-secondary shadow-xl mb-4">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">¿Necesitas Hacer una Devolución?</h2>
              <p className="text-muted-foreground text-lg">
                Proceso <span className="font-semibold text-foreground">rápido y sin complicaciones</span>. 
                Contacta a nuestro equipo <span className="text-primary font-semibold">ahora mismo</span>
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <Button 
                asChild
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <a href="mailto:ventas@wincova.com" className="flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5" />
                  <div className="text-left">
                    <div className="text-xs opacity-90">Email Directo</div>
                    <div className="font-bold">ventas@wincova.com</div>
                  </div>
                </a>
              </Button>
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <a href="tel:6157289932" className="flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5" />
                  <div className="text-left">
                    <div className="text-xs opacity-90">Llámanos Ya</div>
                    <div className="font-bold">615-728-9932</div>
                  </div>
                </a>
              </Button>
            </div>
            
            {/* Trust Badge */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-semibold">
                ⚡ <span className="text-primary">Respuesta en menos de 2 horas</span> | 
                🛡️ Reembolsos procesados en 5-10 días
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Final Note */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Esta política de devoluciones aplica para todos los pedidos realizados en Wincova. Nos reservamos el derecho 
            de actualizar esta política en cualquier momento. Los cambios se publicarán en esta página con la fecha de 
            la última actualización.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnPolicy;
