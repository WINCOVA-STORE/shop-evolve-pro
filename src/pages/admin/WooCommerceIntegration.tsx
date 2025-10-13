import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const WooCommerceIntegration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const webhookUrl = `${window.location.origin.replace('https://lovable.dev', 'https://pduhecmerwvmgbdtathh.supabase.co')}/functions/v1/woocommerce-webhook-handler`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "URL copiada al portapapeles",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Integración WooCommerce + Dropshipping</h1>
            <p className="text-muted-foreground">
              Conecta Lovable con WooCommerce para AutoDS y Spocket
            </p>
          </div>
        </div>

        {/* Status */}
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">✅ Sistema Configurado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Las edge functions ya están desplegadas y listas. Solo necesitas configurar los webhooks en WooCommerce.
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">✓ woocommerce-create-order</Badge>
                <Badge variant="secondary">✓ woocommerce-webhook-handler</Badge>
                <Badge variant="secondary">✓ sync-woocommerce</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Architecture Diagram */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">📊 Arquitectura del Sistema</h3>
          <div className="bg-muted p-4 rounded-lg font-mono text-xs space-y-2">
            <div className="text-blue-500">┌────────────────────┐</div>
            <div className="text-blue-500">│   LOVABLE          │ ← Frontend (wincova.com)</div>
            <div className="text-blue-500">│   Frontend         │</div>
            <div className="text-blue-500">└─────────┬──────────┘</div>
            <div className="text-muted-foreground">          │ Orden completada</div>
            <div className="text-muted-foreground">          ▼</div>
            <div className="text-amber-500">┌────────────────────┐</div>
            <div className="text-amber-500">│   WooCommerce      │ ← Backend (catalog.wincova.com)</div>
            <div className="text-amber-500">│   + AutoDS         │</div>
            <div className="text-amber-500">│   + Spocket        │</div>
            <div className="text-amber-500">└─────────┬──────────┘</div>
            <div className="text-muted-foreground">          │ Tracking actualizado</div>
            <div className="text-muted-foreground">          ▼</div>
            <div className="text-green-500">┌────────────────────┐</div>
            <div className="text-green-500">│   LOVABLE          │ ← Cliente ve tracking</div>
            <div className="text-green-500">│   (Webhook)        │</div>
            <div className="text-green-500">└────────────────────┘</div>
          </div>
        </Card>

        {/* Webhook URL */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">🔗 URL del Webhook</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Copia esta URL para configurar los webhooks en WooCommerce:
          </p>
          <div className="flex gap-2">
            <code className="flex-1 bg-muted p-3 rounded text-sm break-all">
              {webhookUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(webhookUrl)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Step-by-Step Instructions */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">📝 Configuración en WooCommerce</h3>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Accede a WooCommerce Webhooks</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Ve a: <code className="bg-muted px-2 py-1 rounded">WooCommerce → Ajustes → Avanzado → Webhooks</code>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://catalog.wincova.com/wp-admin/admin.php?page=wc-settings&tab=advanced&section=webhooks', '_blank')}
                >
                  Abrir Panel WooCommerce <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Crear Webhook para "Order Updated"</h4>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Click en "Add webhook"</li>
                  <li><strong>Name:</strong> Lovable Order Sync</li>
                  <li><strong>Status:</strong> Active</li>
                  <li><strong>Topic:</strong> Order updated</li>
                  <li><strong>Delivery URL:</strong> (Pega la URL de arriba)</li>
                  <li><strong>API Version:</strong> WP REST API Integration v3</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Probar el Webhook</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Después de guardar el webhook:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Click en el webhook que creaste</li>
                  <li>Scroll hasta abajo y click en "Test webhook"</li>
                  <li>Verifica que el estado sea "successful" (200)</li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Verificar AutoDS/Spocket</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Asegúrate de que tus proveedores de dropshipping estén conectados:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li><strong>AutoDS:</strong> Verifica la conexión en AutoDS Dashboard</li>
                  <li><strong>Spocket:</strong> Revisa que los productos estén sincronizados</li>
                  <li>Ambos deben estar configurados para procesar órdenes automáticamente</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* How it Works */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">⚙️ Cómo Funciona</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="text-2xl">1️⃣</div>
              <div>
                <p className="font-medium">Cliente hace pedido en Lovable</p>
                <p className="text-sm text-muted-foreground">
                  Completa el checkout con Stripe en tu tienda de Lovable
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-2xl">2️⃣</div>
              <div>
                <p className="font-medium">Lovable envía orden a WooCommerce</p>
                <p className="text-sm text-muted-foreground">
                  La edge function <code className="bg-muted px-1 rounded">woocommerce-create-order</code> crea automáticamente la orden en tu WooCommerce
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-2xl">3️⃣</div>
              <div>
                <p className="font-medium">AutoDS/Spocket procesan el envío</p>
                <p className="text-sm text-muted-foreground">
                  Tus proveedores detectan la nueva orden y la procesan automáticamente
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-2xl">4️⃣</div>
              <div>
                <p className="font-medium">WooCommerce actualiza tracking</p>
                <p className="text-sm text-muted-foreground">
                  AutoDS/Spocket actualizan el tracking en WooCommerce
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-2xl">5️⃣</div>
              <div>
                <p className="font-medium">Lovable recibe actualización vía webhook</p>
                <p className="text-sm text-muted-foreground">
                  El tracking se sincroniza automáticamente a Lovable y el cliente lo puede ver
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Benefits */}
        <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <h3 className="font-semibold text-lg mb-4">✨ Beneficios de esta Arquitectura</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Frontend Ultra Rápido</p>
                <p className="text-sm text-muted-foreground">Lovable es 10x más rápido que WordPress</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Dropshipping Automático</p>
                <p className="text-sm text-muted-foreground">AutoDS y Spocket funcionan sin cambios</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Sincronización en Tiempo Real</p>
                <p className="text-sm text-muted-foreground">Tracking actualizado automáticamente</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Menos Costos de Hosting</p>
                <p className="text-sm text-muted-foreground">Siteground solo para backend (plan básico)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 border-2 border-primary">
          <h3 className="font-semibold text-lg mb-4">🚀 Próximos Pasos</h3>
          <ol className="space-y-3 text-sm list-decimal list-inside">
            <li>Configura los webhooks en WooCommerce siguiendo las instrucciones de arriba</li>
            <li>Haz una compra de prueba para verificar que todo funcione</li>
            <li>Verifica que la orden aparezca en WooCommerce</li>
            <li>Confirma que AutoDS/Spocket la procesen automáticamente</li>
            <li>Conecta wincova.com a Lovable desde Settings → Domains</li>
            <li>Una vez funcionando, downgradea tu plan de Siteground a uno básico</li>
          </ol>
        </Card>
      </div>
    </div>
  );
};

export default WooCommerceIntegration;
