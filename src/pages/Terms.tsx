import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, FileText, Scale, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();
  const effectiveDate = "4 de febrero de 2025";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-lg text-muted-foreground">
            Última actualización: {effectiveDate}
          </p>
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg max-w-3xl mx-auto">
            <p className="text-sm text-amber-900 dark:text-amber-100 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>
                Al acceder y usar nuestro sitio web, aceptas estar sujeto a estos Términos y Condiciones. 
                Si no estás de acuerdo, te pedimos que no utilices nuestros servicios.
              </span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1: Introducción */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                1. Introducción y Aceptación de Términos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Bienvenido a Wincova. Al acceder y utilizar nuestro sitio web en www.wincova.com, 
                aceptas cumplir con estos Términos y Condiciones en su totalidad. Si no estás de acuerdo 
                con alguna parte de estos términos, no debes utilizar nuestros servicios.
              </p>
              <p>
                Estos términos se aplican a todos los usuarios del sitio, incluidos, entre otros, 
                clientes, navegadores, proveedores, comerciantes, afiliados y/o contribuidores de contenido.
              </p>
              <p className="font-semibold">
                Nos reservamos el derecho de modificar estos términos en cualquier momento sin previo aviso. 
                Es tu responsabilidad revisar periódicamente esta página para estar al tanto de cualquier cambio.
              </p>
            </CardContent>
          </Card>

          {/* Section 2: Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6 text-primary" />
                2. Información General de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Wincova es una empresa de comercio electrónico registrada en el estado de Tennessee, 
                Estados Unidos de América.
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Estos términos aplican a todos los usuarios: clientes, afiliados y visitantes del sitio web</li>
                <li>Estos términos son aplicables junto con nuestra Política de Privacidad y Políticas de Devolución y Envío</li>
                <li>Al realizar una compra, confirmas que eres mayor de 18 años o cuentas con el consentimiento de un padre/tutor legal</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 3: Uso del Sitio Web */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                3. Uso Aceptable del Sitio Web
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p className="font-semibold">Está prohibido usar nuestro sitio web para:</p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Cualquier propósito ilegal o no autorizado</li>
                <li>Violar cualquier ley local, estatal, nacional o internacional</li>
                <li>Infringir nuestros derechos de propiedad intelectual o los de terceros</li>
                <li>Transmitir virus, malware o cualquier código de naturaleza destructiva</li>
                <li>Intentar obtener acceso no autorizado a nuestros sistemas o datos</li>
                <li>Recopilar información de otros usuarios sin su consentimiento</li>
                <li>Participar en actividades fraudulentas o engañosas</li>
                <li>Realizar ingeniería inversa, descompilar o desensamblar cualquier software</li>
              </ul>
              <p className="font-semibold text-primary">
                Nos reservamos el derecho de suspender o cancelar tu cuenta si violas estos términos.
              </p>
            </CardContent>
          </Card>

          {/* Section 4: Productos e Información */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                4. Productos, Precios y Disponibilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Nos esforzamos por garantizar que toda la información del producto sea precisa y esté actualizada. 
                Sin embargo:
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Los precios, imágenes y descripciones pueden cambiar sin previo aviso</li>
                <li>Nos reservamos el derecho de corregir errores en la información del producto en cualquier momento</li>
                <li>No garantizamos que la calidad de los productos cumplirá con tus expectativas</li>
                <li>Las imágenes de productos son solo para fines ilustrativos; el color real puede variar</li>
                <li>Los productos están sujetos a disponibilidad y pueden agotarse sin previo aviso</li>
                <li>Nos reservamos el derecho de limitar las cantidades de compra por persona, hogar o pedido</li>
                <li>Nos reservamos el derecho de descontinuar cualquier producto en cualquier momento</li>
              </ul>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium">
                  📦 Nota importante: En caso de error de precio evidente (por ejemplo, un artículo de $100 
                  listado a $1), nos reservamos el derecho de cancelar el pedido y reembolsar el monto pagado.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Pedidos y Pagos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                5. Pedidos, Pagos y Confirmación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <h4 className="font-semibold text-lg">5.1 Realización de Pedidos</h4>
              <p>
                Al realizar un pedido en nuestro sitio web, estás haciendo una oferta para comprar un producto. 
                Nos reservamos el derecho de aceptar o rechazar tu pedido por cualquier motivo, incluyendo:
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Disponibilidad del producto</li>
                <li>Errores en la información del producto o precio</li>
                <li>Detección de actividad fraudulenta o sospechosa</li>
                <li>Incumplimiento de estos Términos y Condiciones</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">5.2 Métodos de Pago Aceptados</h4>
              <p>Aceptamos los siguientes métodos de pago:</p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Tarjetas de crédito/débito: Visa, Mastercard, American Express, Discover</li>
                <li>Pagos digitales: PayPal, Apple Pay, Google Pay</li>
                <li>Servicios de pago diferido: Afterpay, Klarna (sujeto a aprobación de crédito)</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">5.3 Seguridad y Prevención de Fraude</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Todos los pagos se procesan con encriptación SSL (Secure Sockets Layer)</li>
                <li>No almacenamos información completa de tarjetas de crédito en nuestros servidores</li>
                <li>Nos reservamos el derecho de solicitar información adicional para verificar tu identidad</li>
                <li>Podemos cancelar pedidos que presenten actividad sospechosa o fraudulenta</li>
                <li>Trabajamos con proveedores de pago certificados PCI-DSS</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">5.4 Confirmación de Pedido</h4>
              <p>
                Recibirás un correo electrónico de confirmación una vez que tu pedido haya sido procesado exitosamente. 
                Esta confirmación no constituye la aceptación de tu pedido; es simplemente un acuse de recibo.
              </p>
            </CardContent>
          </Card>

          {/* Section 6: Envíos y Entregas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                6. Envíos, Entregas y Riesgos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <h4 className="font-semibold text-lg">6.1 Métodos de Envío</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Proporcionamos envío terrestre dentro de Estados Unidos (incluido Puerto Rico)</li>
                <li>Actualmente no ofrecemos envío acelerado o aéreo</li>
                <li>Los tiempos de entrega son estimados y no están garantizados</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">6.2 Envío Internacional</h4>
              <p>
                Actualmente no ofrecemos envío fuera de Estados Unidos, pero estamos trabajando en esta opción.
              </p>

              <h4 className="font-semibold text-lg mt-6">6.3 Tiempos de Procesamiento y Entrega</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li>El procesamiento de pedidos puede tomar de 24 a 48 horas hábiles antes del envío</li>
                <li>Los tiempos de entrega dependen del transportista y la ubicación del cliente</li>
                <li>No somos responsables por retrasos causados por el transportista o factores externos</li>
                <li>Durante temporadas altas (festividades), los tiempos pueden extenderse</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">6.4 Transferencia de Riesgo</h4>
              <p className="font-semibold text-primary">
                El riesgo de pérdida y el título de los productos comprados pasan a ti al momento de la entrega 
                al transportista. Una vez que el paquete es entregado al transportista, no somos responsables 
                por pérdidas, daños o retrasos durante el tránsito.
              </p>

              <h4 className="font-semibold text-lg mt-6">6.5 Dirección de Envío</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Es tu responsabilidad proporcionar una dirección de envío precisa y completa</li>
                <li>No somos responsables por paquetes enviados a direcciones incorrectas proporcionadas por ti</li>
                <li>Los pedidos no pueden redirigirse una vez enviados</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 7: Devoluciones y Reembolsos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                7. Política de Devoluciones y Reembolsos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <h4 className="font-semibold text-lg">7.1 Periodo de Devolución</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Aceptamos devoluciones dentro de los 30 días posteriores a la recepción del producto</li>
                <li>Los productos deben estar sin usar y en su embalaje original</li>
                <li>Debes incluir todos los accesorios, manuales y materiales originales</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">7.2 Productos No Elegibles para Devolución</h4>
              <p>No aceptamos devoluciones de:</p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Productos personalizados o hechos a medida</li>
                <li>Tarjetas de regalo</li>
                <li>Artículos en liquidación o venta final (marcados como "Final Sale")</li>
                <li>Productos de higiene personal (si el sello está roto)</li>
                <li>Artículos perecederos</li>
                <li>Descargas digitales o software</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">7.3 Proceso de Reembolso</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Una vez aprobada la devolución, el reembolso se procesará en un plazo de 3 a 10 días hábiles</li>
                <li>El reembolso se realizará al método de pago original</li>
                <li>Los costos de envío no son reembolsables, a menos que el error sea nuestro</li>
                <li>Tú eres responsable de los costos de envío de devolución</li>
                <li>Se puede aplicar una tarifa de reposición del 15% para artículos devueltos que no estén en condiciones de reventa</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">7.4 Intercambios</h4>
              <p>
                No ofrecemos intercambios directos. Para cambiar un producto, debes devolverlo y realizar un nuevo pedido.
              </p>

              <h4 className="font-semibold text-lg mt-6">7.5 Productos Dañados o Defectuosos</h4>
              <p>
                Si recibes un producto dañado o defectuoso, contáctanos dentro de las 48 horas posteriores a la recepción. 
                Proporcionaremos un reembolso completo o un reemplazo sin costo adicional.
              </p>
            </CardContent>
          </Card>

          {/* Section 8: Programa de Recompensas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                8. Programa de Recompensas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <h4 className="font-semibold text-lg">8.1 Acumulación de Puntos</h4>
              <p>
                Los clientes pueden ganar puntos a través de compras, referencias y promociones especiales. 
                Consulta los términos completos del programa en nuestra página de Términos del Programa de Recompensas.
              </p>

              <h4 className="font-semibold text-lg mt-6">8.2 Restricciones del Programa</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Los puntos no tienen valor en efectivo y no son transferibles</li>
                <li>Los puntos expiran 12 meses después de su emisión</li>
                <li>El uso máximo de puntos es del 2% del monto total de compra</li>
                <li>Nos reservamos el derecho de modificar o cancelar el programa en cualquier momento</li>
                <li>Los puntos pueden ser revocados en caso de fraude o abuso del sistema</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 9: Propiedad Intelectual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                9. Propiedad Intelectual y Derechos de Autor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Todo el contenido de este sitio web, incluyendo pero no limitado a texto, gráficos, logos, 
                iconos, imágenes, clips de audio, descargas digitales y compilaciones de datos, es propiedad 
                de Wincova o de sus proveedores de contenido y está protegido por leyes de derechos de autor 
                de Estados Unidos e internacionales.
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>No puedes reproducir, duplicar, copiar, vender o explotar ninguna parte del sitio sin nuestro permiso expreso</li>
                <li>Las marcas comerciales de Wincova no pueden ser usadas sin autorización previa por escrito</li>
                <li>El uso no autorizado puede resultar en acciones legales</li>
                <li>Cualquier contenido generado por usuarios otorga a Wincova una licencia perpetua y libre de regalías para usar ese contenido</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 10: Privacidad y Protección de Datos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                10. Privacidad y Protección de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <h4 className="font-semibold text-lg">10.1 Cumplimiento de Regulaciones</h4>
              <p>Wincova cumple con las siguientes regulaciones de protección de datos:</p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>CCPA (California Consumer Privacy Act)</li>
                <li>GDPR (General Data Protection Regulation – UE)</li>
                <li>CAN-SPAM Act</li>
                <li>Otras leyes estatales y federales aplicables</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">10.2 Protección de Datos</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Utilizamos encriptación SSL para garantizar la seguridad de tu información</li>
                <li>No compartimos tus datos con terceros sin tu consentimiento</li>
                <li>Tienes derecho a solicitar acceso, corrección o eliminación de tus datos personales</li>
                <li>Consulta nuestra Política de Privacidad completa para más detalles</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">10.3 Uso de Cookies</h4>
              <p>
                Utilizamos cookies para mejorar la experiencia del usuario. Puedes desactivar las cookies 
                en tu navegador, pero esto puede afectar la funcionalidad del sitio.
              </p>
            </CardContent>
          </Card>

          {/* Section 11: Limitación de Responsabilidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Scale className="h-6 w-6 text-primary" />
                11. Limitación de Responsabilidad y Descargos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <h4 className="font-semibold text-lg">11.1 Descargo de Garantías</h4>
              <p className="uppercase font-bold">
                NUESTRO SITIO WEB Y TODOS LOS PRODUCTOS SE PROPORCIONAN "TAL CUAL" Y "SEGÚN DISPONIBILIDAD" 
                SIN GARANTÍAS DE NINGÚN TIPO, YA SEAN EXPRESAS O IMPLÍCITAS.
              </p>
              <p>
                En la medida máxima permitida por la ley aplicable, rechazamos todas las garantías, 
                expresas o implícitas, incluyendo, pero no limitado a, garantías implícitas de 
                comerciabilidad, idoneidad para un propósito particular y no infracción.
              </p>

              <h4 className="font-semibold text-lg mt-6">11.2 Limitación de Responsabilidad</h4>
              <p className="uppercase font-bold">
                EN NINGÚN CASO WINCOVA, SUS DIRECTORES, EMPLEADOS O AGENTES SERÁN RESPONSABLES DE DAÑOS 
                INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O PUNITIVOS, INCLUYENDO PÉRDIDA DE 
                BENEFICIOS, INGRESOS, DATOS O USO, INCURRIDOS POR TI O CUALQUIER TERCERO.
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Nuestra responsabilidad total no excederá el monto pagado por el producto en cuestión</li>
                <li>No somos responsables por interrupciones del servicio, errores técnicos o pérdida de datos</li>
                <li>No garantizamos que el sitio estará libre de virus o componentes dañinos</li>
                <li>No somos responsables por el contenido de sitios web de terceros enlazados desde nuestro sitio</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">11.3 Indemnización</h4>
              <p>
                Aceptas indemnizar, defender y eximir de responsabilidad a Wincova, sus afiliados, socios, 
                directores, empleados y agentes de cualquier reclamo, responsabilidad, daño, pérdida y gasto, 
                incluyendo honorarios razonables de abogados, que surjan de:
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Tu uso del sitio web</li>
                <li>Tu violación de estos Términos y Condiciones</li>
                <li>Tu violación de cualquier derecho de terceros</li>
                <li>Cualquier contenido que publiques en el sitio</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 12: Resolución de Disputas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Scale className="h-6 w-6 text-primary" />
                12. Ley Aplicable y Resolución de Disputas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <h4 className="font-semibold text-lg">12.1 Ley Aplicable</h4>
              <p>
                Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes del 
                estado de Tennessee, Estados Unidos de América, sin dar efecto a ningún principio de 
                conflicto de leyes.
              </p>

              <h4 className="font-semibold text-lg mt-6">12.2 Arbitraje Vinculante</h4>
              <p className="font-bold text-primary">
                CUALQUIER DISPUTA QUE SURJA DE O RELACIONADA CON ESTOS TÉRMINOS SERÁ RESUELTA MEDIANTE 
                ARBITRAJE VINCULANTE EN LUGAR DE UN TRIBUNAL.
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>El arbitraje se llevará a cabo de acuerdo con las reglas de la American Arbitration Association (AAA)</li>
                <li>El arbitraje se realizará en Tennessee, Estados Unidos</li>
                <li>La decisión del árbitro será final y vinculante</li>
                <li>Cada parte será responsable de sus propios honorarios de abogados y costos de arbitraje</li>
                <li>Excepción: Si el caso califica para la corte de reclamos menores, puedes presentar tu caso allí</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">12.3 Renuncia a Demanda Colectiva</h4>
              <p className="uppercase font-bold">
                ACEPTAS QUE CUALQUIER DISPUTA SE RESOLVERÁ INDIVIDUALMENTE Y NO COMO PARTE DE UNA 
                DEMANDA COLECTIVA O ACCIÓN REPRESENTATIVA.
              </p>

              <h4 className="font-semibold text-lg mt-6">12.4 Proceso de Resolución Informal</h4>
              <p>
                Antes de iniciar un arbitraje, aceptas intentar resolver la disputa de manera informal 
                contactándonos primero. Esto puede resultar en una resolución más rápida y menos costosa.
              </p>
            </CardContent>
          </Card>

          {/* Section 13: Cuentas de Usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                13. Cuentas de Usuario y Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <h4 className="font-semibold text-lg">13.1 Creación de Cuenta</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Para realizar compras, debes crear una cuenta y proporcionar información precisa y completa</li>
                <li>Eres responsable de mantener la confidencialidad de tu contraseña</li>
                <li>No puedes usar el nombre de otra persona o entidad</li>
                <li>Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">13.2 Suspensión o Terminación de Cuenta</h4>
              <p>Nos reservamos el derecho de suspender o terminar tu cuenta si:</p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Violas estos Términos y Condiciones</li>
                <li>Proporcionas información falsa o engañosa</li>
                <li>Participas en actividades fraudulentas</li>
                <li>Abusas de nuestro personal de atención al cliente</li>
                <li>Creas múltiples cuentas para evadir restricciones</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">13.3 Terminación por tu Parte</h4>
              <p>
                Puedes cerrar tu cuenta en cualquier momento contactando nuestro servicio al cliente. 
                La terminación no afectará ningún derecho u obligación que haya surgido antes de la terminación.
              </p>
            </CardContent>
          </Card>

          {/* Section 14: Disposiciones Generales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                14. Disposiciones Generales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <h4 className="font-semibold text-lg">14.1 Fuerza Mayor</h4>
              <p>
                Wincova no será responsable por retrasos o incumplimientos en el servicio debido a 
                desastres naturales, huelgas, fallos técnicos, pandemias, actos de guerra, terrorismo 
                o cualquier problema más allá del control de la empresa.
              </p>

              <h4 className="font-semibold text-lg mt-6">14.2 Divisibilidad</h4>
              <p>
                Si alguna disposición de estos términos se considera ilegal o inaplicable, las 
                disposiciones restantes permanecerán en vigor y efecto.
              </p>

              <h4 className="font-semibold text-lg mt-6">14.3 Acuerdo Completo</h4>
              <p>
                Estos términos representan el acuerdo completo entre Wincova y sus clientes y 
                reemplazan todos los acuerdos anteriores o contemporáneos.
              </p>

              <h4 className="font-semibold text-lg mt-6">14.4 Cesión</h4>
              <p>
                No puedes ceder o transferir estos términos sin nuestro consentimiento previo por escrito. 
                Wincova puede ceder estos términos sin restricciones.
              </p>

              <h4 className="font-semibold text-lg mt-6">14.5 Renuncia</h4>
              <p>
                Ninguna renuncia de Wincova a cualquier término o condición establecida en estos Términos 
                se considerará una renuncia adicional o continua de dicho término o condición.
              </p>

              <h4 className="font-semibold text-lg mt-6">14.6 Idioma</h4>
              <p>
                Estos Términos y Condiciones están disponibles en español e inglés. En caso de conflicto 
                entre versiones, prevalecerá la versión en inglés.
              </p>
            </CardContent>
          </Card>

          {/* Section 15: Enlaces de Terceros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                15. Enlaces a Sitios de Terceros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Nuestro sitio puede contener enlaces a sitios web de terceros que no son propiedad ni 
                están controlados por Wincova. No tenemos control sobre, y no asumimos responsabilidad 
                por el contenido, políticas de privacidad o prácticas de sitios web de terceros.
              </p>
              <p className="font-semibold">
                Reconoces y aceptas que Wincova no será responsable, directa o indirectamente, por 
                cualquier daño o pérdida causada por el uso de cualquier sitio web de terceros.
              </p>
            </CardContent>
          </Card>

          {/* Section 16: Seguridad y Protección de Datos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6 text-primary" />
                16. Seguridad, Encriptación y Protección de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <h4 className="font-semibold text-lg">16.1 Compromiso con la Seguridad</h4>
              <p>
                En Wincova, la seguridad de tu información personal y financiera es nuestra máxima prioridad. 
                Implementamos múltiples capas de seguridad para proteger tus datos en todo momento.
              </p>

              <h4 className="font-semibold text-lg mt-6">16.2 Encriptación y Seguridad de Datos</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li><strong>Encriptación SSL/TLS:</strong> Todo el tráfico entre tu navegador y nuestros servidores está protegido mediante encriptación SSL/TLS, el mismo estándar utilizado por instituciones financieras</li>
                <li><strong>Protección de Datos en Tránsito:</strong> Utilizamos protocolos HTTPS en todo el sitio web para garantizar que tu información esté cifrada durante la transmisión</li>
                <li><strong>Almacenamiento Seguro:</strong> Los datos personales almacenados en nuestra base de datos están protegidos con encriptación en reposo</li>
                <li><strong>Actualizaciones de Seguridad:</strong> Mantenemos nuestros sistemas actualizados con los últimos parches de seguridad</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">16.3 Seguridad en Procesamiento de Pagos</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li><strong>Procesador Certificado PCI-DSS Level 1:</strong> Utilizamos Stripe como nuestro procesador de pagos, certificado con el estándar PCI-DSS Level 1, el nivel más alto de certificación en la industria de pagos</li>
                <li><strong>Sin Almacenamiento de Datos de Tarjetas:</strong> Tu información de tarjeta de crédito nunca es almacenada en nuestros servidores. Toda la información de pago es procesada y almacenada de forma segura por Stripe</li>
                <li><strong>Tokenización Automática:</strong> Los datos de tu tarjeta son convertidos en tokens seguros por Stripe. Tus datos de pago reales nunca son transmitidos a nuestros servidores</li>
                <li><strong>Protección Contra Fraude:</strong> Stripe incluye protección automática contra fraude que monitorea transacciones sospechosas</li>
                <li><strong>Autenticación Adicional:</strong> Cuando es requerido por regulaciones bancarias (3D Secure/SCA) o detectado como necesario para prevenir fraude, se solicita automáticamente autenticación adicional del titular de la tarjeta</li>
                <li><strong>Sin Almacenamiento de CVV:</strong> Nunca almacenamos el código de seguridad CVV/CVC de tu tarjeta, cumpliendo con las regulaciones PCI-DSS</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">16.4 Política de Cookies</h4>
              <p>
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia de navegación y la funcionalidad del sitio web.
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del sitio (carrito de compras, autenticación de sesión). No pueden deshabilitarse.</li>
                <li><strong>Cookies de Rendimiento:</strong> Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web mediante la recopilación de información anónima</li>
                <li><strong>Cookies de Funcionalidad:</strong> Permiten que el sitio web recuerde tus preferencias (idioma, región, moneda)</li>
                <li><strong>Cookies de Marketing:</strong> Se utilizan para rastrear visitantes en los sitios web para mostrar anuncios relevantes y atractivos</li>
                <li><strong>Control de Cookies:</strong> Puedes gestionar tus preferencias de cookies en la configuración de tu navegador. Ten en cuenta que deshabilitar cookies puede afectar la funcionalidad del sitio</li>
                <li><strong>Duración de Cookies:</strong> Las cookies de sesión se eliminan al cerrar tu navegador. Las cookies persistentes permanecen hasta 12 meses o hasta que las elimines manualmente</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">16.5 Privacidad y Cumplimiento Legal</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li><strong>CCPA (California Consumer Privacy Act):</strong> Los residentes de California tienen derecho a saber qué información personal recopilamos, solicitar su eliminación y optar por no participar en la venta de datos personales</li>
                <li><strong>GDPR (General Data Protection Regulation):</strong> Para usuarios de la UE, garantizamos el derecho de acceso, rectificación, eliminación y portabilidad de datos personales</li>
                <li><strong>No Venta de Datos:</strong> Nunca vendemos, alquilamos o compartimos tu información personal con terceros con fines de marketing sin tu consentimiento explícito</li>
                <li><strong>Minimización de Datos:</strong> Solo recopilamos la información estrictamente necesaria para procesar tus pedidos y mejorar tu experiencia</li>
                <li><strong>Retención de Datos:</strong> Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos descritos o según lo requiera la ley</li>
                <li><strong>Derechos del Usuario:</strong> Puedes solicitar acceso, corrección o eliminación de tus datos personales en cualquier momento contactando nuestro servicio al cliente</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">16.6 Protección de tu Información</h4>
              <ul className="space-y-2 ml-6 list-disc">
                <li><strong>Acceso Restringido:</strong> El acceso a tu información personal está limitado únicamente al personal autorizado que lo necesita para procesar pedidos y brindar soporte</li>
                <li><strong>Respuesta a Incidentes:</strong> En el improbable caso de un incidente de seguridad que afecte tu información personal, notificaremos a los usuarios afectados según lo requiera la ley</li>
                <li><strong>Contraseñas Seguras:</strong> Las contraseñas se almacenan utilizando funciones hash criptográficas seguras, no almacenamos contraseñas en texto plano</li>
              </ul>

              <h4 className="font-semibold text-lg mt-6">16.7 Tus Responsabilidades de Seguridad</h4>
              <p className="font-semibold text-primary">
                Aunque implementamos medidas de seguridad robustas, tu cooperación es esencial:
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Mantén tu contraseña segura y no la compartas con nadie</li>
                <li>Utiliza contraseñas únicas y complejas (mínimo 8 caracteres, con letras, números y símbolos)</li>
                <li>Cierra sesión después de usar tu cuenta, especialmente en dispositivos compartidos</li>
                <li>No respondas a correos electrónicos sospechosos que soliciten información personal o de pago</li>
                <li>Mantén actualizado tu software antivirus y navegador web</li>
                <li>Notifícanos inmediatamente si sospechas de actividad no autorizada en tu cuenta</li>
              </ul>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-6">
                <p className="text-sm font-medium">
                  🔒 <strong>Compromiso de Transparencia:</strong> Si ocurre una violación de seguridad que comprometa tus datos personales, 
                  te notificaremos dentro de las 72 horas según lo requiere la ley, con detalles sobre la naturaleza de la violación 
                  y las medidas tomadas para remediarla.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 17: Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                17. Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Si tienes alguna pregunta sobre estos Términos y Condiciones, puedes contactarnos:
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li><strong>Email:</strong> ventas@wincova.com</li>
                <li><strong>Teléfono:</strong> 615-728-9932</li>
                <li><strong>Dirección:</strong> 2615 Medical Center Parkway, Suite 1560, Murfreesboro TN 37129</li>
                <li><strong>Teléfono:</strong> +1 (555) 123-4567</li>
                <li><strong>Dirección:</strong> 123 Commerce St, Nashville, TN, Estados Unidos</li>
              </ul>
              <p className="font-semibold text-primary mt-4">
                Tiempo de respuesta típico: 24-48 horas hábiles
              </p>
            </CardContent>
          </Card>

          {/* Final Notice */}
          <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-2 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Aceptación de Términos</h3>
                  <p className="text-muted-foreground mb-4">
                    Al utilizar nuestro sitio web y servicios, reconoces que has leído, entendido y 
                    aceptado estos Términos y Condiciones en su totalidad. Si no aceptas estos términos, 
                    debes cesar el uso de nuestro sitio inmediatamente.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Última actualización: {effectiveDate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg"
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Volver a la Tienda
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/rewards-terms')}
            >
              Ver Términos del Programa de Recompensas
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
