import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ChangelogBanner = () => {
  const [recentFeatures, setRecentFeatures] = useState<any[]>([]);
  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentFeatures();
  }, []);

  const fetchRecentFeatures = async () => {
    try {
      // Obtener features completadas en los últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('ecommerce_roadmap_items')
        .select('feature_name, completed_at, impact')
        .eq('status', 'done')
        .gte('completed_at', sevenDaysAgo.toISOString())
        .order('completed_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      if (data && data.length > 0) {
        setRecentFeatures(data);
      } else {
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Error fetching recent features:', error);
      setShowBanner(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !showBanner || recentFeatures.length === 0) return null;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800 mb-8">
      <CardContent className="p-4 sm:p-6">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={() => setShowBanner(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
                ¡Nuevas mejoras en la tienda!
              </h3>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                {recentFeatures.length} {recentFeatures.length === 1 ? 'novedad' : 'novedades'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentFeatures.map((feature, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                >
                  {feature.feature_name}
                </Badge>
              ))}
            </div>
          </div>
          
          <Link to="/changelog">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Ver todas
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
