import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { site_url, client_name, competitors = [] } = await req.json();

    console.log('🔍 Iniciando diagnóstico para:', site_url);

    // Intentar obtener usuario autenticado (opcional)
    let userId = null;
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        userId = user?.id || null;
      }
    } catch (error) {
      console.log('ℹ️  Usuario no autenticado - continuando con diagnóstico público');
    }

    const { data: diagnosis, error: diagnosisError } = await supabase
      .from('wincova_diagnoses')
      .insert({
        user_id: userId, // NULL si no está autenticado
        client_name,
        site_url,
        status: 'analyzing',
        diagnosis_data: {},
      })
      .select()
      .single();

    if (diagnosisError) throw diagnosisError;

    console.log('✅ Diagnóstico creado:', diagnosis.id);

    // Preparar contexto para la IA
    const aiPrompt = `Analiza el siguiente sitio web y proporciona un diagnóstico detallado:

URL: ${site_url}
Nombre del cliente: ${client_name}

Proporciona:
1. Score de Performance (0-100)
2. Score de SEO (0-100)
3. Score de Seguridad (0-100)
4. Score de Accesibilidad (0-100)
5. Score de Compliance (0-100)

Además, identifica 5-10 cambios específicos que mejorarían el sitio, ordenados por impacto.

Para cada cambio proporciona:
- Categoría (performance/seo/security/accessibility/design)
- Título descriptivo
- Descripción detallada
- Detalles técnicos de implementación
- Estimación de impacto en performance (%)
- Estimación de impacto en conversiones (%)
- Estimación de impacto en ingresos mensuales ($)
- Nivel de riesgo (low/medium/high/critical)
- Puntuación de seguridad (0-100)
- Puntuación de impacto (0-100)
- Puntuación de complejidad (0-100)

${competitors.length > 0 ? `Competidores a analizar: ${competitors.join(', ')}` : ''}

Responde en formato JSON estructurado.`;

    // Llamar a Lovable AI
    console.log('🤖 Llamando a Lovable AI...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en análisis y optimización de sitios web. Analizas sitios web y proporcionas recomendaciones específicas y accionables. Siempre respondes en español y en formato JSON estructurado.',
          },
          {
            role: 'user',
            content: aiPrompt,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_diagnosis',
              description: 'Proporciona un diagnóstico completo del sitio web',
              parameters: {
                type: 'object',
                properties: {
                  scores: {
                    type: 'object',
                    properties: {
                      performance: { type: 'number' },
                      seo: { type: 'number' },
                      security: { type: 'number' },
                      accessibility: { type: 'number' },
                      compliance: { type: 'number' },
                      overall: { type: 'number' },
                    },
                    required: ['performance', 'seo', 'security', 'accessibility', 'compliance', 'overall'],
                  },
                  changes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        category: { type: 'string', enum: ['performance', 'seo', 'security', 'accessibility', 'design'] },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        technical_details: { type: 'string' },
                        estimated_performance_gain: { type: 'number' },
                        estimated_conversion_gain: { type: 'number' },
                        estimated_revenue_impact: { type: 'number' },
                        risk_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                        safety_score: { type: 'number' },
                        impact_score: { type: 'number' },
                        complexity_score: { type: 'number' },
                      },
                      required: ['category', 'title', 'description', 'technical_details', 'risk_level', 'safety_score', 'impact_score', 'complexity_score'],
                    },
                  },
                  competitive_analysis: {
                    type: 'object',
                    properties: {
                      gaps: { type: 'array', items: { type: 'string' } },
                      opportunities: { type: 'array', items: { type: 'string' } },
                    },
                  },
                },
                required: ['scores', 'changes'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'provide_diagnosis' } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Error de Lovable AI:', aiResponse.status, errorText);
      throw new Error(`Error de Lovable AI: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('✅ Respuesta de IA recibida');

    // Extraer el diagnóstico del tool call
    const toolCall = aiData.choices[0].message.tool_calls[0];
    const diagnosisResult = JSON.parse(toolCall.function.arguments);

    // Actualizar diagnóstico con scores
    const { error: updateError } = await supabase
      .from('wincova_diagnoses')
      .update({
        status: 'completed',
        performance_score: diagnosisResult.scores.performance,
        seo_score: diagnosisResult.scores.seo,
        security_score: diagnosisResult.scores.security,
        accessibility_score: diagnosisResult.scores.accessibility,
        compliance_score: diagnosisResult.scores.compliance,
        overall_score: diagnosisResult.scores.overall,
        diagnosis_data: diagnosisResult,
        competitors_data: diagnosisResult.competitive_analysis || {},
      })
      .eq('id', diagnosis.id);

    if (updateError) throw updateError;

    // Crear registros de cambios propuestos con AI Guardian Layer scores
    const changesWithConfidence = diagnosisResult.changes.map((change: any) => ({
      diagnosis_id: diagnosis.id,
      category: change.category,
      title: change.title,
      description: change.description,
      technical_details: change.technical_details,
      safety_score: change.safety_score,
      impact_score: change.impact_score,
      complexity_score: change.complexity_score,
      confidence_score: Math.min(100, (change.safety_score + change.impact_score) / 2),
      risk_level: change.risk_level,
      estimated_performance_gain: change.estimated_performance_gain || null,
      estimated_conversion_gain: change.estimated_conversion_gain || null,
      estimated_revenue_impact: change.estimated_revenue_impact || null,
      status: 'proposed',
      approval_required: change.risk_level !== 'low',
    }));

    const { error: changesError } = await supabase
      .from('wincova_changes')
      .insert(changesWithConfidence);

    if (changesError) throw changesError;

    // Crear log de cambio
    await supabase.from('wincova_change_logs').insert({
      diagnosis_id: diagnosis.id,
      action: 'proposed',
      performed_by_name: 'AI',
      details: `Diagnóstico completado con ${changesWithConfidence.length} cambios propuestos`,
    });

    console.log('✅ Diagnóstico completado exitosamente');

    return new Response(
      JSON.stringify({
        success: true,
        diagnosis_id: diagnosis.id,
        scores: diagnosisResult.scores,
        changes_count: changesWithConfidence.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
