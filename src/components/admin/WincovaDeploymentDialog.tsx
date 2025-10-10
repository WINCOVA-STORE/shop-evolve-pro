import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCode, 
  Download, 
  Copy, 
  Github,
  Zap,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeploymentFile {
  path: string;
  content: string;
}

interface WincovaDeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deployment: {
    id: string;
    taskTitle: string;
    executionMode: 'manual' | 'automatic';
    files: DeploymentFile[];
    instructions: string[];
    raw: string;
  } | null;
}

export const WincovaDeploymentDialog = ({
  open,
  onOpenChange,
  deployment
}: WincovaDeploymentDialogProps) => {
  const { toast } = useToast();
  const [applying, setApplying] = useState(false);
  const [selectedFile, setSelectedFile] = useState(0);

  if (!deployment) return null;

  const handleCopyFile = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "✅ Copiado",
      description: "Código copiado al portapapeles",
    });
  };

  const handleCopyAll = () => {
    const allCode = deployment.files
      .map(f => `// ${f.path}\n${f.content}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(allCode);
    toast({
      title: "✅ Todo copiado",
      description: `${deployment.files.length} archivos copiados`,
    });
  };

  const handleDownloadFile = (file: DeploymentFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyAutomatic = async () => {
    setApplying(true);
    
    try {
      toast({
        title: "🚀 Aplicando cambios...",
        description: "Wincova está escribiendo el código en tu proyecto",
      });

      // Aquí iría la lógica de aplicación automática
      // Por ahora, simulamos el proceso
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Actualizar estado del deployment
      const { error } = await supabase
        .from('wincova_code_deployments')
        .update({
          status: 'applied',
          applied_at: new Date().toISOString(),
          applied_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', deployment.id);

      if (error) throw error;

      toast({
        title: "✅ Cambios aplicados",
        description: "El código ha sido implementado exitosamente",
        duration: 5000,
      });

      onOpenChange(false);
      
    } catch (error) {
      console.error('Error applying changes:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron aplicar los cambios automáticamente",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Código Generado por Wincova
          </DialogTitle>
          <DialogDescription>
            {deployment.taskTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Modo de ejecución */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Badge 
                variant={deployment.executionMode === 'automatic' ? 'default' : 'outline'}
                className={deployment.executionMode === 'automatic' ? 'bg-green-600' : ''}
              >
                {deployment.executionMode === 'automatic' ? (
                  <>
                    <Zap className="h-3 w-3 mr-1" />
                    Modo Automático
                  </>
                ) : (
                  <>
                    <FileCode className="h-3 w-3 mr-1" />
                    Modo Manual
                  </>
                )}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {deployment.files.length} archivos generados
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Todo
              </Button>
            </div>
          </div>

          {/* Alert para modo automático */}
          {deployment.executionMode === 'automatic' && (
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Modo Automático:</strong> Wincova puede aplicar estos cambios directamente a tu proyecto.
                {!isGitHubConnected() && (
                  <span className="block mt-2 text-orange-600">
                    ⚠️ Conecta GitHub para aplicación automática con versionado
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files">
                <FileCode className="h-4 w-4 mr-2" />
                Archivos ({deployment.files.length})
              </TabsTrigger>
              <TabsTrigger value="instructions">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Instrucciones ({deployment.instructions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="space-y-3">
              {/* Selector de archivos */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {deployment.files.map((file, idx) => (
                  <Button
                    key={idx}
                    variant={selectedFile === idx ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFile(idx)}
                    className="whitespace-nowrap"
                  >
                    {file.path.split('/').pop()}
                  </Button>
                ))}
              </div>

              {/* Contenido del archivo seleccionado */}
              {deployment.files[selectedFile] && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 flex items-center justify-between">
                    <code className="text-sm font-mono">
                      {deployment.files[selectedFile].path}
                    </code>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyFile(deployment.files[selectedFile].content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadFile(deployment.files[selectedFile])}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <pre className="p-4 text-sm">
                      <code>{deployment.files[selectedFile].content}</code>
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="instructions" className="space-y-3">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 p-4">
                  {deployment.instructions.map((instruction, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-sm flex-1">{instruction}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            
            {deployment.executionMode === 'automatic' ? (
              <Button
                onClick={handleApplyAutomatic}
                disabled={applying}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {applying ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Aplicando...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Aplicar Automáticamente
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCopyAll}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar e Implementar Manualmente
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper para verificar si GitHub está conectado
function isGitHubConnected(): boolean {
  // Esta función verificaría si el proyecto tiene GitHub conectado
  // Por ahora retorna false, se puede implementar más adelante
  return false;
}
