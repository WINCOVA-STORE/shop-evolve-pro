import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().trim().email("Email inválido").max(255)
});

export const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validación con zod
    try {
      checkoutSchema.parse({ name, email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          receipt_email: email,
          payment_method_data: {
            billing_details: {
              name: name.trim(),
              email: email.trim(),
            },
          },
        },
      });

      if (error) {
        console.error("❌ Payment error:", error);
        toast.error(error.message || "Error al procesar el pago");
      } else {
        console.log("✅ Payment confirmed, redirecting...");
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      toast.error("Error inesperado al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trust Badge */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary" />
        <div className="text-sm">
          <p className="font-semibold text-primary">Pago 100% Seguro</p>
          <p className="text-muted-foreground text-xs">Protegido por Stripe con encriptación SSL</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>Información de Contacto</span>
          <span className="text-xs font-normal text-muted-foreground">(Paso 1 de 2)</span>
        </h2>
        
        <div className="space-y-4">
          <div className="relative">
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              required
              maxLength={100}
              className="mt-1"
            />
            {name && name.length >= 2 && (
              <CheckCircle2 className="absolute right-3 top-9 h-4 w-4 text-green-500" />
            )}
          </div>

          <div className="relative">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              maxLength={255}
              className="mt-1"
            />
            {email && email.includes('@') && email.includes('.') && (
              <CheckCircle2 className="absolute right-3 top-9 h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>Información de Pago</span>
          <span className="text-xs font-normal text-muted-foreground">(Paso 2 de 2)</span>
        </h2>
        <div className="border border-border rounded-lg p-4 bg-card">
          <PaymentElement />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Procesando pago seguro...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-5 w-5" />
            Pagar Ahora de Forma Segura
          </>
        )}
      </Button>

      <div className="space-y-2 text-center">
        <p className="text-xs text-muted-foreground">
          Al completar tu compra, aceptas nuestros términos y condiciones
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Encriptación SSL de grado bancario</span>
        </div>
      </div>
    </form>
  );
};
