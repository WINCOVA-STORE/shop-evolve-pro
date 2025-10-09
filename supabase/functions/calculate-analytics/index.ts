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
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { organization_id } = await req.json();

    console.log('Calculating analytics for org:', organization_id);

    // Fetch all tasks for the organization
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('organization_id', organization_id);

    if (!tasks) {
      throw new Error('No tasks found');
    }

    const now = new Date();
    const completed = tasks.filter(t => t.status === 'done');
    const blocked = tasks.filter(t => t.status === 'blocked');
    const overdue = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < now && t.status !== 'done'
    );

    // Calculate completion times
    const completionTimes = completed
      .filter(t => t.created_at && t.updated_at)
      .map(t => {
        const created = new Date(t.created_at);
        const updated = new Date(t.updated_at);
        return (updated.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
      });

    const avgCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    // Calculate velocity (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentlyCompleted = completed.filter(t => 
      new Date(t.updated_at) > sevenDaysAgo
    );
    const velocity = recentlyCompleted.length / 7;

    // Get time logs for team utilization
    const { data: timeLogs } = await supabase
      .from('task_timelogs')
      .select('hours, logged_at')
      .gte('logged_at', sevenDaysAgo.toISOString());

    const totalHours = timeLogs?.reduce((sum, log) => sum + (log.hours || 0), 0) || 0;
    const expectedHours = 40 * 7; // Assuming 40 hours/week per person
    const teamUtilization = (totalHours / expectedHours) * 100;

    // Calculate risk score (0-100)
    const riskFactors = [
      blocked.length / tasks.length * 30, // Blocked tasks: 30%
      overdue.length / tasks.length * 40, // Overdue tasks: 40%
      (1 - (completed.length / tasks.length)) * 30 // Not completed: 30%
    ];
    const riskScore = Math.min(100, riskFactors.reduce((a, b) => a + b, 0));

    // Burndown data (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const burndownData = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const tasksRemainingThatDay = tasks.filter(t => {
        if (t.status === 'done') {
          return new Date(t.updated_at) > date;
        }
        return true;
      }).length;

      burndownData.push({
        date: date.toISOString().split('T')[0],
        remaining: tasksRemainingThatDay
      });
    }

    const metrics = {
      total_tasks: tasks.length,
      completed_tasks: completed.length,
      blocked_tasks: blocked.length,
      overdue_tasks: overdue.length,
      avg_completion_time_hours: Math.round(avgCompletionTime * 10) / 10,
      velocity_tasks_per_day: Math.round(velocity * 10) / 10,
      team_utilization_pct: Math.round(teamUtilization * 10) / 10,
      risk_score: Math.round(riskScore * 10) / 10,
      metrics_json: {
        burndown: burndownData,
        completion_times: completionTimes,
        recent_velocity: velocity
      }
    };

    // Save snapshot
    const { error: insertError } = await supabase
      .from('analytics_snapshots')
      .upsert({
        organization_id,
        snapshot_date: now.toISOString().split('T')[0],
        ...metrics
      }, {
        onConflict: 'organization_id,snapshot_date'
      });

    if (insertError) {
      console.error('Error saving snapshot:', insertError);
    }

    console.log('Analytics calculated successfully');

    return new Response(JSON.stringify(metrics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in calculate-analytics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
