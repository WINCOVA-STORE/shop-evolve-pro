import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  Upload, 
  Database, 
  Clock, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface BackupRecord {
  id: string;
  backup_type: 'manual' | 'automatic';
  file_path: string;
  file_size: number;
  status: 'completed' | 'failed' | 'in_progress';
  created_at: string;
  created_by: string | null;
  metadata: any;
}

const SystemBackup = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState<'daily' | 'weekly'>('daily');
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchBackups();
    fetchBackupSettings();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      toast({
        title: "Acceso Denegado",
        description: "No tienes permisos de administrador",
        variant: "destructive",
      });
      navigate('/');
    }
  };

  const fetchBackups = async () => {
    try {
      const { data, error } = await supabase
        .from('system_backups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setBackups(data || []);
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const fetchBackupSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('backup_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setAutoBackupEnabled(data.auto_backup_enabled);
        setBackupFrequency(data.frequency);
      }
    } catch (error) {
      console.error('Error fetching backup settings:', error);
    }
  };

  const createManualBackup = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('create-backup', {
        body: { 
          backupType: 'manual',
          userId: user?.id 
        }
      });

      if (error) throw error;

      toast({
        title: "Backup Creado",
        description: "El backup se ha creado exitosamente",
      });

      fetchBackups();
    } catch (error: any) {
      console.error('Error creating backup:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async (backupId: string, filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('backups')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${backupId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga Iniciada",
        description: "El backup se está descargando",
      });
    } catch (error: any) {
      console.error('Error downloading backup:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el backup",
        variant: "destructive",
      });
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm('¿Estás seguro de que deseas restaurar este backup? Esta acción reemplazará los datos actuales.')) {
      return;
    }

    setRestoring(true);
    try {
      const { data, error } = await supabase.functions.invoke('restore-backup', {
        body: { backupId }
      });

      if (error) throw error;

      toast({
        title: "Restauración Exitosa",
        description: "Los datos han sido restaurados desde el backup",
      });

      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      console.error('Error restoring backup:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo restaurar el backup",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  const deleteBackup = async (backupId: string, filePath: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este backup?')) {
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('backups')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error: dbError } = await supabase
        .from('system_backups')
        .delete()
        .eq('id', backupId);

      if (dbError) throw dbError;

      toast({
        title: "Backup Eliminado",
        description: "El backup ha sido eliminado exitosamente",
      });

      fetchBackups();
    } catch (error: any) {
      console.error('Error deleting backup:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el backup",
        variant: "destructive",
      });
    }
  };

  const updateBackupSettings = async () => {
    try {
      const { error } = await supabase
        .from('backup_settings')
        .upsert({
          auto_backup_enabled: autoBackupEnabled,
          frequency: backupFrequency,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Configuración Guardada",
        description: "La configuración de backups automáticos ha sido actualizada",
      });
    } catch (error: any) {
      console.error('Error updating backup settings:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sistema de Backups</h1>
          <p className="text-muted-foreground">
            Crea y gestiona backups de tu tienda para proteger tus datos
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Manual Backup Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup Manual
              </CardTitle>
              <CardDescription>
                Crea un backup completo de tu tienda en este momento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium">Incluye:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Productos y categorías</li>
                  <li>• Órdenes y clientes</li>
                  <li>• Configuraciones del sistema</li>
                  <li>• Reseñas y recompensas</li>
                </ul>
              </div>
              <Button 
                onClick={createManualBackup} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando Backup...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Crear Backup Ahora
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Automatic Backup Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Backups Automáticos
              </CardTitle>
              <CardDescription>
                Configura backups automáticos programados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-backup" className="flex flex-col gap-1">
                  <span className="font-medium">Activar Backups Automáticos</span>
                  <span className="text-sm text-muted-foreground">
                    Se crearán backups automáticamente
                  </span>
                </Label>
                <Switch
                  id="auto-backup"
                  checked={autoBackupEnabled}
                  onCheckedChange={setAutoBackupEnabled}
                />
              </div>

              {autoBackupEnabled && (
                <div className="space-y-2">
                  <Label>Frecuencia</Label>
                  <Select value={backupFrequency} onValueChange={(v: any) => setBackupFrequency(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Diario (cada 24 horas)
                        </div>
                      </SelectItem>
                      <SelectItem value="weekly">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Semanal (cada 7 días)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                onClick={updateBackupSettings}
                variant="outline"
                className="w-full"
              >
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Historial de Backups
              </span>
              <Button variant="ghost" size="sm" onClick={fetchBackups}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Gestiona y restaura backups anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay backups disponibles</p>
                <p className="text-sm">Crea tu primer backup manual o activa los automáticos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={backup.backup_type === 'manual' ? 'default' : 'secondary'}>
                            {backup.backup_type === 'manual' ? 'Manual' : 'Automático'}
                          </Badge>
                          {backup.status === 'completed' && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          {backup.status === 'failed' && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                          {backup.status === 'in_progress' && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(backup.created_at), 'PPpp')}
                        </p>
                        <p className="text-sm">
                          Tamaño: {formatFileSize(backup.file_size)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadBackup(backup.id, backup.file_path)}
                          disabled={backup.status !== 'completed'}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreBackup(backup.id)}
                          disabled={backup.status !== 'completed' || restoring}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBackup(backup.id, backup.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default SystemBackup;