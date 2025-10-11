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
  RefreshCw,
  Info,
  Settings2
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

interface BackupRecord {
  id: string;
  backup_type: string;
  file_path: string;
  file_size: number;
  status: string;
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
  const [backupFrequency, setBackupFrequency] = useState<string>('daily');
  const [backupHour, setBackupHour] = useState<string>('03');
  const [backupDaysOfWeek, setBackupDaysOfWeek] = useState<string[]>(['1']);
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
        setAutoBackupEnabled(data.auto_backup_enabled || false);
        setBackupFrequency(data.frequency || 'daily');
        setBackupHour(data.backup_hour || '03');
        setBackupDaysOfWeek(data.backup_days_of_week || ['1']);
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
          backup_hour: backupHour,
          backup_days_of_week: backupDaysOfWeek,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      const daysText = backupFrequency === 'weekly' 
        ? ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
            .filter((_, i) => backupDaysOfWeek.includes(i.toString()))
            .join(', ')
        : 'todos los días';

      toast({
        title: "Configuración Guardada",
        description: `Backups programados ${daysText} a las ${backupHour}:00`,
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

  const toggleDay = (day: string) => {
    setBackupDaysOfWeek(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
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
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Sistema de Backups
          </h1>
          <p className="text-muted-foreground text-lg">
            Crea y gestiona backups de tu tienda para proteger tus datos
          </p>
          <Button
            size="lg"
            className="mt-6 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            onClick={() => navigate('/admin/recovery-guide')}
          >
            <Info className="h-5 w-5 mr-2" />
            Ver Manual de Recuperación
          </Button>
        </div>

        {/* Important Info Alert */}
        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="text-base font-semibold">Información Importante sobre los Backups</AlertTitle>
          <AlertDescription className="text-sm mt-2 space-y-1">
            <p>• <strong>Contenido del backup:</strong> Solo incluye datos de la base de datos (productos, órdenes, usuarios, configuraciones)</p>
            <p>• <strong>NO incluye:</strong> Código fuente de la aplicación, archivos del servidor, o configuraciones de hosting</p>
            <p>• <strong>Para recuperar código:</strong> Usa Git/GitHub o el sistema de versiones de Lovable</p>
            <p>• <strong>Restauración:</strong> Solo recupera los datos, no la aplicación completa</p>
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Manual Backup Card */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                Backup Manual
              </CardTitle>
              <CardDescription className="text-base">
                Crea un backup completo de tu tienda en este momento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border-2 border-dashed bg-muted/30 p-5 space-y-3">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Incluye en el backup:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▪</span>
                    <span>Productos y categorías completas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▪</span>
                    <span>Órdenes y datos de clientes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▪</span>
                    <span>Configuraciones del sistema</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▪</span>
                    <span>Reseñas, recompensas y referidos</span>
                  </li>
                </ul>
              </div>
              <Button 
                onClick={createManualBackup} 
                disabled={loading}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creando Backup...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Crear Backup Ahora
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Automatic Backup Card - Apple-style minimal */}
          <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-medium">
                    Backups Automáticos
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Programa backups recurrentes
                  </CardDescription>
                </div>
                <Switch
                  id="auto-backup"
                  checked={autoBackupEnabled}
                  onCheckedChange={setAutoBackupEnabled}
                />
              </div>
            </CardHeader>

            {autoBackupEnabled && (
              <CardContent className="space-y-8 pt-0">
                {/* Frecuencia */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Frecuencia
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'daily', label: 'Diario', desc: 'Cada día' },
                      { value: 'weekly', label: 'Semanal', desc: 'Cada semana' }
                    ].map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => setBackupFrequency(freq.value)}
                        className={`
                          p-4 rounded-xl text-left transition-all
                          ${backupFrequency === freq.value 
                            ? 'bg-primary text-primary-foreground shadow-md' 
                            : 'bg-muted/30 hover:bg-muted/50 text-foreground'}
                        `}
                      >
                        <p className="font-medium">{freq.label}</p>
                        <p className="text-xs opacity-80 mt-0.5">{freq.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Días de la semana - Solo si es semanal */}
                {backupFrequency === 'weekly' && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Días de la semana
                    </Label>
                    <div className="grid grid-cols-7 gap-2">
                      {[
                        { value: '0', label: 'D' },
                        { value: '1', label: 'L' },
                        { value: '2', label: 'M' },
                        { value: '3', label: 'X' },
                        { value: '4', label: 'J' },
                        { value: '5', label: 'V' },
                        { value: '6', label: 'S' }
                      ].map((day) => (
                        <button
                          key={day.value}
                          onClick={() => toggleDay(day.value)}
                          className={`
                            aspect-square rounded-full font-medium text-sm
                            transition-all
                            ${backupDaysOfWeek.includes(day.value)
                              ? 'bg-primary text-primary-foreground shadow-md scale-105'
                              : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground'}
                          `}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Selecciona uno o más días
                    </p>
                  </div>
                )}

                {/* Hora */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Hora de ejecución
                  </Label>
                  <Select value={backupHour} onValueChange={setBackupHour}>
                    <SelectTrigger className="h-12 rounded-xl border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={updateBackupSettings}
                  className="w-full h-12 rounded-xl font-medium"
                  size="lg"
                >
                  Guardar Configuración
                </Button>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Backup History */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                Historial de Backups
              </span>
              <Button variant="ghost" size="sm" onClick={fetchBackups} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </Button>
            </CardTitle>
            <CardDescription className="text-base">
              Gestiona y restaura backups anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
                  <Database className="h-12 w-12 opacity-50" />
                </div>
                <p className="text-lg font-medium mb-2">No hay backups disponibles</p>
                <p className="text-sm">Crea tu primer backup manual o activa los automáticos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div key={backup.id} className="border-2 rounded-xl p-5 hover:border-primary/50 transition-all hover:shadow-md bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge 
                            variant={backup.backup_type === 'manual' ? 'default' : 'secondary'}
                            className="px-3 py-1 text-xs font-semibold"
                          >
                            {backup.backup_type === 'manual' ? 'Manual' : 'Automático'}
                          </Badge>
                          {backup.status === 'completed' && (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-xs font-medium">Completado</span>
                            </div>
                          )}
                          {backup.status === 'failed' && (
                            <div className="flex items-center gap-1.5 text-destructive">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">Fallido</span>
                            </div>
                          )}
                          {backup.status === 'in_progress' && (
                            <div className="flex items-center gap-1.5 text-primary">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-xs font-medium">En progreso</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(backup.created_at), 'dd/MM/yyyy HH:mm')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Database className="h-3.5 w-3.5" />
                            {formatFileSize(backup.file_size)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => downloadBackup(backup.id, backup.file_path)}
                          disabled={backup.status !== 'completed'}
                          className="gap-2 h-10 px-4"
                        >
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">Descargar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => restoreBackup(backup.id)}
                          disabled={backup.status !== 'completed' || restoring}
                          className="gap-2 h-10 px-4"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="hidden sm:inline">Restaurar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => deleteBackup(backup.id, backup.file_path)}
                          className="gap-2 h-10 px-4 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Eliminar</span>
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