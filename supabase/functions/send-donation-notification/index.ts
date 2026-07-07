// Supabase Edge Function — Send donation notification email via Resend
// Deploy: supabase functions deploy send-donation-notification
// Set secret: supabase secrets set RESEND_API_KEY=re_xxxxx

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TO_EMAIL = "richmondc2society@gmail.com";

interface DonationPayload {
  donorName: string;
  contactInfo?: string;
  category: string;
  requestTitle: string;
  items: string;
  quantity?: number;
  amount?: number;
  paymentMethod?: string;
  receiptNo?: string;
  notes?: string;
  lineItems?: { name: string; qty: number }[];
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info, x-supabase-api-version",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload: DonationPayload = await req.json();

    if (!payload.donorName || !payload.requestTitle) {
      return new Response(
        JSON.stringify({ error: "donorName and requestTitle are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build line items HTML
    let lineItemsHTML = '';
    if (payload.lineItems && payload.lineItems.length > 0) {
      lineItemsHTML = `
        <tr>
          <td style="padding:8px 12px;font-weight:bold;color:#555;vertical-align:top;">Items</td>
          <td style="padding:8px 12px;color:#111;">
            ${payload.lineItems.map(li => `<div style="padding:4px 0;">📦 ${li.qty}× ${li.name}</div>`).join('')}
          </td>
        </tr>`;
    }

    // Send email via Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Hope Hub Donations <onboarding@resend.dev>",
        to: [TO_EMAIL],
        reply_to: payload.contactInfo?.includes('@') ? payload.contactInfo : undefined,
        subject: `💝 New Donation: ${payload.donorName} — ${payload.requestTitle}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg,#e02040,#ff4060);border-radius:12px 12px 0 0;padding:24px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">💝 New Donation Received!</h1>
              <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">A donor has submitted a contribution via Hope Hub</p>
            </div>

            <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
              <h2 style="color:#e02040;margin:0 0 16px;font-size:18px;">📣 ${payload.requestTitle}</h2>
              
              <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr style="background:#fef2f2;">
                  <td style="padding:10px 12px;font-weight:bold;color:#555;width:120px;">Category</td>
                  <td style="padding:10px 12px;color:#111;">${payload.category}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;font-weight:bold;color:#555;">Donor Name</td>
                  <td style="padding:10px 12px;color:#111;font-weight:700;">${payload.donorName}</td>
                </tr>
                ${payload.contactInfo ? `
                <tr style="background:#fef2f2;">
                  <td style="padding:10px 12px;font-weight:bold;color:#555;">Contact</td>
                  <td style="padding:10px 12px;color:#111;">${payload.contactInfo}</td>
                </tr>` : ''}
                ${lineItemsHTML}
                ${payload.quantity ? `
                <tr>
                  <td style="padding:10px 12px;font-weight:bold;color:#555;">Total Qty</td>
                  <td style="padding:10px 12px;color:#111;">${payload.quantity} items</td>
                </tr>` : ''}
                ${payload.amount && payload.amount > 0 ? `
                <tr style="background:#fef2f2;">
                  <td style="padding:10px 12px;font-weight:bold;color:#555;">Cash Amount</td>
                  <td style="padding:10px 12px;color:#111;font-weight:700;font-size:18px;">LKR ${payload.amount.toLocaleString()}</td>
                </tr>` : ''}
                ${payload.paymentMethod ? `
                <tr>
                  <td style="padding:10px 12px;font-weight:bold;color:#555;">Payment</td>
                  <td style="padding:10px 12px;color:#111;">${payload.paymentMethod}</td>
                </tr>` : ''}
                ${payload.receiptNo ? `
                <tr style="background:#fef2f2;">
                  <td style="padding:10px 12px;font-weight:bold;color:#555;">Receipt No.</td>
                  <td style="padding:10px 12px;color:#111;">${payload.receiptNo}</td>
                </tr>` : ''}
              </table>

              ${payload.notes ? `
              <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin-top:16px;">
                <h3 style="margin:0 0 8px;color:#333;">📝 Notes from Donor</h3>
                <p style="margin:0;color:#444;line-height:1.6;white-space:pre-wrap;">${payload.notes}</p>
              </div>` : ''}

              <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:16px;margin-top:20px;text-align:center;">
                <p style="margin:0;color:#92400e;font-weight:600;">
                  ⏳ This donation is PENDING — Please review and confirm in the Admin Panel
                </p>
              </div>

              <div style="text-align:center;margin-top:20px;">
                <a href="https://richmondhopehub.auravexon.tech/admin" 
                   style="display:inline-block;background:linear-gradient(135deg,#e02040,#ff4060);color:#fff;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
                  ⚡ Open Admin Panel
                </a>
              </div>
            </div>

            <p style="color:#999;font-size:12px;margin-top:24px;text-align:center;">
              Sent from Richmond Hope Hub — ${new Date().toLocaleString()}<br>
              This is an automated notification. Do not reply directly to this email.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend API error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
