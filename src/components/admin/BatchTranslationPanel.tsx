import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBatchTranslation } from '@/hooks/useBatchTranslation';
import { Languages, Loader2, CheckCircle, DollarSign, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const BatchTranslationPanel = () => {
  const { translateProducts, isTranslating, progress } = useBatchTranslation();

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-primary" />
              Sistema de Traducción Optimizado
            </CardTitle>
            <CardDescription className="mt-2">
              Traduce productos en batch para minimizar costos
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Zap className="w-3 h-3 mr-1" />
            Ultra Eficiente
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost Savings Info */}
        <Alert className="bg-blue-50 border-blue-200">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Ahorro de Costos</AlertTitle>
          <AlertDescription className="text-blue-700 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div className="bg-white/50 p-2 rounded">
                <p className="font-semibold">Sin Optimización:</p>
                <p className="text-xs">2000 productos = 8000 llamadas</p>
                <p className="text-xs font-bold text-red-600">~$40-80/mes</p>
              </div>
              <div className="bg-white/50 p-2 rounded border-2 border-green-500">
                <p className="font-semibold">Con Batch:</p>
                <p className="text-xs">2000 productos = 40 llamadas</p>
                <p className="text-xs font-bold text-green-600">~$2-5/mes</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Progress Display */}
        {progress && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Última Traducción</AlertTitle>
            <AlertDescription className="text-green-700 text-sm space-y-1">
              <div>✅ {progress.translated} productos traducidos</div>
              <div>📦 {progress.total} productos procesados</div>
              <div className="font-bold">💰 Solo {progress.aiCalls} llamadas a IA (ahorro de {(progress.total * 4) - progress.aiCalls} llamadas!)</div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={translateProducts}
            disabled={isTranslating}
            size="lg"
            className="w-full"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Traduciendo en Batch...
              </>
            ) : (
              <>
                <Languages className="w-4 h-4 mr-2" />
                Traducir Productos Pendientes
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Procesa hasta 50 productos por ejecución • Máxima eficiencia
          </p>
        </div>

        {/* Features List */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
          <p className="font-semibold mb-2">✨ Características:</p>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>NO retraduce productos ya traducidos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Agrupa 50 productos por llamada a IA</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Procesa 4 idiomas simultáneamente</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Reduce costos en 95%+ vs individual</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
