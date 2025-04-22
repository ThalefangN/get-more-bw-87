
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, storeName, orderId, items, total } = await req.json();

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Build HTML with order items
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Thank you for your order at <strong>${storeName || "Our Store"}</strong>!</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        
        <h3>Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${Array.isArray(items) ? items.map((item: any) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.product_name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">P${item.price.toFixed(2)}</td>
              </tr>
            `).join("") : ""}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
          <strong>Total: P${total.toFixed(2)}</strong>
        </div>
        
        <p style="margin-top: 20px; color: #666;">Thank you for shopping with us! You will receive delivery updates soon.</p>
      </div>
    `;

    const response = await resend.emails.send({
      from: "GetMore <onboarding@resend.dev>",
      to: [to],
      subject: subject || "Order Confirmation",
      html,
    });

    console.log("Email sent successfully:", response);

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error: any) {
    console.error("[send-order-confirmation] Failed to send email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

serve(handler);
