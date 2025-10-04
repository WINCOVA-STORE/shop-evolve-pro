import { Gift, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRewards } from "@/hooks/useRewards";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const RewardsBalance = () => {
  const { rewards, loading, availablePoints } = useRewards();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Cargando puntos...</div>
        </CardContent>
      </Card>
    );
  }

  const getRewardTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: "Bienvenida",
      purchase: "Compra",
      review: "Reseña",
      birthday: "Cumpleaños",
      referral: "Referido",
    };
    return labels[type] || type;
  };

  const getRewardTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      welcome: "bg-blue-500",
      purchase: "bg-green-500",
      review: "bg-purple-500",
      birthday: "bg-pink-500",
      referral: "bg-orange-500",
    };
    return colors[type] || "bg-gray-500";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Tus Puntos de Fidelidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Balance Total</p>
              <p className="text-4xl font-bold">{availablePoints.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">puntos disponibles</p>
            </div>
            <TrendingUp className="w-12 h-12 text-primary opacity-50" />
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-sm">Formas de ganar puntos:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Compras: Gana puntos con cada compra</li>
              <li>• Reseñas: Gana puntos por cada producto que reseñes</li>
              <li>• Cumpleaños: Recibe puntos especiales en tu día</li>
              <li>• Referidos: Gana puntos por cada amigo que invites</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {rewards && rewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Puntos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rewards.slice(0, 10).map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${getRewardTypeColor(
                        reward.type
                      )}`}
                    />
                    <div>
                      <p className="font-medium">{reward.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(reward.created_at), "d MMM yyyy", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +{Number(reward.amount).toLocaleString()}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {getRewardTypeLabel(reward.type)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};