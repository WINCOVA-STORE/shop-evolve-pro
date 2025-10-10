import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, metrics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY no configurada");
    }

    // Preparar datos para análisis
    const projectSummary = {
      total: metrics.total_items,
      completed: metrics.completed_items,
      in_progress: metrics.in_progress_items,
      blocked: metrics.blocked_items,
      progress: metrics.progress_percentage,
      phases: items.reduce((acc: any, item: any) => {
        if (!acc[item.phase_number]) {
          acc[item.phase_number] = {
            name: item.phase_name,
            tasks: 0,
            completed: 0,
          };
        }
        acc[item.phase_number].tasks++;
        if (item.status === 'done') acc[item.phase_number].completed++;
        return acc;
      }, {}),
      priorities: items.reduce((acc: any, item: any) => {
        acc[item.priority] = (acc[item.priority] || 0) + 1;
        return acc;
      }, {}),
    };

    const prompt = `Eres un consultor senior de proyectos de e-commerce analizando el roadmap de Wincova Store.

DATOS DEL PROYECTO:
- Total de tareas: ${projectSummary.total}
- Completadas: ${projectSummary.completed} (${projectSummary.progress.toFixed(1)}%)
- En progreso: ${projectSummary.in_progress}
- Bloqueadas: ${projectSummary.blocked}

DISTRIBUCIÓN POR PRIORIDAD:
${Object.entries(projectSummary.priorities).map(([p, c]) => `- ${p}: ${c}`).join('\n')}

PROGRESO POR FASES:
${Object.entries(projectSummary.phases).map(([num, data]: any) => 
  `- Fase ${num} (${data.name}): ${data.completed}/${data.tasks} completadas`
).join('\n')}

Genera un análisis ejecutivo profesional que incluya:

1. **Resumen Ejecutivo** (2-3 líneas): Estado general del proyecto de forma clara y concisa.

2. **Análisis de Velocidad** (2-3 líneas): Evaluación del ritmo de trabajo y productividad del equipo.

3. **Riesgos Críticos** (2-3 líneas): Principales amenazas que podrían afectar el éxito del proyecto.

4. **Oportunidades de Optimización** (2-3 líneas): Áreas donde se puede mejorar eficiencia o resultados.

5. **Recomendaciones Estratégicas** (3-4 bullets): Acciones concretas priorizadas para maximizar el éxito.

6. **Proyección de Finalización** (2 líneas): Estimación realista basada en el progreso actual.

IMPORTANTE: Sé específico, cuantitativo y accionable. Usa los datos proporcionados.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Eres un consultor experto en gestión de proyectos de e-commerce y análisis de roadmaps."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de la AI:", response.status, errorText);
      throw new Error(`Error al generar insights: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});