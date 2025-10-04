import { Search, Heart, User, Menu, LogOut, Shield, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import logoWhite from "@/assets/logo-white.png";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { CartSheet } from "@/components/CartSheet";
import { LanguageCurrencySelector } from "@/components/LanguageCurrencySelector";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRewards } from "@/hooks/useRewards";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { availablePoints, pointsToDollars } = useRewards();

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!data);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="border-b bg-secondary sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3 gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden text-secondary-foreground hover:bg-secondary/80">
            <Menu className="h-6 w-6" />
          </Button>

          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img 
              src={logoWhite} 
              alt="Wincova" 
              className="h-9 w-auto object-contain hover:scale-105 transition-transform"
            />
          </Link>

          <div className="hidden lg:flex items-center flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="search"
                placeholder={t('header.search_placeholder')}
                className="pr-24 bg-background border-primary/20 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-0 top-0 h-full rounded-l-none hover:scale-105 transition-transform"
              >
                {t('header.search_button')}
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <LanguageCurrencySelector />
            
            {/* Points Display for logged in users */}
            {user && availablePoints > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-secondary/5 border-primary/30 hover:border-primary hover:scale-105 hover:shadow-lg text-primary font-bold transition-all px-3"
                onClick={() => navigate("/profile")}
              >
                <Gift className="h-4 w-4 text-secondary" />
                <span className="text-sm">{availablePoints.toLocaleString()}</span>
                <span className="text-xs opacity-80">pts</span>
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="text-secondary-foreground hover:bg-secondary/80 hover:scale-105 transition-all relative">
              <Heart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                0
              </span>
            </Button>
            <CartSheet />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-secondary-foreground hover:bg-secondary/80">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background">
                  <DropdownMenuLabel>{t('header.my_account')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    {t('header.profile')}
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      Panel Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('header.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-secondary-foreground hover:bg-secondary/80"
                onClick={() => navigate("/auth")}
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-6 py-3 border-t border-secondary-foreground/10">
          <Link to="/" className="text-secondary-foreground hover:text-primary transition-colors font-medium">
            {t('nav.home')}
          </Link>
          <Link to="/category/men" className="text-secondary-foreground hover:text-primary transition-colors">
            {t('nav.men')}
          </Link>
          <Link to="/category/women" className="text-secondary-foreground hover:text-primary transition-colors">
            {t('nav.women')}
          </Link>
          <Link to="/category/kids" className="text-secondary-foreground hover:text-primary transition-colors">
            {t('nav.kids')}
          </Link>
          <Link to="/category/electronics" className="text-secondary-foreground hover:text-primary transition-colors">
            {t('nav.electronics')}
          </Link>
          <Link to="/refer-earn" className="text-primary hover:text-primary/80 transition-colors font-semibold">
            {t('nav.refer_earn')}
          </Link>
        </nav>
      </div>
    </header>
  );
};
