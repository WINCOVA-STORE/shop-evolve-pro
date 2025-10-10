import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Llama directamente a tu Edge Function de Supabase
    // Asegúrate de que la URL de tu Edge Function sea accesible
    const SUPABASE_EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-recommend`;

    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Opcional: si tu Edge Function requiere autorización del cliente,
        // puedes pasar el JWT del usuario logueado.
        // 'Authorization': `Bearer ${body.userToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Supabase Edge Function:', errorData);
      return NextResponse.json({ error: errorData.error || 'Failed to get recommendations from AI function' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('Error in API route for AI recommendations:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}