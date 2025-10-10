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
    const { description, targetPhase, createNewPhase } = await req.json();

    if (!description || description.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'La descripción es requerida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating tasks for:', description);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY no configurada');
    }

    // Llamar a Lovable AI para generar tareas
    const aiPrompt = `Eres un experto en desarrollo de e-commerce. Analiza la siguiente solicitud de funcionalidad y genera tareas específicas para implementarla.

Solicitud: ${description}

Genera entre 3-5 tareas detalladas en formato JSON con esta estructura EXACTA:
{
  "phase": {
    "isNew": ${createNewPhase},
    "name": "${createNewPhase ? 'nombre sugerido de fase nueva' : targetPhase || 'Fase 1'}",
    "number": ${createNewPhase ? 'número siguiente disponible' : 'número de fase existente'}
  },
  "tasks": [
    {
      "feature_name": "Nombre descriptivo de la tarea",
      "description": "Descripción técnica detallada de qué hacer",
      "priority": "high|medium|low",
      "effort": "high|medium|low",
      "impact": "high|medium|low",
      "files_affected": ["ruta/archivo1.tsx", "ruta/archivo2.ts"],
      "acceptance_criteria": [
        "Criterio de aceptación 1",
        "Criterio de aceptación 2"
      ]
    }
  ],
  "estimated_sprint": "1.1"
}

IMPORTANTE:
- Usa nombres técnicos precisos para archivos
- Priority: high para features críticas, medium para importantes, low para nice-to-have
- Effort: high para >1 día, medium para 4-8h, low para <4h
- Impact: high para features con ROI alto, medium para mejoras, low para detalles
- files_affected debe incluir componentes, hooks, tipos, y páginas necesarios`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Eres un experto en planificación de proyectos de e-commerce. Respondes ÚNICAMENTE con JSON válido.' },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Límite de uso de IA excedido. Intenta más tarde.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI Response:', aiContent);

    // Parsear respuesta de IA
    let generatedData;
    try {
      // Limpiar el contenido si viene con markdown code blocks
      const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      generatedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('La IA generó una respuesta inválida');
    }

    // Validar estructura
    if (!generatedData.tasks || !Array.isArray(generatedData.tasks)) {
      throw new Error('Estructura de tareas inválida');
    }

    // Conectar a Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener el número de fase correcto
    let phaseNumber = generatedData.phase.number;
    let phaseName = generatedData.phase.name;

    if (createNewPhase) {
      // Obtener el número de fase más alto
      const { data: existingPhases } = await supabase
        .from('ecommerce_roadmap_items')
        .select('phase_number')
        .order('phase_number', { ascending: false })
        .limit(1);

      phaseNumber = existingPhases && existingPhases.length > 0 
        ? existingPhases[0].phase_number + 1 
        : 1;
    }

    // Obtener el número de item más alto para esta fase
    const { data: existingItems } = await supabase
      .from('ecommerce_roadmap_items')
      .select('item_number, sprint_number')
      .eq('phase_number', phaseNumber)
      .order('item_number', { ascending: false })
      .limit(1);

    let nextItemNumber = 1;
    let sprintNumber = generatedData.estimated_sprint || '1.1';
    
    if (existingItems && existingItems.length > 0) {
      const lastItemNumber = parseInt(existingItems[0].item_number.split('.')[2]) || 0;
      nextItemNumber = lastItemNumber + 1;
    }

    // Insertar tareas en la base de datos
    const tasksToInsert = generatedData.tasks.map((task: any, index: number) => ({
      phase_number: phaseNumber,
      phase_name: phaseName,
      sprint_number: sprintNumber,
      sprint_name: `Sprint ${sprintNumber}`,
      item_number: `${phaseNumber}.${sprintNumber}.${nextItemNumber + index}`,
      feature_name: task.feature_name,
      description: task.description,
      priority: task.priority || 'medium',
      effort: task.effort || 'medium',
      impact: task.impact || 'medium',
      files_affected: task.files_affected || [],
      acceptance_criteria: task.acceptance_criteria || [],
      status: 'todo',
      metadata: {
        generated_by_ai: true,
        original_request: description,
        generated_at: new Date().toISOString()
      }
    }));

    const { data: insertedTasks, error: insertError } = await supabase
      .from('ecommerce_roadmap_items')
      .insert(tasksToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting tasks:', insertError);
      throw insertError;
    }

    console.log(`Inserted ${insertedTasks.length} tasks successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        phase: { number: phaseNumber, name: phaseName },
        tasksCreated: insertedTasks.length,
        tasks: insertedTasks
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-generate-roadmap-tasks:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});