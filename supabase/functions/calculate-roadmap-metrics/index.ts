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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📊 Calculando métricas del roadmap...');

    // Obtener todas las tareas
    const { data: items, error: itemsError } = await supabase
      .from('ecommerce_roadmap_items')
      .select('*');

    if (itemsError) throw itemsError;

    const total = items.length;
    const completed = items.filter(i => i.status === 'done').length;
    const inProgress = items.filter(i => i.status === 'in_progress').length;
    const blocked = items.filter(i => i.status === 'blocked').length;

    // Calcular velocidad (tareas por semana)
    const completedWithDates = items.filter(i => 
      i.status === 'done' && i.completed_at && i.started_at
    );
    
    let velocityPerWeek = 0;
    let avgCompletionHours = 0;

    if (completedWithDates.length > 0) {
      const totalHours = completedWithDates.reduce((sum, item) => {
        const start = new Date(item.started_at!);
        const end = new Date(item.completed_at!);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);

      avgCompletionHours = totalHours / completedWithDates.length;

      // Calcular velocidad basada en últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentCompleted = completedWithDates.filter(i => 
        new Date(i.completed_at!) > sevenDaysAgo
      );
      
      velocityPerWeek = recentCompleted.length;
    }

    // Calcular score de riesgo (optimizado)
    let riskScore = 0;
    if (total > 0) {
      riskScore = (
        (blocked / total) * 50 +  // Bloqueadas contribuyen 50%
        (inProgress / total) * 20  // En progreso 20%
      );
    }

    // Guardar métricas en la tabla
    const { error: insertError } = await supabase
      .from('roadmap_metrics')
      .insert({
        date: new Date().toISOString().split('T')[0],
        total_tasks: total,
        completed_tasks: completed,
        in_progress_tasks: inProgress,
        blocked_tasks: blocked,
        velocity_tasks_per_week: velocityPerWeek,
        avg_completion_time_hours: avgCompletionHours,
        risk_score: riskScore,
        metadata: {
          calculated_at: new Date().toISOString(),
          version: '1.0'
        }
      });

    if (insertError && insertError.code !== '23505') { // Ignorar duplicados
      console.error('Error guardando métricas:', insertError);
    }

    console.log('✅ Métricas calculadas:', {
      total,
      completed,
      velocityPerWeek,
      avgCompletionHours,
      riskScore: riskScore.toFixed(2)
    });

    return new Response(
      JSON.stringify({
        success: true,
        metrics: {
          total_tasks: total,
          completed_tasks: completed,
          in_progress_tasks: inProgress,
          blocked_tasks: blocked,
          velocity_tasks_per_week: velocityPerWeek,
          avg_completion_time_hours: avgCompletionHours,
          risk_score: riskScore,
          progress_percentage: total > 0 ? (completed / total) * 100 : 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error en calculate-roadmap-metrics:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error desconocido'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});