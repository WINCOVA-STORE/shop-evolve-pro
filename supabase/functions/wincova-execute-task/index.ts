import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { task } = await req.json();
    console.log('🚀 Executing task:', task.item_number, task.feature_name);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Construir el prompt para la IA
    const systemPrompt = `Eres un experto desarrollador de código que genera implementaciones precisas y completas.
Tu tarea es generar el código necesario para implementar la funcionalidad solicitada.

INSTRUCCIONES CRÍTICAS:
1. Genera código limpio, funcional y siguiendo las mejores prácticas
2. Incluye imports necesarios
3. Si hay archivos que modificar, especifica EXACTAMENTE qué cambios hacer
4. Asegúrate de que el código sea compatible con React, TypeScript, Tailwind
5. Usa los componentes de shadcn/ui cuando sea apropiado
6. Sigue el patrón de diseño del proyecto existente`;

    const userPrompt = `
# TAREA A IMPLEMENTAR

**Número:** ${task.item_number}
**Título:** ${task.feature_name}
**Descripción:** ${task.description || 'No especificada'}

## Detalles Técnicos

**Impacto:** ${task.impact}
**Esfuerzo:** ${task.effort}
**Prioridad:** ${task.priority}

${task.files_affected && task.files_affected.length > 0 ? `
## Archivos a Modificar
${task.files_affected.map((f: string) => `- ${f}`).join('\n')}
` : ''}

${task.metadata?.dependencies && task.metadata.dependencies.length > 0 ? `
## Dependencias
${task.metadata.dependencies.map((d: string) => `- ${d}`).join('\n')}
` : ''}

${task.metadata?.risks && task.metadata.risks.length > 0 ? `
## Riesgos a Considerar
${task.metadata.risks.map((r: string) => `- ${r}`).join('\n')}
` : ''}

${task.metadata?.ai_analysis?.recommendations ? `
## Recomendaciones Previas
${task.metadata.ai_analysis.recommendations}
` : ''}

${task.acceptance_criteria && task.acceptance_criteria.length > 0 ? `
## Criterios de Aceptación
${task.acceptance_criteria.map((c: any, i: number) => `${i + 1}. ${typeof c === 'string' ? c : c.description || JSON.stringify(c)}`).join('\n')}
` : ''}

---

Por favor, genera:
1. El código completo necesario para implementar esta funcionalidad
2. Instrucciones paso a paso de qué archivos crear/modificar
3. Cualquier configuración adicional necesaria

Formato de respuesta:
- Usa bloques de código markdown con el nombre del archivo
- Explica claramente cada paso
- Incluye advertencias si hay consideraciones especiales
`;

    console.log('📝 Llamando a Lovable AI...');

    // Llamar a Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Límite de tasa excedido. Por favor, intenta de nuevo más tarde.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Créditos agotados. Por favor, recarga tu saldo de Lovable AI.');
      }
      
      throw new Error(`Error en Lovable AI: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const generatedCode = aiData.choices?.[0]?.message?.content;

    if (!generatedCode) {
      throw new Error('No se recibió código generado de la IA');
    }

    console.log('✅ Código generado exitosamente');

    // Parsear el código generado para extraer archivos
    const files = parseGeneratedCode(generatedCode);

    // Guardar deployment en la base de datos
    const { data: deploymentData, error: deploymentError } = await supabase
      .from('wincova_code_deployments')
      .insert({
        roadmap_item_id: task.id,
        generated_code: {
          raw: generatedCode,
          files: files,
          instructions: extractInstructions(generatedCode)
        },
        deployment_mode: task.execution_mode || 'manual',
        status: 'pending'
      })
      .select()
      .single();

    if (deploymentError) {
      console.error('Error guardando deployment:', deploymentError);
    }

    // Si es modo automático, marcar la tarea como completada
    if (task.execution_mode === 'automatic') {
      const { error: updateError } = await supabase
        .from('ecommerce_roadmap_items')
        .update({
          status: 'done',
          completed_at: new Date().toISOString(),
          notes: 'Completado automáticamente por Wincova AI',
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (updateError) {
        console.error('Error actualizando estado de tarea:', updateError);
      } else {
        console.log('✅ Tarea marcada como completada automáticamente');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        taskId: task.id,
        deploymentId: deploymentData?.id,
        code: generatedCode,
        files: files,
        instructions: extractInstructions(generatedCode),
        executionMode: task.execution_mode || 'manual',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error en wincova-execute-task:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Función para parsear bloques de código
function parseGeneratedCode(content: string): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];
  
  // Buscar bloques de código con nombre de archivo
  const codeBlockRegex = /```(?:typescript|tsx|ts|javascript|jsx|js|css)?\s*(?:\/\/\s*)?([^\n]+\.(?:tsx?|jsx?|css))\n([\s\S]*?)```/g;
  
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const [, filePath, code] = match;
    files.push({
      path: filePath.trim(),
      content: code.trim()
    });
  }
  
  return files;
}

// Función para extraer instrucciones
function extractInstructions(content: string): string[] {
  const instructions: string[] = [];
  
  // Buscar listas numeradas o con bullets
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.match(/^\d+\./) || // 1. 2. 3.
      trimmed.startsWith('- ') ||
      trimmed.startsWith('* ') ||
      trimmed.startsWith('• ')
    ) {
      instructions.push(trimmed.replace(/^[\d.)\-*•]\s*/, ''));
    }
  }
  
  return instructions;
}
