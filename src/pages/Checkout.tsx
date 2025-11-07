import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/hooks/useAuth";
import { useShippingConfig } from "@/hooks/useShippingConfig";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShoppingCart, Lock } from "lucide-react";
import { CheckoutForm } from "@/components/CheckoutForm";
import { FreeShippingBadge } from "@/components/FreeShippingBadge";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, cartTotal } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { config: shippingConfig, calculateShipping } = useShippingConfig();
  
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pointsUsed = parseInt(searchParams.get("pointsUsed") || "0");
  const pointsDiscount = parseFloat(searchParams.get("pointsDiscount") || "0");

  const taxRate = 0.1;
  const taxAmount = cartTotal * taxRate;
  const shippingCost = calculateShipping(cartTotal);
  const total = Math.max(0, cartTotal + taxAmount + shippingCost - pointsDiscount);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/");
      return;
    }

    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError("");

        const { data, error: functionError } = await supabase.functions.invoke('create-payment', {
          body: {
            amount: total,
            currency: 'usd',
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            pointsUsed,
            pointsDiscount,
            metadata: {
              cart_total: cartTotal.toString(),
              tax_amount: taxAmount.toString(),
              shipping_cost: shippingCost.toString()
            }
          }
        });

        if (functionError) {
          throw functionError;
        }

        if (!data?.clientSecret) {
          throw new Error("No se recibió el client secret");
        }

        console.log("✅ Payment intent created successfully");
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("❌ Error creating payment intent:", err);
        setError("No se pudo iniciar el proceso de pago. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [items, total, pointsUsed, pointsDiscount, cartTotal, taxAmount, shippingCost, navigate]);

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0F172A',
    },
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lock className="h-7 w-7" />
            Checkout Seguro
          </h1>
          <p className="text-muted-foreground mt-2">
            Completa tu compra de forma segura con Stripe
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Payment Form */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Preparando el pago...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive mb-4">{error}</p>
                  <button
                    onClick={() => navigate("/")}
                    className="text-primary hover:underline"
                  >
                    Volver a la tienda
                  </button>
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                  <CheckoutForm />
                </Elements>
              ) : null}
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Resumen del Pedido
              </h2>

              <Separator className="my-4" />

              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="text-sm font-bold mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Pricing Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos (10%)</span>
                  <span className="font-medium">{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Envío</span>
                  {shippingCost === 0 && shippingConfig?.show_free_badge ? (
                    <FreeShippingBadge />
                  ) : (
                    <span className="font-medium">{formatPrice(shippingCost)}</span>
                  )}
                </div>
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Descuento por puntos</span>
                    <span className="font-medium">-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-4 border-t text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Pago seguro procesado por Stripe</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
