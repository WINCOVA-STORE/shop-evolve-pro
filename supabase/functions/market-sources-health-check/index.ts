import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheckResult {
  sourceKey: string;
  sourceName: string;
  sourceUrl: string;
  status: 'active' | 'warning' | 'error';
  responseTimeMs: number;
  httpStatusCode: number | null;
  lastError: string | null;
}

async function checkSourceHealth(sourceKey: string, sourceName: string, url: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  let status: 'active' | 'warning' | 'error' = 'active';
  let httpStatusCode: number | null = null;
  let lastError: string | null = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'HEAD', // Solo HEAD para no descargar todo el contenido
      signal: controller.signal,
      headers: {
        'User-Agent': 'Wincova Market Data Health Checker/1.0'
      }
    });

    clearTimeout(timeoutId);
    httpStatusCode = response.status;

    if (response.status >= 200 && response.status < 300) {
      status = 'active';
    } else if (response.status >= 300 && response.status < 400) {
      status = 'warning';
      lastError = `Redirect: ${response.status}`;
    } else {
      status = 'error';
      lastError = `HTTP ${response.status}`;
    }
  } catch (error: any) {
    status = 'error';
    lastError = error.message || 'Network error';
    console.error(`Error checking ${sourceName}:`, error);
  }

  const responseTimeMs = Date.now() - startTime;

  return {
    sourceKey,
    sourceName,
    sourceUrl: url,
    status,
    responseTimeMs,
    httpStatusCode,
    lastError
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Iniciando verificación de salud de fuentes de mercado...');

    // Obtener todas las fuentes a verificar
    const { data: sources, error: fetchError } = await supabase
      .from('wincova_market_sources_health')
      .select('*')
      .order('source_key');

    if (fetchError) {
      throw new Error(`Error fetching sources: ${fetchError.message}`);
    }

    if (!sources || sources.length === 0) {
      console.log('⚠️  No hay fuentes configuradas para verificar');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No sources to check',
          results: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Verificando ${sources.length} fuentes...`);

    // Verificar cada fuente en paralelo
    const healthCheckPromises = sources.map(source => 
      checkSourceHealth(source.source_key, source.source_name, source.source_url)
    );

    const results = await Promise.all(healthCheckPromises);

    // Actualizar base de datos con resultados
    const updatePromises = results.map(async (result) => {
      const source = sources.find(s => s.source_key === result.sourceKey)!;
      
      const updateData = {
        status: result.status,
        last_check_at: new Date().toISOString(),
        response_time_ms: result.responseTimeMs,
        http_status_code: result.httpStatusCode,
        last_error: result.lastError,
        consecutive_failures: result.status === 'error' 
          ? (source.consecutive_failures || 0) + 1 
          : 0,
        last_success_at: result.status === 'active' 
          ? new Date().toISOString() 
          : source.last_success_at
      };

      const { error: updateError } = await supabase
        .from('wincova_market_sources_health')
        .update(updateData)
        .eq('id', source.id);

      if (updateError) {
        console.error(`❌ Error actualizando ${result.sourceName}:`, updateError);
      } else {
        const emoji = result.status === 'active' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        console.log(`${emoji} ${result.sourceName}: ${result.status} (${result.responseTimeMs}ms)`);
      }

      return { source: result.sourceName, status: result.status, updated: !updateError };
    });

    await Promise.all(updatePromises);

    // Generar resumen
    const summary = {
      total: results.length,
      active: results.filter(r => r.status === 'active').length,
      warning: results.filter(r => r.status === 'warning').length,
      error: results.filter(r => r.status === 'error').length,
      avgResponseTime: Math.round(
        results.reduce((sum, r) => sum + r.responseTimeMs, 0) / results.length
      )
    };

    console.log('📈 Resumen:', summary);

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary,
        results: results.map(r => ({
          source: r.sourceName,
          status: r.status,
          responseTime: r.responseTimeMs,
          error: r.lastError
        }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('❌ Error en health check:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});