import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (!sessionId) {
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { session_id: sessionId },
        });

        if (error) throw error;

        if (data.success) {
          setOrderNumber(data.order_number);
          toast({
            title: "¡Pago exitoso!",
            description: "Tu orden ha sido procesada correctamente.",
          });
        } else {
          toast({
            title: "Error",
            description: "No se pudo verificar el pago.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al verificar el pago.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h1>
        <p className="text-muted-foreground mb-6">
          Tu pago ha sido procesado correctamente.
        </p>
        {orderNumber && (
          <p className="text-sm text-muted-foreground mb-6">
            Número de orden: <strong>{orderNumber}</strong>
          </p>
        )}
        <Button onClick={() => navigate("/")} className="w-full">
          Volver a la tienda
        </Button>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
