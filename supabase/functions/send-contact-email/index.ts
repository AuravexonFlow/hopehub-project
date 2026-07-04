// Supabase Edge Function — Send contact form emails via Resend
// Deploy: supabase functions deploy send-contact-email
// Set secret: supabase secrets set RESEND_API_KEY=re_xxxxx

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TO_EMAIL = "richmondc2society@gmail.com";

interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
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
    const { name, email, subject, message }: ContactPayload = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send email via Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Hope Hub Contact <onboarding@resend.dev>",
        to: [TO_EMAIL],
        reply_to: email,
        subject: subject
          ? `[Hope Hub] ${subject}`
          : `[Hope Hub] New message from ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#6366f1;border-bottom:2px solid #6366f1;padding-bottom:10px;">
              📬 New Contact Message — Hope Hub
            </h2>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr>
                <td style="padding:8px 12px;font-weight:bold;color:#555;width:100px;">Name</td>
                <td style="padding:8px 12px;color:#111;">${name}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:8px 12px;font-weight:bold;color:#555;">Email</td>
                <td style="padding:8px 12px;color:#111;">
                  <a href="mailto:${email}">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 12px;font-weight:bold;color:#555;">Subject</td>
                <td style="padding:8px 12px;color:#111;">${subject || "(No subject)"}</td>
              </tr>
            </table>
            <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin-top:16px;">
              <h3 style="margin:0 0 8px;color:#333;">Message</h3>
              <p style="margin:0;color:#444;line-height:1.6;white-space:pre-wrap;">${message}</p>
            </div>
            <p style="color:#999;font-size:12px;margin-top:24px;text-align:center;">
              Sent from Richmond Hope Hub — ${new Date().toLocaleString()}
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
