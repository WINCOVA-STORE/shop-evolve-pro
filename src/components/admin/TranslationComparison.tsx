import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const TranslationComparison = () => {
  return (
    <div className="space-y-6">
      {/* Alerta Honesta */}
      <Alert className="border-orange-500 bg-orange-500/10">
        <AlertCircle className="h-5 w-5 text-orange-500" />
        <AlertDescription className="text-orange-900 dark:text-orange-100">
          <strong>🔴 IMPORTANTE - COMPARACIÓN HONESTA:</strong> Esta tabla muestra las características reales de cada sistema. Translation Pro tiene ventajas en precio y simplicidad, pero WPML y Weglot son productos más maduros con más funciones.
        </AlertDescription>
      </Alert>

      {/* Resumen Ejecutivo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 border-2 border-primary">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Translation Pro</h3>
              <Badge variant="default">Nuevo</Badge>
            </div>
            <p className="text-3xl font-bold text-primary">$29-79/mes</p>
            <p className="text-sm text-muted-foreground">Por productos ilimitados</p>
            <div className="pt-4 space-y-1">
              <p className="text-xs font-medium text-green-600">✅ Precio más bajo</p>
              <p className="text-xs font-medium text-green-600">✅ Productos ilimitados</p>
              <p className="text-xs font-medium text-orange-600">⚠️ Menos funciones</p>
              <p className="text-xs font-medium text-orange-600">⚠️ Solo WooCommerce</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">WPML</h3>
              <Badge variant="secondary">Establecido</Badge>
            </div>
            <p className="text-3xl font-bold">€99-199/año</p>
            <p className="text-sm text-muted-foreground">Pago único anual</p>
            <div className="pt-4 space-y-1">
              <p className="text-xs font-medium text-green-600">✅ Más completo</p>
              <p className="text-xs font-medium text-green-600">✅ Todo WordPress</p>
              <p className="text-xs font-medium text-orange-600">⚠️ Más caro</p>
              <p className="text-xs font-medium text-red-600">❌ Complejo de usar</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Weglot</h3>
              <Badge variant="secondary">Popular</Badge>
            </div>
            <p className="text-3xl font-bold">$17-329/mes</p>
            <p className="text-sm text-muted-foreground">Por palabras (10K-1M)</p>
            <div className="pt-4 space-y-1">
              <p className="text-xs font-medium text-green-600">✅ Fácil de usar</p>
              <p className="text-xs font-medium text-green-600">✅ Multi-plataforma</p>
              <p className="text-xs font-medium text-red-600">❌ Muy caro</p>
              <p className="text-xs font-medium text-red-600">❌ Cobra por palabra</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla Comparativa Detallada */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-left font-bold">Característica</th>
                <th className="p-4 text-center font-bold min-w-[150px]">Translation Pro</th>
                <th className="p-4 text-center font-bold min-w-[150px]">WPML</th>
                <th className="p-4 text-center font-bold min-w-[150px]">Weglot</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* Precio */}
              <tr className="hover:bg-muted/50">
                <td className="p-4 font-medium">💰 Precio Mensual</td>
                <td className="p-4 text-center">
                  <div className="space-y-1">
                    <p className="font-bold text-green-600">$29 - $79</p>
                    <p className="text-xs text-muted-foreground">Productos ilimitados</p>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="space-y-1">
                    <p className="font-bold">€99 - €199/año</p>
                    <p className="text-xs text-muted-foreground">(≈$110-220/año)</p>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="space-y-1">
                    <p className="font-bold text-red-600">$17 - $329</p>
                    <p className="text-xs text-muted-foreground">Límite de palabras</p>
                  </div>
                </td>
              </tr>

              {/* Modelo de cobro */}
              <tr className="hover:bg-muted/50">
                <td className="p-4 font-medium">📊 Modelo de Cobro</td>
                <td className="p-4 text-center">
                  <Badge variant="default">Por producto</Badge>
                  <p className="text-xs mt-1">Simple y predecible</p>
                </td>
                <td className="p-4 text-center">
                  <Badge variant="secondary">Créditos AI</Badge>
                  <p className="text-xs mt-1">90K - 180K créditos</p>
                </td>
                <td className="p-4 text-center">
                  <Badge variant="destructive">Por palabra</Badge>
                  <p className="text-xs mt-1">10K - 5M palabras</p>
                </td>
              </tr>

              {/* Traducción Automática */}
              <tr className="hover:bg-muted/50">
                <td className="p-4 font-medium">🤖 Traducción AI Automática</td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Google Gemini 2.5</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Solo CMS/Agency</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Todos los planes</p>
                </td>
              </tr>

              {/* WooCommerce */}
              <tr className="hover:bg-muted/50">
                <td className="p-4 font-medium">🛒 Soporte WooCommerce</td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">100% especializado</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Solo CMS/Agency</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Todos los planes</p>
                </td>
              </tr>

              {/* Tipo de instalación */}
              <tr className="hover:bg-muted/50 bg-orange-50 dark:bg-orange-950/20">
                <td className="p-4 font-medium">
                  🔌 Tipo de Instalación
                  <AlertCircle className="inline-block ml-2 h-4 w-4 text-orange-500" />
                </td>
                <td className="p-4 text-center">
                  <Badge variant="outline" className="border-orange-500">SaaS vía API</Badge>
                  <p className="text-xs mt-1 text-orange-600 font-medium">No es plugin tradicional</p>
                </td>
                <td className="p-4 text-center">
                  <Badge variant="default">Plugin WordPress</Badge>
                  <p className="text-xs mt-1">Instalación en tu WP</p>
                </td>
                <td className="p-4 text-center">
                  <Badge variant="outline">SaaS (JavaScript)</Badge>
                  <p className="text-xs mt-1">Widget externo</p>
                </td>
              </tr>

              {/* Dónde se guardan las traducciones */}
              <tr className="hover:bg-muted/50 bg-orange-50 dark:bg-orange-950/20">
                <td className="p-4 font-medium">
                  💾 Dónde se Guardan
                  <AlertCircle className="inline-block ml-2 h-4 w-4 text-orange-500" />
                </td>
                <td className="p-4 text-center">
                  <Badge variant="outline" className="border-orange-500">En la nube</Badge>
                  <p className="text-xs mt-1 text-orange-600 font-medium">Pierdes si desconectas</p>
                </td>
                <td className="p-4 text-center">
                  <Badge variant="default">Tu WooCommerce</Badge>
                  <p className="text-xs mt-1 text-green-600">Siempre tuyas</p>
                </td>
                <td className="p-4 text-center">
                  <Badge variant="outline">En Weglot</Badge>
                  <p className="text-xs mt-1">Pierdes si desconectas</p>
                </td>
              </tr>

              {/* Editor de traducciones */}
              <tr className="hover:bg-muted/50">
                <td className="p-4 font-medium">✏️ Editor de Traducciones</td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Dashboard + CSV</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Editor avanzado</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Dashboard visual</p>
                </td>
              </tr>

              {/* String Translation */}
              <tr className="hover:bg-muted/50 bg-red-50 dark:bg-red-950/20">
                <td className="p-4 font-medium">
                  🔤 String Translation
                  <AlertCircle className="inline-block ml-2 h-4 w-4 text-red-500" />
                </td>
                <td className="p-4 text-center">
                  <X className="h-5 w-5 text-red-600 mx-auto" />
                  <p className="text-xs mt-1 text-red-600 font-medium">NO disponible</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Todas las cadenas</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Automático</p>
                </td>
              </tr>

              {/* Traducción de menús */}
              <tr className="hover:bg-muted/50 bg-red-50 dark:bg-red-950/20">
                <td className="p-4 font-medium">
                  📁 Traducción de Menús
                  <AlertCircle className="inline-block ml-2 h-4 w-4 text-red-500" />
                </td>
                <td className="p-4 text-center">
                  <X className="h-5 w-5 text-red-600 mx-auto" />
                  <p className="text-xs mt-1 text-red-600 font-medium">NO disponible</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Completo</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Automático</p>
                </td>
              </tr>

              {/* Páginas estáticas */}
              <tr className="hover:bg-muted/50 bg-red-50 dark:bg-red-950/20">
                <td className="p-4 font-medium">
                  📄 Páginas Estáticas
                  <AlertCircle className="inline-block ml-2 h-4 w-4 text-red-500" />
                </td>
                <td className="p-4 text-center">
                  <X className="h-5 w-5 text-red-600 mx-auto" />
                  <p className="text-xs mt-1 text-red-600 font-medium">Solo productos</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Todo el sitio</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Todo el sitio</p>
                </td>
              </tr>

              {/* Page Builders */}
              <tr className="hover:bg-muted/50 bg-red-50 dark:bg-red-950/20">
                <td className="p-4 font-medium">
                  🎨 Page Builders (Elementor, etc)
                  <AlertCircle className="inline-block ml-2 h-4 w-4 text-red-500" />
                </td>
                <td className="p-4 text-center">
                  <X className="h-5 w-5 text-red-600 mx-auto" />
                  <p className="text-xs mt-1 text-red-600 font-medium">NO disponible</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Compatible</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Compatible</p>
                </td>
              </tr>

              {/* SEO Multilingüe */}
              <tr className="hover:bg-muted/50">
                <td className="p-4 font-medium">🔍 SEO Multilingüe</td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Hreflang + Meta</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Completo</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Automático</p>
                </td>
              </tr>

              {/* API Pública */}
              <tr className="hover:bg-muted/50">
                <td className="p-4 font-medium">⚡ API Pública</td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">REST API completa</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Hooks y filtros</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">REST API</p>
                </td>
              </tr>

              {/* Analytics */}
              <tr className="hover:bg-muted/50">
                <td className="p-4 font-medium">📈 Analytics Detallado</td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Dashboard completo</p>
                </td>
                <td className="p-4 text-center">
                  <X className="h-5 w-5 text-red-600 mx-auto" />
                  <p className="text-xs mt-1">Limitado</p>
                </td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Plan Pro+</p>
                </td>
              </tr>

              {/* White Label */}
              <tr className="hover:bg-muted/50">
                <td className="p-4 font-medium">🏷️ White Label</td>
                <td className="p-4 text-center">
                  <Check className="h-5 w-5 text-green-600 mx-auto" />
                  <p className="text-xs mt-1">Todos los planes</p>
                </td>
                <td className="p-4 text-center">
                  <X className="h-5 w-5 text-red-600 mx-auto" />
                  <p className="text-xs mt-1">No disponible</p>
                </td>
                <td className="p-4 text-center">
                  <X className="h-5 w-5 text-red-600 mx-auto" />
                  <p className="text-xs mt-1">Solo Enterprise</p>
                </td>
              </tr>

              {/* Complejidad de uso */}
              <tr className="hover:bg-muted/50">
                <td className="p-4 font-medium">🎯 Facilidad de Uso</td>
                <td className="p-4 text-center">
                  <Badge variant="default">Media</Badge>
                  <p className="text-xs mt-1">Requiere config API</p>
                </td>
                <td className="p-4 text-center">
                  <Badge variant="destructive">Complejo</Badge>
                  <p className="text-xs mt-1">Curva de aprendizaje</p>
                </td>
                <td className="p-4 text-center">
                  <Badge variant="default">Muy fácil</Badge>
                  <p className="text-xs mt-1">Plug & play</p>
                </td>
              </tr>

              {/* Soporte */}
              <tr className="hover:bg-muted/50">
                <td className="p-4 font-medium">💬 Soporte</td>
                <td className="p-4 text-center">
                  <p className="text-xs">Email + Chat</p>
                  <p className="text-xs text-muted-foreground">2-4h respuesta</p>
                </td>
                <td className="p-4 text-center">
                  <p className="text-xs">Forum + Tickets</p>
                  <p className="text-xs text-muted-foreground">1 año incluido</p>
                </td>
                <td className="p-4 text-center">
                  <p className="text-xs">Email + Chat</p>
                  <p className="text-xs text-muted-foreground">24h respuesta</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resumen y Recomendación */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 border-2 border-green-500">
          <h3 className="font-bold text-lg mb-4 text-green-700 dark:text-green-400">
            ✅ CUÁNDO USAR TRANSLATION PRO
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Solo necesitas traducir <strong>productos WooCommerce</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Tienes <strong>muchos productos</strong> (cientos o miles)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Quieres <strong>precio fijo predecible</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5" />
              <span>No te importa que las traducciones estén en la nube</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Quieres <strong>API pública</strong> para integraciones</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 border-2 border-orange-500">
          <h3 className="font-bold text-lg mb-4 text-orange-700 dark:text-orange-400">
            ⚠️ CUÁNDO NO USAR TRANSLATION PRO
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <X className="h-4 w-4 text-red-600 mt-0.5" />
              <span>Necesitas traducir <strong>todo tu sitio WordPress</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <X className="h-4 w-4 text-red-600 mt-0.5" />
              <span>Usas <strong>Page Builders</strong> (Elementor, Divi, etc)</span>
            </li>
            <li className="flex items-start gap-2">
              <X className="h-4 w-4 text-red-600 mt-0.5" />
              <span>Necesitas traducir <strong>menús y strings</strong> del tema</span>
            </li>
            <li className="flex items-start gap-2">
              <X className="h-4 w-4 text-red-600 mt-0.5" />
              <span>Quieres que las traducciones <strong>queden en tu BD</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <X className="h-4 w-4 text-red-600 mt-0.5" />
              <span>Tienes pocos productos (usa WPML o manual)</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Enlaces a documentación real */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <h3 className="font-bold text-lg mb-4">📚 Comparar precios oficiales</h3>
        <div className="flex flex-wrap gap-3">
          <a 
            href="https://weglot.com/pricing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow text-sm font-medium"
          >
            Ver precios Weglot <ExternalLink className="h-4 w-4" />
          </a>
          <a 
            href="https://wpml.org/purchase/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow text-sm font-medium"
          >
            Ver precios WPML <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </Card>
    </div>
  );
};
