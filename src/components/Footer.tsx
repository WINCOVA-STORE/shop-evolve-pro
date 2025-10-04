import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import logoWhite from "@/assets/logo-white.png";

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <img src={logoWhite} alt="Wincova" className="h-10 w-auto" />
            <p className="text-sm text-secondary-foreground/80">
              Tu tienda en línea de confianza. Productos de calidad con envío rápido y garantía de satisfacción.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-4">Comprar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/category/men" className="hover:text-primary transition-colors">
                  Hombres
                </Link>
              </li>
              <li>
                <Link to="/category/women" className="hover:text-primary transition-colors">
                  Mujeres
                </Link>
              </li>
              <li>
                <Link to="/category/kids" className="hover:text-primary transition-colors">
                  Niños
                </Link>
              </li>
              <li>
                <Link to="/category/electronics" className="hover:text-primary transition-colors">
                  Electrónica
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Servicio al Cliente</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/profile" className="hover:text-primary transition-colors">
                  Mi Cuenta
                </Link>
              </li>
              <li>
                <Link to="/refer-earn" className="hover:text-primary transition-colors">
                  Programa de Referidos
                </Link>
              </li>
              <li>
                <Link to="/rewards-terms" className="hover:text-primary transition-colors">
                  Términos del Programa de Recompensas
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Rastrear Pedido
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Política de Devoluciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm mb-4">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5" />
                <span>615-728-9932</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5" />
                <span>ventas@wincova.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>2615 Medical Center Parkway, Suite 1560, Murfreesboro TN 37129</span>
              </li>
            </ul>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Newsletter</h4>
              <p className="text-xs text-secondary-foreground/80">
                Suscríbete para recibir ofertas exclusivas
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Tu email"
                  className="bg-background"
                />
                <Button>Enviar</Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-secondary-foreground/10" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/80">
          <p>© 2025 Wincova. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-primary transition-colors">
              Términos y Condiciones
            </Link>
            <a href="#" className="hover:text-primary transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
