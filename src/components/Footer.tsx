import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import logoWhite from "@/assets/logo-white.png";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-secondary text-secondary-foreground mt-12 border-t">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
          {/* Brand Section */}
          <div className="space-y-3">
            <img src={logoWhite} alt="Wincova" className="h-8 w-auto" loading="lazy" />
            <p className="text-xs text-secondary-foreground/80 leading-relaxed">
              {t('footer.brand_description')}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="hover:bg-secondary/80 h-8 w-8">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-secondary/80 h-8 w-8">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-secondary/80 h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-secondary/80 h-8 w-8">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">{t('footer.shop')}</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/category/men" className="hover:text-primary transition-colors">
                  {t('nav.men')}
                </Link>
              </li>
              <li>
                <Link to="/category/women" className="hover:text-primary transition-colors">
                  {t('nav.women')}
                </Link>
              </li>
              <li>
                <Link to="/category/kids" className="hover:text-primary transition-colors">
                  {t('nav.kids')}
                </Link>
              </li>
              <li>
                <Link to="/category/electronics" className="hover:text-primary transition-colors">
                  {t('nav.electronics')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">{t('footer.customer_service')}</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/changelog" className="hover:text-primary transition-colors">
                  ✨ Novedades
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-primary transition-colors">
                  {t('footer.my_account')}
                </Link>
              </li>
              <li>
                <Link to="/refer-earn" className="hover:text-primary transition-colors">
                  {t('footer.refer_earn')}
                </Link>
              </li>
              <li>
                <Link to="/rewards-terms" className="hover:text-primary transition-colors">
                  {t('footer.rewards_terms')}
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-primary transition-colors">
                  {t('footer.track_order')}
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-primary transition-colors">
                  {t('footer.return_policy')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">{t('footer.contact')}</h3>
            <ul className="space-y-2 text-xs mb-4">
              <li className="flex items-start gap-2">
                <Phone className="h-3.5 w-3.5 mt-0.5" />
                <a href="tel:6157289932" className="hover:text-primary transition-colors">
                  615-728-9932
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-3.5 w-3.5 mt-0.5" />
                <a href="mailto:ventas@wincova.com" className="hover:text-primary transition-colors">
                  ventas@wincova.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span className="leading-tight">2615 Medical Center Parkway, Suite 1560, Murfreesboro TN 37129</span>
              </li>
            </ul>

            <div className="space-y-2">
              <h4 className="font-semibold text-xs">{t('footer.newsletter_title')}</h4>
              <p className="text-[10px] text-secondary-foreground/80 leading-tight">
                {t('footer.newsletter_subtitle')}
              </p>
              <div className="flex gap-1.5">
                <Input
                  type="email"
                  placeholder={t('footer.newsletter_placeholder')}
                  className="bg-background text-foreground text-xs h-8 placeholder:text-muted-foreground border-border hover:border-primary/50 focus:border-primary transition-colors"
                />
                <Button size="sm" className="h-8 text-xs px-3">{t('footer.newsletter_submit')}</Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-secondary-foreground/10" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-secondary-foreground/80">
          <p className="text-[11px]">{t('footer.copyright', { year })}</p>
          <div className="flex gap-4 text-[11px]">
            <Link to="/terms" className="hover:text-primary transition-colors">
              {t('footer.terms')}
            </Link>
            <a href="#" className="hover:text-primary transition-colors">
              {t('footer.privacy')}
            </a>
            <Link to="/cookie-policy" className="hover:text-primary transition-colors">
              {t('footer.cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
