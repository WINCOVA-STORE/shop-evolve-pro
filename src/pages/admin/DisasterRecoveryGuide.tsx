import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Github, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileCode,
  Database,
  Rocket,
  Shield,
  Info,
  ExternalLink,
  Copy,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const DisasterRecoveryGuide = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('recovery.copied'),
      description: `${label} ${t('recovery.copied_to_clipboard')}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">
            {t('recovery.title')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('recovery.subtitle')}
          </p>
        </div>

        {/* Status Check */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Estado de Conexión GitHub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>¿Cómo verificar tu conexión?</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>1. Ve al editor de Lovable</p>
                <p>2. Haz clic en el botón <strong>GitHub</strong> en la parte superior derecha</p>
                <p>3. Si dice "Connected to [nombre-repo]" → ✅ Estás conectado correctamente</p>
                <p>4. Si dice "Connect to GitHub" → ⚠️ Necesitas conectarte</p>
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2 text-sm">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir GitHub
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://lovable.dev', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Lovable
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Escenario 1: Recuperación Normal */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileCode className="h-6 w-6 text-primary" />
                  Escenario 1: Recuperar Código desde GitHub
                </CardTitle>
                <CardDescription className="mt-2">
                  Si perdiste acceso a Lovable o el proyecto desapareció
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                Más Común
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Paso 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Ve a GitHub</h3>
                <p className="text-muted-foreground mb-3">
                  Abre tu navegador y ve a <strong>github.com</strong>
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://github.com', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ir a GitHub
                </Button>
              </div>
            </div>

            <Separator />

            {/* Paso 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Busca tu repositorio</h3>
                <p className="text-muted-foreground mb-3">
                  En la página principal de GitHub, busca el repositorio de tu proyecto.
                </p>
                <Alert className="bg-amber-500/10 border-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-600">Si el repositorio estaba en tu cuenta personal</AlertTitle>
                  <AlertDescription className="text-amber-600/80">
                    Busca en "Your repositories" (tus repositorios)
                  </AlertDescription>
                </Alert>
                <Alert className="bg-blue-500/10 border-blue-500/20 mt-3">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-600">Si el repositorio está en una organización</AlertTitle>
                  <AlertDescription className="text-blue-600/80">
                    1. Haz clic en tu foto de perfil (arriba derecha)<br/>
                    2. Selecciona "Your organizations"<br/>
                    3. Entra a la organización<br/>
                    4. Busca el repositorio ahí
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator />

            {/* Paso 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Descarga el código</h3>
                <p className="text-muted-foreground mb-3">
                  Dentro del repositorio, haz clic en el botón verde <strong>{"<> Code"}</strong>
                </p>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <p className="font-medium">Tienes 2 opciones:</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Download className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Opción A: Download ZIP (Más Fácil)</p>
                        <p className="text-sm text-muted-foreground">
                          Descarga un archivo .zip con todo el código. Descomprímelo en tu computadora.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Copy className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Opción B: Clonar con Git</p>
                        <p className="text-sm text-muted-foreground">
                          Copia la URL y usa Git en tu computadora (requiere conocimientos técnicos)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Paso 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Despliega el código</h3>
                <p className="text-muted-foreground mb-4">
                  Ahora que tienes el código, puedes desplegarlo en cualquier hosting:
                </p>
                <div className="grid gap-3">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-primary" />
                      Opción 1: Vercel (Recomendado - Gratis)
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                      <li>Ve a <strong>vercel.com</strong></li>
                      <li>Conecta tu cuenta de GitHub</li>
                      <li>Selecciona el repositorio</li>
                      <li>Haz clic en "Deploy"</li>
                      <li>¡Listo! Tu sitio estará en línea en 2 minutos</li>
                    </ol>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-primary" />
                      Opción 2: Netlify (También Gratis)
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                      <li>Ve a <strong>netlify.com</strong></li>
                      <li>Conecta tu cuenta de GitHub</li>
                      <li>Selecciona el repositorio</li>
                      <li>Haz clic en "Deploy site"</li>
                      <li>¡Tu sitio estará en línea!</li>
                    </ol>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-primary" />
                      Opción 3: Volver a Lovable
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                      <li>Crea un nuevo proyecto en Lovable</li>
                      <li>Conecta el mismo repositorio de GitHub</li>
                      <li>Lovable sincronizará todo el código</li>
                      <li>Podrás continuar editando desde donde quedaste</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escenario 2: Problema de Organización */}
        <Card className="mb-8 border-amber-500/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                  Escenario 2: Moví el Repo a una Organización
                </CardTitle>
                <CardDescription className="mt-2">
                  El proyecto desapareció de Lovable después de mover el repositorio
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                Tu Caso
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-600">¿Qué pasó?</AlertTitle>
              <AlertDescription className="text-amber-600/80">
                Cuando mueves un repositorio de tu cuenta personal a una organización en GitHub,
                Lovable pierde la conexión porque la URL del repositorio cambió.
              </AlertDescription>
            </Alert>

            {/* Paso 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-amber-700">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">No entres en pánico</h3>
                <p className="text-muted-foreground">
                  ✅ Tu código está 100% seguro en GitHub<br/>
                  ✅ No perdiste nada<br/>
                  ✅ Solo necesitas reconectar Lovable
                </p>
              </div>
            </div>

            <Separator />

            {/* Paso 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-amber-700">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Verifica que el repo está en la organización</h3>
                <p className="text-muted-foreground mb-3">
                  En GitHub:
                </p>
                <ol className="text-sm text-muted-foreground space-y-2 ml-6 list-decimal">
                  <li>Haz clic en tu foto de perfil → "Your organizations"</li>
                  <li>Selecciona tu organización</li>
                  <li>Busca el repositorio → Debería estar ahí</li>
                </ol>
              </div>
            </div>

            <Separator />

            {/* Paso 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-amber-700">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Reconecta en Lovable</h3>
                <p className="text-muted-foreground mb-3">
                  Tienes 2 opciones:
                </p>
                
                <div className="space-y-4">
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <p className="font-semibold text-green-700 mb-2">Opción A: Actualizar la conexión (Más Rápido)</p>
                    <ol className="text-sm space-y-1 ml-4 list-decimal">
                      <li>En Lovable, haz clic en GitHub → Disconnect</li>
                      <li>Luego haz clic en GitHub → Connect to GitHub</li>
                      <li>Selecciona la organización</li>
                      <li>Selecciona el repositorio</li>
                      <li>¡Reconectado! Todo volverá a aparecer</li>
                    </ol>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <p className="font-semibold text-blue-700 mb-2">Opción B: Crear nuevo proyecto y conectar</p>
                    <ol className="text-sm space-y-1 ml-4 list-decimal">
                      <li>Crea un nuevo proyecto en Lovable</li>
                      <li>Conecta GitHub</li>
                      <li>Selecciona la organización</li>
                      <li>Selecciona el repositorio existente</li>
                      <li>Lovable sincronizará todo el código automáticamente</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escenario 3: Recuperar Datos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Database className="h-6 w-6 text-primary" />
              Escenario 3: Recuperar Datos (Productos, Órdenes)
            </CardTitle>
            <CardDescription className="mt-2">
              Si perdiste datos de la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Paso 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Ve a Sistema de Backups</h3>
                <p className="text-muted-foreground mb-3">
                  En el panel de administración, ve a <strong>Sistema de Backups</strong>
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/admin/system-backup'}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Ir a Backups
                </Button>
              </div>
            </div>

            <Separator />

            {/* Paso 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Busca el backup más reciente</h3>
                <p className="text-muted-foreground mb-3">
                  En la sección "Historial de Backups", verás todos tus backups con:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Fecha y hora de creación</li>
                  <li>Tipo (manual o automático)</li>
                  <li>Tamaño del archivo</li>
                  <li>Estado (completado/fallido)</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* Paso 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Restaura el backup</h3>
                <p className="text-muted-foreground mb-3">
                  Haz clic en el botón <strong>"Restaurar"</strong> del backup que quieres recuperar
                </p>
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-600">⚠️ Importante</AlertTitle>
                  <AlertDescription className="text-red-600/80">
                    La restauración reemplazará los datos actuales con los del backup.
                    Asegúrate de seleccionar el backup correcto.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator />

            {/* Paso 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Confirma y espera</h3>
                <p className="text-muted-foreground mb-3">
                  El proceso de restauración toma entre 1-5 minutos dependiendo del tamaño.
                  Verás una notificación cuando termine.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-500/10 p-3 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Una vez completado, todos tus datos estarán de vuelta</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist de Prevención */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Checklist de Prevención
            </CardTitle>
            <CardDescription>
              Haz esto para nunca perder información
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">GitHub conectado</p>
                  <p className="text-sm text-muted-foreground">
                    Verifica en Lovable que dice "Connected to..."
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Backups automáticos activados</p>
                  <p className="text-sm text-muted-foreground">
                    En Sistema de Backups, activa backups diarios o semanales
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Backup manual antes de cambios grandes</p>
                  <p className="text-sm text-muted-foreground">
                    Antes de migraciones o cambios importantes, crea un backup manual
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Github className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">Anota la URL de tu repositorio</p>
                  <p className="text-sm text-muted-foreground">
                    Guarda en un lugar seguro: github.com/tu-organizacion/tu-repositorio
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto de Emergencia */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>¿Necesitas ayuda adicional?</AlertTitle>
          <AlertDescription className="mt-2">
            Si sigues estos pasos y aún tienes problemas:
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>Contacta al soporte de Lovable</li>
              <li>Verifica los logs de errores en tu navegador (F12 → Console)</li>
              <li>Revisa que tu cuenta de GitHub tenga acceso a la organización</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      <Footer />
    </div>
  );
};

export default DisasterRecoveryGuide;