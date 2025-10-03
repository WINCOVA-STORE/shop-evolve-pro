import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import {
  Home,
  Shirt,
  Footprints,
  Briefcase,
  Baby,
  Dog,
  Sparkles,
  Dumbbell,
  Wrench,
  Laptop,
  Palette,
  Car,
} from "lucide-react";

const Index = () => {
  const categories = [
    { name: "Home & Kitchen", icon: Home, href: "/home-kitchen" },
    { name: "Fashion", icon: Shirt, href: "/fashion" },
    { name: "Shoes", icon: Footprints, href: "/shoes" },
    { name: "Bags", icon: Briefcase, href: "/bags" },
    { name: "Kids", icon: Baby, href: "/kids" },
    { name: "Pets", icon: Dog, href: "/pets" },
    { name: "Beauty", icon: Sparkles, href: "/beauty" },
    { name: "Wellness", icon: Dumbbell, href: "/wellness" },
    { name: "Tools & DIY", icon: Wrench, href: "/tools" },
    { name: "Electronics", icon: Laptop, href: "/electronics" },
    { name: "Crafts", icon: Palette, href: "/crafts" },
    { name: "Vehicles", icon: Car, href: "/vehicles" },
  ];

  const featuredProducts = [
    {
      id: "1",
      title: "Duke Cannon Supply Co. Men'S Shampoo Puck, Gold Rush – over 175 Washes, Sulfate-Free, 4.5 Oz (Pack of 1)",
      price: 186.99,
      image: "https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=500&h=500&fit=crop",
      rating: 4.5,
      reviews: 234,
    },
    {
      id: "2",
      title: "K56Pro Smart Watch for Men Heart Rate Blood Bluetooth Sport 400Mah Long Standby 1.39 Inch 360*360 HD Screen Outdoors Smartwatch",
      price: 28.78,
      originalPrice: 35.63,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
      rating: 4,
      reviews: 89,
      badge: "sale" as const,
    },
    {
      id: "3",
      title: "Medifrida Accu-Dose Baby Medicine Syringe with Pacifier Tip",
      price: 22.99,
      image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&h=500&fit=crop",
      rating: 5,
      reviews: 456,
      badge: "new" as const,
    },
    {
      id: "4",
      title: "prueba Towel Keep",
      price: 16.99,
      originalPrice: 29.99,
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop",
      rating: 4.5,
      reviews: 123,
      badge: "sale" as const,
    },
    {
      id: "5",
      title: "Towel Keep Premium Cotton Beach Towel Set",
      price: 16.99,
      originalPrice: 26.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      rating: 4,
      reviews: 167,
    },
    {
      id: "6",
      title: "Wireless Bluetooth Headphones with Noise Cancellation",
      price: 89.99,
      originalPrice: 129.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      rating: 4.5,
      reviews: 342,
      badge: "sale" as const,
    },
    {
      id: "7",
      title: "Stainless Steel Water Bottle 32oz - Keeps Drinks Cold 24hrs",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
      rating: 5,
      reviews: 891,
      badge: "new" as const,
    },
    {
      id: "8",
      title: "Organic Cotton T-Shirt - Comfortable All-Day Wear",
      price: 19.99,
      originalPrice: 34.99,
      image: "https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=500&h=500&fit=crop",
      rating: 4.5,
      reviews: 567,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">
            Explore our categories — find what suits you best
          </h1>
          <Button size="lg" className="text-lg px-8">
            See How You Win
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              icon={category.icon}
              href={category.href}
            />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Contact us — we're here 24/7</h3>
            <div className="flex flex-col items-center gap-2 text-sm">
              <a href="tel:+16157289932" className="hover:text-primary transition-colors">
                📞 +1 615 728 9932
              </a>
              <a href="mailto:ventas@wincova.com" className="hover:text-primary transition-colors">
                📧 ventas@wincova.com
              </a>
              <a href="https://wa.me/16157289932" className="hover:text-primary transition-colors">
                💬 Chat with us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
