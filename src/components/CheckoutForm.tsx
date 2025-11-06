import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

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

    if (!email || !name) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
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
              name: name,
              email: email,
            },
          },
        },
      });

      if (error) {
        console.error("Payment error:", error);
        toast.error(error.message || "Error al procesar el pago");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Error inesperado al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Información de Contacto</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Información de Pago</h2>
        <PaymentElement />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Procesando pago...
          </>
        ) : (
          "Pagar Ahora"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Al completar tu compra, aceptas nuestros términos y condiciones
      </p>
    </form>
  );
};
