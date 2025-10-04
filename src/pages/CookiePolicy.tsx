import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Cookie } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const CookiePolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 hover:scale-105 transition-transform"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        {/* Hero Section - PREMIUM */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
            <Cookie className="h-4 w-4 text-secondary" />
            <span className="text-sm font-semibold">Tu Privacidad Primero</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Política de Cookies
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
            <span className="font-semibold text-foreground">Transparencia total.</span> Conoce cómo usamos cookies para 
            <span className="text-primary font-semibold"> mejorar tu experiencia de compra</span>.
          </p>
          <p className="text-sm text-muted-foreground">
            Última actualización: 01 de octubre de 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                ¿Qué son las cookies?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (computadora, tablet o móvil) 
                cuando visitas nuestro sitio web. Nos ayudan a mejorar tu experiencia de navegación, recordar tus preferencias 
                y proporcionarte contenido relevante.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Cookies que Utilizamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">1. Cookies Esenciales (Necesarias)</h3>
                <p className="text-muted-foreground mb-2">
                  Estas cookies son necesarias para que el sitio web funcione correctamente y no se pueden desactivar.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li><strong>Autenticación:</strong> Mantienen tu sesión iniciada de forma segura</li>
                  <li><strong>Seguridad:</strong> Protegen contra accesos no autorizados y fraudes</li>
                  <li><strong>Carrito de compras:</strong> Recuerdan los productos que agregaste</li>
                  <li><strong>Preferencias:</strong> Idioma y moneda seleccionados</li>
                </ul>
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    <strong>Cookies específicas:</strong> sb-access-token, sb-refresh-token (autenticación), 
                    cart-items (carrito), language-preference, currency-preference
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">2. Cookies de Funcionalidad</h3>
                <p className="text-muted-foreground mb-2">
                  Mejoran tu experiencia recordando tus elecciones y preferencias.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Código de referido para programa de recompensas</li>
                  <li>Preferencias de visualización del sitio</li>
                  <li>Historial de búsqueda reciente</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3. Cookies de Terceros</h3>
                <p className="text-muted-foreground mb-2">
                  Servicios externos que utilizamos para procesar pagos y mejorar funcionalidades.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li><strong>Stripe:</strong> Procesamiento seguro de pagos (cookies de sesión y funcionalidad)</li>
                  <li><strong>Supabase:</strong> Gestión de base de datos y autenticación</li>
                </ul>
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    <strong>Importante:</strong> Estas cookies son gestionadas por terceros y están sujetas 
                    a sus propias políticas de privacidad:
                  </p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Privacidad de Stripe</a></li>
                    <li>• <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Privacidad de Supabase</a></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Duración de las Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Cookies de Sesión</h4>
                <p className="text-muted-foreground">
                  Se eliminan automáticamente cuando cierras tu navegador. Utilizadas principalmente para 
                  autenticación y carrito de compras.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cookies Persistentes</h4>
                <p className="text-muted-foreground">
                  Permanecen en tu dispositivo durante un período específico (generalmente 30-365 días) 
                  para recordar tus preferencias entre sesiones.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Cómo Gestionar las Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Banner de Consentimiento</h4>
                <p className="text-muted-foreground">
                  Cuando visitas nuestro sitio por primera vez, te pedimos tu consentimiento para usar cookies 
                  no esenciales. Puedes aceptar o rechazar estas cookies en cualquier momento.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Configuración del Navegador</h4>
                <p className="text-muted-foreground mb-2">
                  Puedes controlar y eliminar cookies a través de la configuración de tu navegador:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                  <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                </ul>
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    <strong>Nota:</strong> Si deshabilitas las cookies esenciales, algunas funciones del sitio 
                    pueden no funcionar correctamente (por ejemplo, no podrás mantener tu sesión iniciada o 
                    tu carrito de compras).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Tus Derechos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Bajo la legislación de privacidad aplicable (CCPA, VCDPA, CPA, etc.), tienes derecho a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Saber qué cookies utilizamos y con qué propósito</li>
                <li>Aceptar o rechazar cookies no esenciales</li>
                <li>Solicitar la eliminación de tus datos personales</li>
                <li>Optar por no participar en la venta o intercambio de tus datos personales</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Para ejercer estos derechos, contáctanos en: <a href="mailto:ventas@wincova.com" className="text-primary hover:underline">ventas@wincova.com</a>
              </p>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Actualizaciones de esta Política</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en nuestras 
                prácticas o por razones legales. Te notificaremos sobre cambios importantes mediante un aviso 
                destacado en nuestro sitio web o por correo electrónico.
              </p>
              <p className="text-muted-foreground mt-4">
                <strong>Fecha de última actualización:</strong> 01 de octubre de 2025
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Si tienes preguntas sobre nuestra Política de Cookies, contáctanos:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Email:</strong> <a href="mailto:ventas@wincova.com" className="text-primary hover:underline">ventas@wincova.com</a></li>
                <li><strong>Teléfono:</strong> 615-728-9932</li>
                <li><strong>Dirección:</strong> 2615 Medical Center Parkway, Suite 1560, Murfreesboro TN 37129</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
