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

    const { organization_id } = await req.json();

    // Fetch all phases and tasks for the organization
    const { data: phases } = await supabase
      .from('phases')
      .select('*, tasks(*)')
      .eq('organization_id', organization_id);

    if (!phases) {
      throw new Error('No phases found');
    }

    // Analyze for risks
    const now = new Date();
    const riskyItems: any[] = [];

    phases.forEach((phase: any) => {
      // Check overdue tasks
      const overdueTasks = phase.tasks.filter((t: any) => 
        t.due_date && new Date(t.due_date) < now && t.status !== 'done'
      );

      // Check blocked tasks
      const blockedTasks = phase.tasks.filter((t: any) => t.status === 'blocked');

      // Check phase progress vs timeline
      const daysUntilDeadline = phase.end_date 
        ? Math.ceil((new Date(phase.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      const progressLag = phase.progress_pct < 50 && daysUntilDeadline < 30;

      if (overdueTasks.length > 0 || blockedTasks.length > 0 || progressLag) {
        riskyItems.push({
          phase_id: phase.id,
          phase_name: phase.name,
          overdue_count: overdueTasks.length,
          blocked_count: blockedTasks.length,
          progress_pct: phase.progress_pct,
          days_until_deadline: daysUntilDeadline,
          progress_lag: progressLag
        });
      }
    });

    // Use AI to analyze and provide recommendations
    const systemPrompt = `Eres un experto en gestión de riesgos de proyectos. Analiza los siguientes datos y proporciona:
1. Nivel de riesgo general (low/medium/high/critical)
2. Top 3 riesgos específicos
3. Recomendaciones accionables para cada riesgo

Responde en formato JSON:
{
  "overall_risk": "low|medium|high|critical",
  "risks": [
    {
      "title": "Título del riesgo",
      "severity": "low|medium|high|critical",
      "description": "Explicación breve",
      "recommendation": "Acción recomendada",
      "affected_phases": ["phase_id1", "phase_id2"]
    }
  ]
}`;

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
          { role: 'user', content: JSON.stringify({ risky_items: riskyItems }) }
        ],
        temperature: 0.3,
      }),
    });

    const aiData = await aiResponse.json();
    const riskAnalysis = JSON.parse(aiData.choices[0].message.content);

    // Log AI usage
    await supabase.from('ai_assistant_logs').insert({
      organization_id,
      user_id: req.headers.get('x-user-id'),
      action_type: 'detect_risks',
      input_data: { risky_items: riskyItems },
      output_data: riskAnalysis,
      model_used: 'google/gemini-2.5-flash',
      execution_time_ms: Date.now()
    });

    return new Response(JSON.stringify(riskAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-detect-risks:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
