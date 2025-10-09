import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { phase_id, organization_id } = await req.json();

    // Fetch current phase and tasks context
    const { data: phase } = await supabase
      .from('phases')
      .select('*, tasks(*)')
      .eq('id', phase_id)
      .single();

    if (!phase) {
      throw new Error('Phase not found');
    }

    // Prepare context for AI
    const context = {
      phase_name: phase.name,
      phase_goal: phase.goal,
      current_tasks: phase.tasks.map((t: any) => ({
        title: t.title,
        status: t.status,
        priority: t.priority
      })),
      completed_count: phase.tasks.filter((t: any) => t.status === 'done').length,
      total_count: phase.tasks.length
    };

    const systemPrompt = `Eres un asistente experto en gestión de proyectos. Tu tarea es sugerir 3-5 tareas nuevas y accionables para ayudar a completar la fase del proyecto. 

Contexto del proyecto:
- Fase: ${context.phase_name}
- Objetivo: ${context.phase_goal}
- Tareas actuales: ${context.current_tasks.length}
- Completadas: ${context.completed_count}

Devuelve un JSON array con este formato:
[
  {
    "title": "Título claro y accionable",
    "description": "Descripción breve de 1-2 líneas",
    "priority": "high|medium|low",
    "estimate_hours": número,
    "tags": ["tag1", "tag2"]
  }
]`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(context) }
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await aiResponse.json();
    const suggestions = JSON.parse(aiData.choices[0].message.content);

    // Log AI usage
    await supabase.from('ai_assistant_logs').insert({
      organization_id,
      user_id: req.headers.get('x-user-id'),
      action_type: 'suggest_tasks',
      input_data: context,
      output_data: suggestions,
      model_used: 'google/gemini-2.5-flash',
      execution_time_ms: Date.now()
    });

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-suggest-tasks:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
