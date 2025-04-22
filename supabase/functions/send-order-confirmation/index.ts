
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// You will need to set your RESEND_API_KEY as a secret using the Lovable UI.
// If not yet set, please provide it.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, storeName, orderId, items, total } = await req.json();

    // Dynamically import Resend only when function runs
    const { Resend } = await import("npm:resend@2.0.0");

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    // Build HTML with order items
    const html = `
      <h2>Thank you for your order!</h2>
      <p>Your order at <strong>${storeName || "Our Store"}</strong> has been placed!<br>
      <b>Order ID:</b> ${orderId}</p>
      <h3>Order Details:</h3>
      <ul>
        ${Array.isArray(items) ? items.map((item: any) =>
          `<li>${item.product_name} × ${item.quantity} - P${item.price}</li>`).join("")
        : ""}
      </ul>
      <p><strong>Total:</strong> P${total}</p>
      <p>You will receive delivery updates soon.<br><br>Thank you for shopping with us!</p>
    `;

    const response = await resend.emails.send({
      from: "GetMore <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html,
    });

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
