import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  welcomePoints: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, welcomePoints }: WelcomeEmailRequest = await req.json();
    
    console.log(`Sending welcome email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Wincova Store <onboarding@resend.dev>",
      to: [email],
      subject: "¡Bienvenido a Wincova! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .points-badge {
                background: #10b981;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                display: inline-block;
                font-weight: bold;
                font-size: 18px;
                margin: 20px 0;
              }
              .button {
                background: #667eea;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>¡Bienvenido a Wincova Store!</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${fullName}</strong>,</p>
              
              <p>¡Estamos emocionados de tenerte con nosotros! Tu cuenta ha sido creada exitosamente.</p>
              
              <div style="text-align: center;">
                <div class="points-badge">
                  🎁 ${welcomePoints.toLocaleString()} Puntos de Bienvenida
                </div>
              </div>
              
              <p>Como regalo de bienvenida, te hemos otorgado <strong>${welcomePoints.toLocaleString()} puntos</strong> que puedes usar en tu próxima compra.</p>
              
              <h3>¿Qué puedes hacer con tus puntos?</h3>
              <ul>
                <li>💰 Canjearlos por descuentos en tus compras</li>
                <li>🎯 Acumular más puntos con cada compra</li>
                <li>⭐ Escribir reseñas y ganar puntos adicionales</li>
                <li>👥 Referir amigos y obtener más recompensas</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="https://5a2eb3b3-00c8-460f-b355-686c7442387e.lovableproject.com/" class="button">
                  Comenzar a Comprar
                </a>
              </div>
              
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              
              <p>¡Felices compras! 🛍️</p>
              
              <p>El equipo de Wincova</p>
            </div>
            <div class="footer">
              <p>© 2025 Wincova Store. Todos los derechos reservados.</p>
              <p>Este correo fue enviado a ${email}</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
