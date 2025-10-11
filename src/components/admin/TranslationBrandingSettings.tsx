import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Palette, Globe } from 'lucide-react';

export const TranslationBrandingSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branding, isLoading } = useQuery({
    queryKey: ['translation-branding'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_branding')
        .select('*')
        .eq('store_id', 'wincova_main')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const [formData, setFormData] = useState({
    product_name: '',
    product_logo_url: '',
    primary_color: '',
    show_powered_by: true,
    custom_domain: '',
    api_enabled: false,
    monthly_api_quota: 10000
  });

  // Update form when data loads
  useState(() => {
    if (branding) {
      setFormData({
        product_name: branding.product_name,
        product_logo_url: branding.product_logo_url || '',
        primary_color: branding.primary_color,
        show_powered_by: branding.show_powered_by,
        custom_domain: branding.custom_domain || '',
        api_enabled: branding.api_enabled,
        monthly_api_quota: branding.monthly_api_quota
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('translation_branding')
        .update(data)
        .eq('store_id', 'wincova_main');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translation-branding'] });
      toast({
        title: '✅ Configuración guardada',
        description: 'Los cambios de branding se aplicaron correctamente'
      });
    },
    onError: (error) => {
      toast({
        title: '❌ Error al guardar',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      });
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <CardTitle>Identidad de Marca</CardTitle>
          </div>
          <CardDescription>
            Personaliza la apariencia de tu sistema de traducción white-label
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_name">Nombre del Producto</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="ej: Mi Sistema de Traducción"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_color">Color Principal (Hex)</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="#2563eb"
                />
                <div 
                  className="w-12 h-10 rounded border"
                  style={{ backgroundColor: formData.primary_color }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_logo_url">URL del Logo</Label>
            <Input
              id="product_logo_url"
              value={formData.product_logo_url}
              onChange={(e) => setFormData({ ...formData, product_logo_url: e.target.value })}
              placeholder="https://ejemplo.com/logo.png"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Mostrar "Powered by Wincova"</p>
              <p className="text-sm text-muted-foreground">
                Aparece en el footer del sistema
              </p>
            </div>
            <Switch
              checked={formData.show_powered_by}
              onCheckedChange={(checked) => setFormData({ ...formData, show_powered_by: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <CardTitle>API Pública</CardTitle>
          </div>
          <CardDescription>
            Permite que aplicaciones externas usen tu sistema de traducción
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Habilitar API Externa</p>
              <p className="text-sm text-muted-foreground">
                Permite integraciones mediante API keys
              </p>
            </div>
            <Switch
              checked={formData.api_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, api_enabled: checked })}
            />
          </div>

          {formData.api_enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="monthly_api_quota">Cuota Mensual de API</Label>
                <Input
                  id="monthly_api_quota"
                  type="number"
                  value={formData.monthly_api_quota}
                  onChange={(e) => setFormData({ ...formData, monthly_api_quota: parseInt(e.target.value) })}
                  min={1000}
                  step={1000}
                />
                <p className="text-xs text-muted-foreground">
                  Número máximo de llamadas a IA permitidas por mes
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_domain">Dominio Personalizado (opcional)</Label>
                <Input
                  id="custom_domain"
                  value={formData.custom_domain}
                  onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value })}
                  placeholder="api.tudominio.com"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        disabled={saveMutation.isPending}
        size="lg"
        className="w-full"
      >
        <Save className="w-4 h-4 mr-2" />
        {saveMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
      </Button>
    </div>
  );
};