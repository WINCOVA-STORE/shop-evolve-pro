import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Gift, ShoppingBag, Star, Users, Calendar, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const RewardsTerms = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="container mx-auto px-4 py-12">
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
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-4">
              <Gift className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Gana Mientras Compras</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Programa de Recompensas
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              <span className="font-semibold text-foreground">Cada compra cuenta.</span> Cada acción suma. 
              <span className="text-primary font-semibold">¡Empieza a ganar hoy!</span>
            </p>
            
            {/* Value Props */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xl">💰</span>
                <span className="text-sm font-semibold">500 pts Bono Bienvenida</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <span className="text-xl">🎂</span>
                <span className="text-sm font-semibold">3,000 pts Cumpleaños</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xl">🎁</span>
                <span className="text-sm font-semibold">1% cada compra</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Section 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Award className="h-6 w-6 text-primary" />
                ¿Qué es el Programa de Recompensas de Wincova?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                El Programa de Recompensas de Wincova es un sistema de beneficios diseñado para premiar tus compras y participación en la comunidad. Por cada acción válida que realices, ganas puntos que puedes usar para pagar parte de tus futuras compras.
              </p>
              <p className="font-semibold text-primary">
                ¡Mientras más participas, más ganas!
              </p>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ShoppingBag className="h-6 w-6 text-primary" />
                ¿Cómo gano recompensas?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Ganas puntos cuando compras, refieres amigos, dejas reseñas, nos sigues en redes sociales o te suscribes.
              </p>
              <p className="font-semibold">Cada acción cuenta.</p>
              <p>
                Desde el primer día comienzas a ganar, y mientras más te involucras, más obtienes.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium mb-2">
                  💰 <strong>Ejemplos de cómo ganar puntos:</strong>
                </p>
                <ul className="text-sm space-y-1 ml-6 list-disc">
                  <li>Por cada compra que hagas</li>
                  <li>Referir un amigo: 500 puntos (cuando realice su primera compra)</li>
                  <li>Dejar una reseña: 50 puntos</li>
                  <li>Seguir en redes sociales: 25 puntos por plataforma</li>
                  <li>Bonus de bienvenida: 500 puntos al registrarte</li>
                  <li>Bonus de cumpleaños: 3,000 puntos</li>
                </ul>
              </div>
              <Button
                variant="link"
                onClick={() => navigate('/refer-earn')}
                className="text-sm text-primary hover:text-primary/80 p-0 h-auto mt-2 font-semibold"
              >
                👉 Consulta la lista completa de acciones y sus puntos correspondientes en la sección "Refiere y Gana"
              </Button>
            </CardContent>
          </Card>

          {/* Section 2.5 - Valor y Límites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Gift className="h-6 w-6 text-primary" />
                ¿Cómo uso mis puntos?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Tus puntos acumulados se pueden <strong>aplicar al pago de tus compras</strong> durante el proceso de checkout.
              </p>
              <p>
                Simplemente selecciona cuántos puntos deseas usar y verás cómo se reduce el monto a pagar. Es fácil, rápido y automático.
              </p>
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium">
                  ⚠️ <strong>Límite de uso:</strong> Puedes usar tus puntos para cubrir un porcentaje del valor total de tu compra. El porcentaje máximo aplicable se mostrará automáticamente en el checkout según tu compra.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                💡 El valor de cada punto y las condiciones de canje pueden variar. Siempre verás el descuento exacto aplicado antes de confirmar tu compra.
              </p>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6 text-primary" />
                ¿Qué pasa si cancelo o devuelvo una compra?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Si devuelves un producto, los puntos ganados de esa compra también se cancelarán.
              </p>
              <p>
                Pero no te preocupes — si el problema fue nuestro, nos encargaremos de ello. Siempre jugamos limpio.
              </p>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Gift className="h-6 w-6 text-primary" />
                ¿Puedo compartir mis recompensas?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                No, los puntos no son transferibles. Son tu recompensa personal por confiar en nosotros.
              </p>
              <p>
                Pero tus referidos también ganan — todos ganan. Así es como funciona.
              </p>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calendar className="h-6 w-6 text-primary" />
                ¿Mis recompensas expiran?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Los puntos expiran 12 meses después de ganarlos.
              </p>
              <p>
                No te preocupes — te recordaremos antes de que eso suceda. No dejaremos que pierdas lo que has ganado.
              </p>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Star className="h-6 w-6 text-primary" />
                ¿Dónde puedo ver mis recompensas acumuladas?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Puedes ver tus recompensas acumuladas iniciando sesión en tu cuenta y haciendo clic en <strong>"Mi Perfil"</strong>.
              </p>
              <p>
                Ahí verás cuántos puntos has ganado, de dónde vinieron y cómo usarlos.
              </p>
              <p className="text-primary font-medium">
                Es tu bóveda personal de recompensas — y crece cada vez que haces un movimiento inteligente 😉
              </p>
              <Button 
                onClick={() => navigate('/profile')}
                className="mt-4"
              >
                Ver Mis Recompensas
              </Button>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Award className="h-6 w-6 text-primary" />
                ¿Hay restricciones en el uso de puntos?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Los puntos se pueden usar en la mayoría de nuestros productos, pero hay algunas excepciones:
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>No se pueden combinar con otros cupones o promociones</li>
                <li>No son válidos para compra de tarjetas de regalo</li>
                <li>No se pueden canjear por efectivo</li>
                <li>Deben usarse en compras que superen el monto mínimo establecido</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Estas restricciones nos ayudan a mantener el programa justo y sustentable para todos.
              </p>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Award className="h-6 w-6 text-primary" />
                ¿Puede Wincova cambiar los términos del programa?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Sí, podemos actualizar las reglas para mejorar el sistema.
              </p>
              <p>
                Pero si lo hacemos, siempre te lo haremos saber claramente con anticipación.
              </p>
              <p className="font-semibold text-primary">
                Siempre sabrás cómo estás ganando.
              </p>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Award className="h-6 w-6 text-primary" />
                Suspensión o terminación de cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Wincova se reserva el derecho de suspender o terminar la participación en el programa de cualquier usuario que:
              </p>
              <ul className="space-y-2 ml-6 list-disc">
                <li>Intente manipular o defraudar el sistema</li>
                <li>Cree múltiples cuentas para obtener beneficios duplicados</li>
                <li>Viole los términos y condiciones generales de Wincova</li>
                <li>Use métodos automatizados para ganar puntos</li>
              </ul>
              <p className="font-semibold text-primary mt-4">
                Jugamos limpio, y esperamos lo mismo de ti.
              </p>
            </CardContent>
          </Card>

          {/* CTA Section - ULTRA PREMIUM */}
          <Card className="bg-gradient-to-br from-secondary/5 via-primary/5 to-secondary/5 border-2 border-primary/20 shadow-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
            <CardContent className="p-8 text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary to-secondary shadow-xl mb-4">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3">¿Listo para Ganar Puntos?</h3>
              <p className="text-muted-foreground text-lg mb-6">
                <span className="font-semibold text-foreground">500 puntos de bienvenida</span> te esperan.{" "}
                <Button
                  variant="link"
                  onClick={() => navigate('/auth')}
                  className="text-lg text-primary hover:text-primary/80 p-0 h-auto font-semibold underline"
                >
                  Regístrate
                </Button>{" "}
                y <span className="text-primary font-semibold">empieza a ahorrar hoy</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button 
                  size="lg"
                  onClick={() => navigate('/refer-earn')}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  <Gift className="h-5 w-5 mr-2" />
                  Ver Programa de Referidos
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="border-2 border-primary/40 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:border-primary hover:scale-105 transition-all duration-300 hover:shadow-lg"
                >
                  Empezar a Comprar
                </Button>
              </div>
              
              {/* FOMO */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-semibold">
                  🎯 <span className="text-primary">+5,000 usuarios activos ganando</span> | 
                  ⚡ Acumula puntos desde tu primera compra
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RewardsTerms;
