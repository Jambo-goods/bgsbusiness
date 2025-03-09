
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BankTransferRequest {
  userId: string;
  userName: string;
  userEmail: string;
  reference: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userName, userEmail, reference }: BankTransferRequest = await req.json();
    
    console.log("Received bank transfer notification request:", { userId, userName, userEmail, reference });

    if (!adminEmail) {
      throw new Error("Admin email not configured");
    }

    const emailResponse = await resend.emails.send({
      from: "BGS Invest <onboarding@resend.dev>",
      to: [adminEmail],
      subject: "Nouveau virement bancaire confirmé",
      html: `
        <h1>Nouveau virement bancaire confirmé</h1>
        <p>Un utilisateur a confirmé avoir effectué un virement bancaire.</p>
        <h2>Détails:</h2>
        <ul>
          <li><strong>Utilisateur ID:</strong> ${userId}</li>
          <li><strong>Nom:</strong> ${userName || 'Non disponible'}</li>
          <li><strong>Email:</strong> ${userEmail}</li>
          <li><strong>Référence:</strong> ${reference}</li>
          <li><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</li>
        </ul>
        <p>Ce virement est en attente de vérification et de validation dans le tableau de bord administrateur.</p>
      `,
    });

    console.log("Email notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email notification:", error);
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
