import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddTaskDialogProps {
  phaseNumber: number;
  phaseName: string;
  onTaskAdded?: () => void;
}

export const AddTaskDialog = ({ phaseNumber, phaseName, onTaskAdded }: AddTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    feature_name: "",
    description: "",
    priority: "medium",
    effort: "medium",
    impact: "medium",
    sprint_number: "1.1"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.feature_name.trim()) {
      toast.error("El nombre de la tarea es requerido");
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener el siguiente número de item
      const { data: existingItems } = await supabase
        .from('ecommerce_roadmap_items')
        .select('item_number')
        .eq('phase_number', phaseNumber)
        .order('item_number', { ascending: false })
        .limit(1);

      let nextItemNumber = 1;
      if (existingItems && existingItems.length > 0) {
        const lastItemNumber = parseInt(existingItems[0].item_number.split('.')[2]) || 0;
        nextItemNumber = lastItemNumber + 1;
      }

      const { error } = await supabase
        .from('ecommerce_roadmap_items')
        .insert({
          phase_number: phaseNumber,
          phase_name: phaseName,
          sprint_number: formData.sprint_number,
          sprint_name: `Sprint ${formData.sprint_number}`,
          item_number: `${phaseNumber}.${formData.sprint_number}.${nextItemNumber}`,
          feature_name: formData.feature_name,
          description: formData.description || null,
          priority: formData.priority,
          effort: formData.effort,
          impact: formData.impact,
          status: 'todo',
          files_affected: [],
          acceptance_criteria: [],
          metadata: {
            created_manually: true,
            created_at: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast.success("Tarea creada exitosamente");
      setOpen(false);
      setFormData({
        feature_name: "",
        description: "",
        priority: "medium",
        effort: "medium",
        impact: "medium",
        sprint_number: "1.1"
      });

      if (onTaskAdded) {
        onTaskAdded();
      }

    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message || "Error al crear la tarea");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar Tarea a {phaseName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feature_name">Nombre de la Tarea *</Label>
            <Input
              id="feature_name"
              value={formData.feature_name}
              onChange={(e) => setFormData({ ...formData, feature_name: e.target.value })}
              placeholder="Ej: Sistema de filtros avanzados"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción detallada de la tarea..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sprint">Sprint</Label>
              <Input
                id="sprint"
                value={formData.sprint_number}
                onChange={(e) => setFormData({ ...formData, sprint_number: e.target.value })}
                placeholder="1.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effort">Esfuerzo</Label>
              <Select value={formData.effort} onValueChange={(v) => setFormData({ ...formData, effort: v })}>
                <SelectTrigger id="effort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bajo (&lt;4h)</SelectItem>
                  <SelectItem value="medium">Medio (4-8h)</SelectItem>
                  <SelectItem value="high">Alto (&gt;1 día)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">Impacto</Label>
              <Select value={formData.impact} onValueChange={(v) => setFormData({ ...formData, impact: v })}>
                <SelectTrigger id="impact">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bajo</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Tarea"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};