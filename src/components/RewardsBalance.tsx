import { Gift, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRewards } from "@/hooks/useRewards";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

export const RewardsBalance = () => {
  const { rewards, loading, availablePoints } = useRewards();
  const { t, i18n } = useTranslation();
  
  const dateLocale = i18n.language === 'es' ? es : enUS;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">{t('rewards_balance.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  const getRewardTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: t('rewards_balance.type_welcome'),
      purchase: t('rewards_balance.type_purchase'),
      review: t('rewards_balance.type_review'),
      birthday: t('rewards_balance.type_birthday'),
      referral: t('rewards_balance.type_referral'),
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
            {t('rewards_balance.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">{t('rewards_balance.total_balance')}</p>
              <p className="text-4xl font-bold">{availablePoints.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('rewards_balance.available_points')}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-primary opacity-50" />
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-sm">{t('rewards_balance.ways_to_earn')}</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• {t('rewards_balance.purchases')}</li>
              <li>• {t('rewards_balance.reviews')}</li>
              <li>• {t('rewards_balance.birthday')}</li>
              <li>• {t('rewards_balance.referrals')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {rewards && rewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('rewards_balance.points_history')}</CardTitle>
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
                          locale: dateLocale,
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