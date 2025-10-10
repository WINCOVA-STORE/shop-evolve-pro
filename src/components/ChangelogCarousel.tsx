import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarouselItem {
  title: string;
  description: string;
  icon: string;
}

const highlights: CarouselItem[] = [
  {
    title: "🎯 Encuentra lo que necesitas en segundos",
    description: "Filtros inteligentes que aprenden de ti y te muestran solo lo relevante",
    icon: "🔍"
  },
  {
    title: "💳 Compra rápido y seguro",
    description: "Tu información protegida y tus pedidos siempre a un clic de distancia",
    icon: "🛡️"
  },
  {
    title: "🎁 Recompensas en cada compra",
    description: "Gana puntos y beneficios exclusivos que puedes usar inmediatamente",
    icon: "✨"
  }
];

export const ChangelogCarousel = ({ latestFeatures }: { latestFeatures?: CarouselItem[] }) => {
  const items = latestFeatures && latestFeatures.length > 0 ? latestFeatures : highlights;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl p-8 mb-12 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold text-center">¡Nuevas mejoras en la tienda!</h2>
        </div>

        {/* Carousel Content */}
        <div className="min-h-[120px] flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-12 transition-all duration-500 animate-fade-in">
            <div className="text-5xl mb-4">{items[currentIndex].icon}</div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              {items[currentIndex].title}
            </h3>
            <p className="text-muted-foreground text-lg">
              {items[currentIndex].description}
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrev}
            className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Dots */}
          <div className="flex gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
