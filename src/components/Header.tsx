import { Search, ShoppingCart, Heart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import logoWhite from "@/assets/logo-white.png";

export const Header = () => {
  return (
    <header className="border-b bg-secondary sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <Button variant="ghost" size="icon" className="lg:hidden text-secondary-foreground hover:bg-secondary/80">
            <Menu className="h-6 w-6" />
          </Button>

          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logoWhite} 
              alt="Wincova" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="I'm shopping for..."
                className="pr-10 bg-background"
              />
              <Button
                size="sm"
                className="absolute right-0 top-0 h-full rounded-l-none"
              >
                Search
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-secondary-foreground hover:bg-secondary/80">
              <Heart className="h-5 w-5" />
              <span className="absolute top-0 right-0 bg-primary text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="text-secondary-foreground hover:bg-secondary/80">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-0 right-0 bg-primary text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="text-secondary-foreground hover:bg-secondary/80">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-6 py-3 border-t border-secondary-foreground/10">
          <Link to="/" className="text-secondary-foreground hover:text-primary transition-colors font-medium">
            Home
          </Link>
          <Link to="/men" className="text-secondary-foreground hover:text-primary transition-colors">
            Men
          </Link>
          <Link to="/women" className="text-secondary-foreground hover:text-primary transition-colors">
            Women
          </Link>
          <Link to="/kids" className="text-secondary-foreground hover:text-primary transition-colors">
            Kids
          </Link>
          <Link to="/electronics" className="text-secondary-foreground hover:text-primary transition-colors">
            Electronics
          </Link>
          <Link to="/refer-earn" className="text-primary hover:text-primary/80 transition-colors font-semibold">
            Refer & Earn
          </Link>
        </nav>
      </div>
    </header>
  );
};
