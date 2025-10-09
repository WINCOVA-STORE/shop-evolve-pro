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

    const { diagnosis_id } = await req.json();

    console.log('🔒 Iniciando auditoría de compliance para diagnóstico:', diagnosis_id);

    // Obtener el diagnóstico
    const { data: diagnosis } = await supabase
      .from('wincova_diagnoses')
      .select('*')
      .eq('id', diagnosis_id)
      .single();

    if (!diagnosis) {
      throw new Error('Diagnóstico no encontrado');
    }

    // Preparar prompt para IA
    const aiPrompt = `Realiza una auditoría de compliance y accesibilidad para el sitio: ${diagnosis.site_url}

Analiza:
1. **GDPR/CCPA Compliance**:
   - ¿Tiene política de privacidad visible?
   - ¿Tiene banner de cookies conforme?
   - ¿Permite gestión de consentimientos?
   - Identifica problemas específicos

2. **WCAG 2.1 Accessibility**:
   - Nivel de conformidad (A, AA, AAA)
   - Contraste de colores
   - Etiquetas alt en imágenes
   - Navegación por teclado
   - Estructura semántica HTML
   - Identifica problemas específicos

3. **Security & SSL**:
   - Certificado SSL válido
   - Headers de seguridad (CSP, X-Frame-Options, etc.)
   - Vulnerabilidades conocidas
   - Identifica problemas específicos

4. **Core Web Vitals**:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)
   - ¿Pasan los umbrales de Google?

Proporciona un score general de compliance (0-100) y cuenta cuántos problemas críticos hay.`;

    // Llamar a Lovable AI
    console.log('🤖 Llamando a Lovable AI para auditoría...');
    
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
            content: 'Eres un experto en compliance web, GDPR, WCAG 2.1, y seguridad. Realizas auditorías detalladas y proporcionas recomendaciones accionables en español.',
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
              name: 'provide_compliance_audit',
              description: 'Proporciona una auditoría completa de compliance',
              parameters: {
                type: 'object',
                properties: {
                  gdpr: {
                    type: 'object',
                    properties: {
                      compliant: { type: 'boolean' },
                      issues: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                            description: { type: 'string' },
                            recommendation: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                  wcag: {
                    type: 'object',
                    properties: {
                      compliant: { type: 'boolean' },
                      level: { type: 'string', enum: ['A', 'AA', 'AAA', 'none'] },
                      issues: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            severity: { type: 'string' },
                            wcag_criterion: { type: 'string' },
                            description: { type: 'string' },
                            recommendation: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                  ssl: {
                    type: 'object',
                    properties: {
                      secure: { type: 'boolean' },
                      issues: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            severity: { type: 'string' },
                            description: { type: 'string' },
                            recommendation: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                  core_web_vitals: {
                    type: 'object',
                    properties: {
                      pass: { type: 'boolean' },
                      lcp: { type: 'number' },
                      fid: { type: 'number' },
                      cls: { type: 'number' },
                    },
                  },
                  compliance_score: { type: 'number' },
                  critical_issues_count: { type: 'number' },
                },
                required: ['gdpr', 'wcag', 'ssl', 'core_web_vitals', 'compliance_score', 'critical_issues_count'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'provide_compliance_audit' } },
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`Error de Lovable AI: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls[0];
    const auditResult = JSON.parse(toolCall.function.arguments);

    // Guardar resultados de compliance
    const { data: complianceCheck, error: complianceError } = await supabase
      .from('wincova_compliance_checks')
      .insert({
        diagnosis_id,
        gdpr_compliant: auditResult.gdpr.compliant,
        gdpr_issues: auditResult.gdpr.issues,
        wcag_compliant: auditResult.wcag.compliant,
        wcag_level: auditResult.wcag.level,
        wcag_issues: auditResult.wcag.issues,
        ssl_secure: auditResult.ssl.secure,
        ssl_issues: auditResult.ssl.issues,
        core_web_vitals_pass: auditResult.core_web_vitals.pass,
        core_web_vitals_metrics: auditResult.core_web_vitals,
        compliance_score: auditResult.compliance_score,
        critical_issues_count: auditResult.critical_issues_count,
        status: 'completed',
      })
      .select()
      .single();

    if (complianceError) throw complianceError;

    // Actualizar score de compliance en el diagnóstico
    await supabase
      .from('wincova_diagnoses')
      .update({
        compliance_score: auditResult.compliance_score,
      })
      .eq('id', diagnosis_id);

    console.log('✅ Auditoría de compliance completada');

    return new Response(
      JSON.stringify({
        success: true,
        compliance_check: complianceCheck,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error en compliance check:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
