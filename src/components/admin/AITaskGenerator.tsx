import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error("Por favor escribe una descripción de la funcionalidad");
      return;
    }

    if (phaseOption === "existing" && !selectedPhase) {
      toast.error("Por favor selecciona una fase");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-roadmap-tasks', {
        body: {
          description,
          targetPhase: phaseOption === "existing" ? selectedPhase : undefined,
          createNewPhase: phaseOption === "new"
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResult({
        success: true,
        message: `✅ ${data.tasksCreated} tareas creadas en ${data.phase.name}`
      });

      toast.success(`${data.tasksCreated} tareas generadas exitosamente`);
      setDescription("");
      
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
            Describe la funcionalidad que deseas agregar
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
          disabled={isGenerating || !description.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando tareas con IA...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generar Tareas
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
          <p>💡 <strong>Tip:</strong> Sé específico en tu descripción para mejores resultados</p>
          <p>⚡ La IA analizará tu solicitud y creará tareas técnicas detalladas automáticamente</p>
        </div>
      </div>
    </Card>
  );
};