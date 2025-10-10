import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId } = await req.json();

    if (!taskId) {
      return new Response(
        JSON.stringify({ error: 'taskId es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('ecommerce_roadmap_items')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      throw new Error('Tarea no encontrada');
    }

    // Use AI to verify completion
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY no configurada');
    }

    const aiPrompt = `Analiza si esta tarea está realmente completa basándote en los archivos afectados y criterios de aceptación.

Tarea: ${task.feature_name}
Descripción: ${task.description}
Archivos afectados: ${task.files_affected?.join(', ') || 'No especificados'}
Criterios de aceptación: ${JSON.stringify(task.acceptance_criteria || [])}
Estado actual: ${task.status}

Responde en formato JSON con esta estructura EXACTA:
{
  "isComplete": true/false,
  "confidence": 0-100,
  "missingItems": ["item1", "item2"],
  "recommendation": "Acción recomendada",
  "needsManualVerification": true/false
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Eres un experto en QA de software. Respondes ÚNICAMENTE con JSON válido.' },
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Límite de uso de IA excedido' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleanedContent);

    return new Response(
      JSON.stringify({
        success: true,
        task: {
          id: task.id,
          name: task.feature_name,
          status: task.status
        },
        analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-analyze-task-completion:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error desconocido'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});