import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Upload, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AITaskGeneratorProps {
  onTasksGenerated?: () => void;
  existingPhases?: { number: number; name: string }[];
}

export const AITaskGenerator = ({ onTasksGenerated, existingPhases = [] }: AITaskGeneratorProps) => {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [phaseOption, setPhaseOption] = useState<"existing" | "new">("existing");
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and size
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        toast.error(`Archivo ${file.name} no soportado. Usa PDF, DOCX, TXT o MD`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`Archivo ${file.name} es muy grande. Máximo 10MB`);
        return;
      }
    }

    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} archivo(s) agregado(s)`);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!description.trim() && uploadedFiles.length === 0) {
      toast.error("Por favor escribe una descripción o sube un archivo");
      return;
    }

    if (phaseOption === "existing" && !selectedPhase) {
      toast.error("Por favor selecciona una fase");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      let fileContents: string[] = [];

      // Upload and process files if any
      if (uploadedFiles.length > 0) {
        setIsUploading(true);
        for (const file of uploadedFiles) {
          const filePath = `${Date.now()}-${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('task-documents')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Read file content
          const text = await file.text();
          fileContents.push(`--- Archivo: ${file.name} ---\n${text}`);

          // Clean up uploaded file
          await supabase.storage.from('task-documents').remove([filePath]);
        }
        setIsUploading(false);
      }

      const combinedDescription = [
        description,
        ...fileContents
      ].filter(Boolean).join('\n\n');

      const { data, error } = await supabase.functions.invoke('ai-generate-roadmap-tasks', {
        body: {
          description: combinedDescription,
          targetPhase: phaseOption === "existing" ? selectedPhase : undefined,
          createNewPhase: phaseOption === "new",
          hasFileContent: fileContents.length > 0
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResult({
        success: true,
        message: `✅ ${data.tasksCreated} tareas creadas en ${data.phase.name}${data.analysis ? '\n📊 ' + data.analysis : ''}`
      });

      toast.success(`${data.tasksCreated} tareas generadas exitosamente`);
      setDescription("");
      setUploadedFiles([]);
      
      if (onTasksGenerated) {
        onTasksGenerated();
      }

    } catch (error: any) {
      console.error('Error generating tasks:', error);
      const errorMessage = error.message || 'Error al generar tareas con IA';
      
      setResult({
        success: false,
        message: `❌ ${errorMessage}`
      });

      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-200 dark:border-purple-800">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
            Generador de Tareas con IA
          </h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Describe la funcionalidad o sube documentos
          </Label>
          <Textarea
            id="description"
            placeholder="Ejemplo: Quiero agregar un modelo 3D interactivo donde los clientes puedan ver los productos con sus propias fotos..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none"
            disabled={isGenerating}
          />
        </div>

        {/* File Upload Section */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">
            O sube archivos (PDF, DOCX, TXT, MD)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.txt,.md"
              multiple
              onChange={handleFileUpload}
              disabled={isGenerating || isUploading}
              className="cursor-pointer"
            />
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 mt-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isGenerating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>¿Dónde agregar las tareas?</Label>
          <RadioGroup value={phaseOption} onValueChange={(v) => setPhaseOption(v as "existing" | "new")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing" className="font-normal cursor-pointer">
                Agregar a fase existente
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new" className="font-normal cursor-pointer">
                Crear nueva fase
              </Label>
            </div>
          </RadioGroup>

          {phaseOption === "existing" && existingPhases.length > 0 && (
            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una fase" />
              </SelectTrigger>
              <SelectContent>
                {existingPhases.map((phase) => (
                  <SelectItem key={phase.number} value={phase.name}>
                    Fase {phase.number}: {phase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || (!description.trim() && uploadedFiles.length === 0)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? 'Procesando archivos...' : 'Generando tareas con IA...'}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generar Tareas con IA
            </>
          )}
        </Button>

        {result && (
          <div className={`flex items-start gap-2 p-3 rounded-lg ${
            result.success 
              ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
          }`}>
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <p className={`text-sm ${
              result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
            }`}>
              {result.message}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>💡 <strong>Tip:</strong> Sé específico en tu descripción o sube documentos detallados</p>
          <p>⚡ La IA analizará automáticamente: dependencias, riesgos, estimaciones y prioridades</p>
          <p>📊 Detecta tareas relacionadas y sugiere orden óptimo de implementación</p>
        </div>
      </div>
    </Card>
  );
};