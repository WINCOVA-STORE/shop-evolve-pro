import { useState } from "react";
import { Gift, TrendingUp, DollarSign, Settings as SettingsIcon, Plus, Percent, Calendar, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRewardsConfig } from "@/hooks/useRewardsConfig";
import { useRewardsCampaigns, type RewardsCampaign, type CampaignType } from "@/hooks/useRewardsCampaigns";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const CAMPAIGN_TYPES: { value: CampaignType; label: string; icon: string }[] = [
  { value: 'welcome', label: 'Bienvenida', icon: '👋' },
  { value: 'review', label: 'Reseñas', icon: '⭐' },
  { value: 'referral', label: 'Referidos', icon: '👥' },
  { value: 'purchase', label: 'Compras', icon: '🛒' },
  { value: 'birthday', label: 'Cumpleaños', icon: '🎂' },
  { value: 'share', label: 'Compartir', icon: '📱' },
  { value: 'social_follow', label: 'Redes Sociales', icon: '📲' },
  { value: 'custom', label: 'Personalizada', icon: '✨' },
];

export default function RewardsSettings() {
  const { toast } = useToast();
  const { config, loading: configLoading, updateConfig } = useRewardsConfig();
  const { campaigns, loading: campaignsLoading, createCampaign, updateCampaign, deleteCampaign, getBudgetStatus } = useRewardsCampaigns();

  // Config form state
  const [earningType, setEarningType] = useState(config?.earning_type || 'percentage');
  const [earningPercentage, setEarningPercentage] = useState(config?.earning_percentage?.toString() || '1.00');
  const [earningFixed, setEarningFixed] = useState(config?.earning_fixed_amount?.toString() || '');
  const [pointsPerDollar, setPointsPerDollar] = useState(config?.points_per_dollar?.toString() || '1000');
  const [maxUsagePercentage, setMaxUsagePercentage] = useState(config?.max_usage_percentage?.toString() || '2.00');
  const [minPointsToUse, setMinPointsToUse] = useState(config?.min_points_to_use?.toString() || '1000');
  const [showPercentage, setShowPercentage] = useState(config?.show_percentage_to_users || false);
  const [showConversion, setShowConversion] = useState(config?.show_conversion_rate || false);
  const [includeTax, setIncludeTax] = useState(config?.include_tax_in_points || false);
  const [includeShipping, setIncludeShipping] = useState(config?.include_shipping_in_points || false);

  // Campaign form state
  const [isCreating, setIsCreating] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<RewardsCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    campaign_type: 'welcome' as CampaignType,
    reward_value: '',
    value_type: 'fixed' as 'fixed' | 'percentage',
    frequency: 'per_event' as any,
    budget_limit_dollars: '',
    max_uses_per_user: '',
    max_uses_total: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    auto_pause_on_budget: true,
  });

  const handleSaveConfig = async () => {
    try {
      const result = await updateConfig({
        earning_type: earningType as 'percentage' | 'fixed',
        earning_percentage: earningType === 'percentage' ? parseFloat(earningPercentage) : null,
        earning_fixed_amount: earningType === 'fixed' ? parseFloat(earningFixed) : null,
        points_per_dollar: parseFloat(pointsPerDollar),
        max_usage_percentage: parseFloat(maxUsagePercentage),
        min_points_to_use: parseInt(minPointsToUse),
        show_percentage_to_users: showPercentage,
        show_conversion_rate: showConversion,
        include_tax_in_points: includeTax,
        include_shipping_in_points: includeShipping,
      });

      // Force a complete page refresh to sync all components
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    }
  };

  const handleSaveCampaign = async () => {
    try {
      const campaignData = {
        name: campaignForm.name,
        description: campaignForm.description || null,
        campaign_type: campaignForm.campaign_type,
        reward_value: parseFloat(campaignForm.reward_value),
        value_type: campaignForm.value_type,
        frequency: campaignForm.frequency,
        budget_limit_dollars: campaignForm.budget_limit_dollars ? parseFloat(campaignForm.budget_limit_dollars) : null,
        max_uses_per_user: campaignForm.max_uses_per_user ? parseInt(campaignForm.max_uses_per_user) : null,
        max_uses_total: campaignForm.max_uses_total ? parseInt(campaignForm.max_uses_total) : null,
        start_date: campaignForm.start_date,
        end_date: campaignForm.end_date || null,
        auto_pause_on_budget: campaignForm.auto_pause_on_budget,
        status: 'active' as any,
      };

      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, campaignData);
        toast({ title: "Campaña actualizada" });
      } else {
        await createCampaign(campaignData);
        toast({ title: "Campaña creada" });
      }

      setIsCreating(false);
      setEditingCampaign(null);
      resetCampaignForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la campaña.",
        variant: "destructive",
      });
    }
  };

  const handleEditCampaign = (campaign: RewardsCampaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      description: campaign.description || '',
      campaign_type: campaign.campaign_type,
      reward_value: campaign.reward_value.toString(),
      value_type: campaign.value_type,
      frequency: campaign.frequency,
      budget_limit_dollars: campaign.budget_limit_dollars?.toString() || '',
      max_uses_per_user: campaign.max_uses_per_user?.toString() || '',
      max_uses_total: campaign.max_uses_total?.toString() || '',
      start_date: campaign.start_date.split('T')[0],
      end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
      auto_pause_on_budget: campaign.auto_pause_on_budget,
    });
    setIsCreating(true);
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      campaign_type: 'welcome',
      reward_value: '',
      value_type: 'fixed',
      frequency: 'per_event',
      budget_limit_dollars: '',
      max_uses_per_user: '',
      max_uses_total: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      auto_pause_on_budget: true,
    });
  };

  const toggleCampaignStatus = async (campaign: RewardsCampaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    await updateCampaign(campaign.id, { status: newStatus });
    toast({ title: `Campaña ${newStatus === 'active' ? 'activada' : 'pausada'}` });
  };

  if (configLoading || campaignsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            Sistema de Recompensas
          </h1>
          <p className="text-muted-foreground">
            Configura cómo los clientes ganan y usan puntos de recompensa
          </p>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Configuración Global
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <TrendingUp className="h-4 w-4 mr-2" />
              Campañas ({campaigns.length})
            </TabsTrigger>
          </TabsList>

          {/* CONFIGURACIÓN GLOBAL */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ganancia de Puntos</CardTitle>
                <CardDescription>Cómo los clientes ganan puntos por compras</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tipo de Ganancia</Label>
                  <Select value={earningType} onValueChange={(value) => setEarningType(value as 'percentage' | 'fixed')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentaje del total</SelectItem>
                      <SelectItem value="fixed">Cantidad fija por compra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {earningType === 'percentage' && (
                  <div>
                    <Label>Porcentaje de Ganancia (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={earningPercentage}
                      onChange={(e) => setEarningPercentage(e.target.value)}
                      placeholder="1.00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ej: 1% = 1000 puntos por cada $100 de compra
                    </p>
                  </div>
                )}

                {earningType === 'fixed' && (
                  <div>
                    <Label>Puntos Fijos por Compra</Label>
                    <Input
                      type="number"
                      value={earningFixed}
                      onChange={(e) => setEarningFixed(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversión de Puntos</CardTitle>
                <CardDescription>Valor monetario de los puntos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Puntos por Dólar</Label>
                  <Input
                    type="number"
                    value={pointsPerDollar}
                    onChange={(e) => setPointsPerDollar(e.target.value)}
                    placeholder="1000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {pointsPerDollar} puntos = $1.00 USD
                  </p>
                </div>

                <div>
                  <Label>Mínimo de Puntos para Usar</Label>
                  <Input
                    type="number"
                    value={minPointsToUse}
                    onChange={(e) => setMinPointsToUse(e.target.value)}
                    placeholder="1000"
                  />
                </div>

                <div>
                  <Label>Máximo % de Descuento en Checkout</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={maxUsagePercentage}
                    onChange={(e) => setMaxUsagePercentage(e.target.value)}
                    placeholder="2.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Los clientes pueden usar máximo el {maxUsagePercentage}% del total
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacidad y Display</CardTitle>
                <CardDescription>Qué información mostrar a los clientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mostrar Porcentajes</Label>
                    <p className="text-xs text-muted-foreground">Ej: "Gana 1% en puntos"</p>
                  </div>
                  <Switch checked={showPercentage} onCheckedChange={setShowPercentage} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mostrar Tasa de Conversión</Label>
                    <p className="text-xs text-muted-foreground">Ej: "1000 pts = $1"</p>
                  </div>
                  <Switch checked={showConversion} onCheckedChange={setShowConversion} />
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    💡 <strong>Recomendado:</strong> Desactivar ambos para hacer los puntos más atractivos
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Configuración Multi-Plataforma
                </CardTitle>
                <CardDescription>
                  Compatible con Shopify, WooCommerce y tiendas personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Estándar Global:</strong> Amazon, Shopify, WooCommerce y las principales plataformas 
                    calculan puntos <strong>solo sobre el subtotal de productos</strong>, excluyendo impuestos y envío.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="include-tax" className="text-base font-medium">
                        Incluir impuestos en cálculo de puntos
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        ⚠️ <strong>No recomendado:</strong> Los impuestos no son ganancia de la tienda, son obligaciones gubernamentales.
                        Diferentes países tienen diferentes tasas (México 16%, USA varía, Europa 21-27%).
                      </p>
                    </div>
                    <Switch 
                      id="include-tax" 
                      checked={includeTax} 
                      onCheckedChange={setIncludeTax}
                      className="ml-4 mt-1"
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="include-shipping" className="text-base font-medium">
                        Incluir envío en cálculo de puntos
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        ⚠️ <strong>No recomendado:</strong> El costo de envío no es valor de productos. 
                        Las principales plataformas de ecommerce excluyen el envío del cálculo de puntos de lealtad.
                      </p>
                    </div>
                    <Switch 
                      id="include-shipping" 
                      checked={includeShipping} 
                      onCheckedChange={setIncludeShipping}
                      className="ml-4 mt-1"
                    />
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mt-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    Configuración Recomendada (Internacional)
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <strong>Incluir impuestos:</strong> NO ❌</li>
                    <li>• <strong>Incluir envío:</strong> NO ❌</li>
                    <li>• <strong>Calcular sobre:</strong> Subtotal de productos únicamente ✅</li>
                    <li>• <strong>Razón:</strong> Es justo para clientes en todos los países y sigue el estándar global</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveConfig} size="lg" className="w-full">
              <DollarSign className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </TabsContent>

          {/* CAMPAÑAS */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {campaigns.length} campañas configuradas
              </p>
              <Dialog open={isCreating} onOpenChange={(open) => {
                setIsCreating(open);
                if (!open) {
                  setEditingCampaign(null);
                  resetCampaignForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Campaña
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCampaign ? 'Editar Campaña' : 'Crear Nueva Campaña'}
                    </DialogTitle>
                    <DialogDescription>
                      Configura cómo y cuándo los clientes ganan puntos
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre de la Campaña*</Label>
                        <Input
                          value={campaignForm.name}
                          onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                          placeholder="Ej: Black Friday 2025"
                        />
                      </div>

                      <div>
                        <Label>Tipo*</Label>
                        <Select
                          value={campaignForm.campaign_type}
                          onValueChange={(value) => setCampaignForm({ ...campaignForm, campaign_type: value as CampaignType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CAMPAIGN_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.icon} {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        value={campaignForm.description}
                        onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                        placeholder="Descripción opcional de la campaña"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Valor de Recompensa*</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={campaignForm.reward_value}
                          onChange={(e) => setCampaignForm({ ...campaignForm, reward_value: e.target.value })}
                          placeholder="100"
                        />
                      </div>

                      <div>
                        <Label>Tipo de Valor*</Label>
                        <Select
                          value={campaignForm.value_type}
                          onValueChange={(value) => setCampaignForm({ ...campaignForm, value_type: value as 'fixed' | 'percentage' })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Puntos Fijos</SelectItem>
                            <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Presupuesto Máximo ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={campaignForm.budget_limit_dollars}
                          onChange={(e) => setCampaignForm({ ...campaignForm, budget_limit_dollars: e.target.value })}
                          placeholder="500"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Límite en dólares de puntos a otorgar
                        </p>
                      </div>

                      <div>
                        <Label>Frecuencia*</Label>
                        <Select
                          value={campaignForm.frequency}
                          onValueChange={(value) => setCampaignForm({ ...campaignForm, frequency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">Una vez por usuario</SelectItem>
                            <SelectItem value="daily">Una vez al día</SelectItem>
                            <SelectItem value="per_event">Por cada evento</SelectItem>
                            <SelectItem value="unlimited">Ilimitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Máx. usos por usuario</Label>
                        <Input
                          type="number"
                          value={campaignForm.max_uses_per_user}
                          onChange={(e) => setCampaignForm({ ...campaignForm, max_uses_per_user: e.target.value })}
                          placeholder="Ilimitado"
                        />
                      </div>

                      <div>
                        <Label>Máx. usos totales</Label>
                        <Input
                          type="number"
                          value={campaignForm.max_uses_total}
                          onChange={(e) => setCampaignForm({ ...campaignForm, max_uses_total: e.target.value })}
                          placeholder="Ilimitado"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Fecha Inicio*</Label>
                        <Input
                          type="date"
                          value={campaignForm.start_date}
                          onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Fecha Fin</Label>
                        <Input
                          type="date"
                          value={campaignForm.end_date}
                          onChange={(e) => setCampaignForm({ ...campaignForm, end_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Label>Auto-pausar al alcanzar presupuesto</Label>
                        <p className="text-xs text-muted-foreground">Protección automática</p>
                      </div>
                      <Switch
                        checked={campaignForm.auto_pause_on_budget}
                        onCheckedChange={(checked) => setCampaignForm({ ...campaignForm, auto_pause_on_budget: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingCampaign(null);
                        resetCampaignForm();
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveCampaign} className="flex-1">
                      {editingCampaign ? 'Actualizar' : 'Crear'} Campaña
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {campaigns.map((campaign) => {
                const budgetStatus = getBudgetStatus(campaign);
                const typeInfo = CAMPAIGN_TYPES.find((t) => t.value === campaign.campaign_type);

                return (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">{typeInfo?.icon}</span>
                            {campaign.name}
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{campaign.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCampaign(campaign)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant={campaign.status === 'active' ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => toggleCampaignStatus(campaign)}
                          >
                            {campaign.status === 'active' ? 'Pausar' : 'Activar'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Recompensa</p>
                          <p className="text-lg font-bold">
                            {campaign.value_type === 'percentage' && <Percent className="inline h-4 w-4" />}
                            {campaign.reward_value} {campaign.value_type === 'fixed' ? 'pts' : '%'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Usos</p>
                          <p className="text-lg font-bold">{campaign.current_uses}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha Fin</p>
                          <p className="text-sm">
                            {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Sin límite'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Frecuencia</p>
                          <p className="text-sm capitalize">{campaign.frequency.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {budgetStatus && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              {budgetStatus.isAtLimit && <AlertTriangle className="h-4 w-4 text-destructive" />}
                              Presupuesto
                            </span>
                            <span className="font-medium">
                              ${campaign.budget_spent_dollars.toFixed(2)} / ${campaign.budget_limit_dollars?.toFixed(2)}
                            </span>
                          </div>
                          <Progress 
                            value={budgetStatus.percentage} 
                            className={budgetStatus.isNearLimit ? 'bg-yellow-200' : ''}
                          />
                          {budgetStatus.isNearLimit && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Cerca del límite de presupuesto
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {campaigns.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No hay campañas</h3>
                    <p className="text-muted-foreground mb-4">
                      Crea tu primera campaña de recompensas
                    </p>
                    <Button onClick={() => setIsCreating(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Campaña
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
