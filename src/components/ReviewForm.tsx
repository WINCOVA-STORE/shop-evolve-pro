import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateReview, useUserOrders } from "@/hooks/useReviews";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ productId, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  const createReview = useCreateReview();
  const { data: orders } = useUserOrders();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createReview.mutateAsync({
      product_id: productId,
      order_id: selectedOrderId || undefined,
      rating,
      title: title || undefined,
      comment: comment || undefined,
    });

    // Reset form
    setRating(5);
    setTitle("");
    setComment("");
    setSelectedOrderId("");
    onSuccess?.();
  };

  // Filter orders that contain this product
  const relevantOrders = orders?.filter(order =>
    order.order_items?.some(item => item.product_id === productId)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <div className="space-y-2">
        <Label>Calificación *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {relevantOrders && relevantOrders.length > 0 && (
        <div className="space-y-2">
          <Label>¿Compraste este producto? (Opcional)</Label>
          <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu pedido" />
            </SelectTrigger>
            <SelectContent>
              {relevantOrders.map((order) => (
                <SelectItem key={order.id} value={order.id}>
                  Pedido #{order.order_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Título (Opcional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resume tu opinión"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Comentario (Opcional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos más sobre tu experiencia"
          rows={4}
          maxLength={1000}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={createReview.isPending}>
          {createReview.isPending ? "Publicando..." : "Publicar reseña"}
        </Button>
        <p className="text-sm text-muted-foreground self-center">
          Ganarás 100 puntos 🎁
        </p>
      </div>
    </form>
  );
};