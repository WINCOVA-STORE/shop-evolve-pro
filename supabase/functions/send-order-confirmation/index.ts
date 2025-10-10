import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  product_price: number;
  subtotal: number;
}

interface OrderConfirmationRequest {
  email: string;
  fullName: string;
  orderNumber: string;
  orderItems: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  pointsEarned?: number;
  estimatedDeliveryDate?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      fullName,
      orderNumber,
      orderItems,
      subtotal,
      tax,
      shipping,
      total,
      currency,
      pointsEarned,
      estimatedDeliveryDate,
    }: OrderConfirmationRequest = await req.json();
    
    console.log(`Sending order confirmation to: ${email}, Order: ${orderNumber}`);

    // Generate order items HTML
    const itemsHtml = orderItems
      .map(
        (item) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.product_price.toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">$${item.subtotal.toFixed(2)}</td>
          </tr>
        `
      )
      .join("");

    const emailResponse = await resend.emails.send({
      from: "Wincova Store <onboarding@resend.dev>",
      to: [email],
      subject: `Confirmación de Pedido #${orderNumber} 📦`,
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
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e5e7eb;
              }
              .order-number {
                background: #f3f4f6;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
              }
              .order-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              .order-table th {
                background: #f9fafb;
                padding: 10px;
                text-align: left;
                border-bottom: 2px solid #e5e7eb;
              }
              .totals {
                margin-top: 20px;
                border-top: 2px solid #e5e7eb;
                padding-top: 15px;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
              }
              .total-row.grand-total {
                font-weight: bold;
                font-size: 18px;
                color: #10b981;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #e5e7eb;
              }
              .points-earned {
                background: #ecfdf5;
                border: 2px solid #10b981;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
              }
              .button {
                background: #10b981;
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
                padding: 20px;
                background: #f9fafb;
                border-radius: 0 0 10px 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✅ ¡Pedido Confirmado!</h1>
              <p style="margin: 0; font-size: 16px;">Gracias por tu compra</p>
            </div>
            <div class="content">
              <p>Hola <strong>${fullName}</strong>,</p>
              
              <p>¡Excelentes noticias! Tu pedido ha sido confirmado y está siendo procesado.</p>
              
              <div class="order-number">
                <p style="margin: 0; color: #666; font-size: 14px;">Número de Pedido</p>
                <h2 style="margin: 5px 0; color: #10b981;">#${orderNumber}</h2>
              </div>
              
              ${estimatedDeliveryDate ? `
                <p style="text-align: center; color: #666;">
                  📅 Fecha estimada de entrega: <strong>${estimatedDeliveryDate}</strong>
                </p>
              ` : ''}
              
              <h3>Resumen del Pedido</h3>
              
              <table class="order-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="text-align: center;">Cantidad</th>
                    <th style="text-align: right;">Precio</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div class="totals">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>$${subtotal.toFixed(2)}</span>
                </div>
                ${tax > 0 ? `
                  <div class="total-row">
                    <span>Impuestos:</span>
                    <span>$${tax.toFixed(2)}</span>
                  </div>
                ` : ''}
                ${shipping > 0 ? `
                  <div class="total-row">
                    <span>Envío:</span>
                    <span>$${shipping.toFixed(2)}</span>
                  </div>
                ` : `
                  <div class="total-row" style="color: #10b981;">
                    <span>Envío:</span>
                    <span><strong>GRATIS ✨</strong></span>
                  </div>
                `}
                <div class="total-row grand-total">
                  <span>Total:</span>
                  <span>$${total.toFixed(2)} ${currency}</span>
                </div>
              </div>
              
              ${pointsEarned ? `
                <div class="points-earned">
                  <h3 style="margin: 0 0 10px 0; color: #10b981;">🎉 ¡Ganaste Puntos!</h3>
                  <p style="margin: 0; font-size: 24px; font-weight: bold; color: #059669;">
                    +${pointsEarned.toLocaleString()} puntos
                  </p>
                  <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                    Úsalos en tu próxima compra
                  </p>
                </div>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="https://5a2eb3b3-00c8-460f-b355-686c7442387e.lovableproject.com/track/${orderNumber}" class="button">
                  Rastrear mi Pedido
                </a>
              </div>
              
              <h3>¿Qué sigue?</h3>
              <ol>
                <li>✅ Procesaremos tu pedido en las próximas 24 horas</li>
                <li>📦 Prepararemos tu envío con mucho cuidado</li>
                <li>🚚 Te enviaremos un email con el número de rastreo</li>
                <li>🎁 ¡Recibirás tu pedido pronto!</li>
              </ol>
              
              <p>Si tienes alguna pregunta sobre tu pedido, puedes rastrearlo usando el botón de arriba o contactarnos directamente.</p>
              
              <p>¡Gracias por confiar en Wincova Store!</p>
              
              <p>El equipo de Wincova 💙</p>
            </div>
            <div class="footer">
              <p><strong>Wincova Store</strong></p>
              <p>© 2025 Wincova. Todos los derechos reservados.</p>
              <p>Este correo fue enviado a ${email}</p>
              <p style="margin-top: 10px;">
                <a href="#" style="color: #667eea; text-decoration: none;">Ver mi cuenta</a> | 
                <a href="#" style="color: #667eea; text-decoration: none;">Contactar soporte</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending order confirmation:", error);
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
