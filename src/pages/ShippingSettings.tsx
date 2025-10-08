import { useState, useEffect } from "react";
import { Truck, Package, Settings, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShippingConfig, ShippingMode } from "@/hooks/useShippingConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";

export default function ShippingSettings() {
  const { config, isLoading, updateConfig, isUpdating } = useShippingConfig();
  
  const [mode, setMode] = useState<ShippingMode>(config?.mode || 'free');
  const [showFreeBadge, setShowFreeBadge] = useState(config?.show_free_badge ?? true);
  const [manualCost, setManualCost] = useState(config?.manual_global_cost?.toString() || '');
  const [apiProvider, setApiProvider] = useState(config?.api_provider || '');
  const [dropshippingIncludes, setDropshippingIncludes] = useState(
    config?.dropshipping_includes_shipping ?? true
  );

  // Sync state with loaded config
  useEffect(() => {
    if (config) {
      setMode(config.mode);
      setShowFreeBadge(config.show_free_badge);
      setManualCost(config.manual_global_cost?.toString() || '');
      setApiProvider(config.api_provider || '');
      setDropshippingIncludes(config.dropshipping_includes_shipping);
    }
  }, [config]);

  const handleSave = () => {
    const updates: any = {
      mode,
      show_free_badge: showFreeBadge,
      dropshipping_includes_shipping: dropshippingIncludes,
    };

    if (mode === 'manual') {
      updates.manual_global_cost = parseFloat(manualCost) || 0;
    }

    if (mode === 'api') {
      updates.api_provider = apiProvider;
    }

    updateConfig(updates);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <Truck className="h-8 w-8 text-primary" />
            Configuración de Envíos
          </h1>
          <p className="text-muted-foreground mt-2">
            Control universal de políticas de envío para tu tienda
          </p>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            {/* Selector de Modo */}
            <Card>
              <CardHeader>
                <CardTitle>Modo de Envío</CardTitle>
                <CardDescription>
                  Selecciona cómo deseas gestionar los costos de envío
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mode">Modo activo</Label>
                  <Select value={mode} onValueChange={(v) => setMode(v as ShippingMode)}>
                    <SelectTrigger id="mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">
                        🆓 Envío Gratis
                      </SelectItem>
                      <SelectItem value="manual">
                        📝 Manual (Costo fijo/por categoría)
                      </SelectItem>
                      <SelectItem value="api">
                        🔌 API (Transportistas conectados)
                      </SelectItem>
                      <SelectItem value="dropshipping">
                        📦 Dropshipping (Incluido en precio)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Configuración por Modo */}
                {mode === 'free' && (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="show-badge" className="text-base font-medium">
                        Mostrar badge "Envío Gratis"
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Visible en producto, carrito y checkout
                      </p>
                    </div>
                    <Switch
                      id="show-badge"
                      checked={showFreeBadge}
                      onCheckedChange={setShowFreeBadge}
                    />
                  </div>
                )}

                {mode === 'manual' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="manual-cost">Costo global de envío (USD)</Label>
                      <Input
                        id="manual-cost"
                        type="number"
                        step="0.01"
                        placeholder="Ej: 5.99"
                        value={manualCost}
                        onChange={(e) => setManualCost(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Se aplicará a todos los productos salvo reglas específicas
                      </p>
                    </div>
                    
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-sm">Reglas por categoría</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          🚧 Próximamente: Define costos específicos por categoría
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {mode === 'api' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-provider">Proveedor de API</Label>
                      <Select value={apiProvider} onValueChange={setApiProvider}>
                        <SelectTrigger id="api-provider">
                          <SelectValue placeholder="Selecciona proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easypost">EasyPost</SelectItem>
                          <SelectItem value="shippo">Shippo</SelectItem>
                          <SelectItem value="ups">UPS</SelectItem>
                          <SelectItem value="usps">USPS</SelectItem>
                          <SelectItem value="fedex">FedEx</SelectItem>
                          <SelectItem value="dhl">DHL Express</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Card className="bg-amber-500/10 border-amber-500/20">
                      <CardContent className="pt-6">
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          🔌 Integración en desarrollo - Las credenciales se configurarán
                          de forma segura en la siguiente fase
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {mode === 'dropshipping' && (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="dropship-includes" className="text-base font-medium">
                        Envío incluido en precio del producto
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        No se cobrará envío adicional al cliente
                      </p>
                    </div>
                    <Switch
                      id="dropship-includes"
                      checked={dropshippingIncludes}
                      onCheckedChange={setDropshippingIncludes}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botón Guardar */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Cambios</CardTitle>
                <CardDescription>Últimas modificaciones en la configuración</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {config && (
                    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Configuración actual</p>
                        <p className="text-xs text-muted-foreground">
                          Modo: {config.mode} • Última modificación:{" "}
                          {new Date(config.updated_at).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground text-center py-8">
                    🚧 Historial detallado próximamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
