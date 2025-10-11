import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Key, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TranslationAPIManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['translation-api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_api_keys')
        .select('*')
        .eq('store_id', 'wincova_main')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      // Generate random API key
      const randomKey = `wt_${Array.from({ length: 32 }, () => 
        Math.random().toString(36).charAt(2)
      ).join('')}`;

      const { error } = await supabase
        .from('translation_api_keys')
        .insert({
          store_id: 'wincova_main',
          api_key: randomKey,
          name,
          is_active: true,
          rate_limit_per_minute: 60
        });
      
      if (error) throw error;
      return randomKey;
    },
    onSuccess: (newKey) => {
      queryClient.invalidateQueries({ queryKey: ['translation-api-keys'] });
      toast({
        title: '✅ API Key creada',
        description: 'Guarda la key en un lugar seguro, no podrás verla de nuevo'
      });
      setShowNewKeyDialog(false);
      setNewKeyName('');
      
      // Auto-copy to clipboard
      navigator.clipboard.writeText(newKey);
      toast({
        title: '📋 Copiado al portapapeles',
        description: 'La API key se copió automáticamente'
      });
    },
    onError: (error) => {
      toast({
        title: '❌ Error al crear key',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      });
    }
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('translation_api_keys')
        .delete()
        .eq('id', keyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translation-api-keys'] });
      toast({
        title: '✅ API Key eliminada',
        description: 'La key fue revocada permanentemente'
      });
      setDeleteKeyId(null);
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '📋 Copiado',
      description: 'API key copiada al portapapeles'
    });
  };

  const toggleReveal = (keyId: string) => {
    setRevealedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const maskKey = (key: string) => {
    return `${key.substring(0, 12)}${'•'.repeat(20)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Gestiona las claves de acceso para integraciones externas
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewKeyDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Cargando...</div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div 
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Key className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{key.name}</p>
                      <Badge variant={key.is_active ? 'default' : 'secondary'}>
                        {key.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                        {revealedKeys.has(key.id) ? key.api_key : maskKey(key.api_key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReveal(key.id)}
                      >
                        {revealedKeys.has(key.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(key.api_key)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Creada: {new Date(key.created_at).toLocaleDateString()}</span>
                      {key.last_used_at && (
                        <span>Último uso: {new Date(key.last_used_at).toLocaleDateString()}</span>
                      )}
                      <span>Rate limit: {key.rate_limit_per_minute}/min</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteKeyId(key.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay API keys creadas</p>
              <p className="text-sm">Crea una para comenzar a usar la API</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Documentación de API</CardTitle>
          <CardDescription>
            Cómo usar el API de traducción en tus aplicaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium mb-2">Endpoint:</p>
            <code className="block bg-muted p-3 rounded text-sm">
              POST {import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-api
            </code>
          </div>

          <div>
            <p className="font-medium mb-2">Headers:</p>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`{
  "Content-Type": "application/json",
  "X-API-Key": "tu_api_key_aqui"
}`}
            </pre>
          </div>

          <div>
            <p className="font-medium mb-2">Body:</p>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`{
  "products": [
    {
      "name": "Product Name",
      "description": "Product description"
    }
  ],
  "targetLanguages": ["es", "fr", "pt", "zh"]
}`}
            </pre>
          </div>

          <div>
            <p className="font-medium mb-2">Respuesta:</p>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`{
  "success": true,
  "results": {
    "es": {
      "success": true,
      "translations": [...]
    }
  },
  "meta": {
    "products_processed": 10,
    "ai_calls_used": 4
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <AlertDialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Crear Nueva API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Dale un nombre descriptivo a esta key para identificarla fácilmente
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="key-name">Nombre de la Key</Label>
            <Input
              id="key-name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="ej: Integración con App X"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => createKeyMutation.mutate(newKeyName)}
              disabled={!newKeyName.trim() || createKeyMutation.isPending}
            >
              Crear Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteKeyId} onOpenChange={() => setDeleteKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Las aplicaciones que usen esta key dejarán de funcionar inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteKeyId && deleteKeyMutation.mutate(deleteKeyId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};