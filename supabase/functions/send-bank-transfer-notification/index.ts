
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = "jambogoodsafrica@gmail.com"; // Hardcoded admin email address

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BankTransferNotificationRequest {
  userName: string;
  userId: string;
  userEmail: string;
  reference: string;
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received bank transfer notification request");
    const { userName, userId, userEmail, reference, amount }: BankTransferNotificationRequest = await req.json();
    
    console.log(`Preparing to send notification for user: ${userName} (${userId}), reference: ${reference}, amount: ${amount}€`);
    console.log(`Sending email to: ${adminEmail}`);

    const emailResponse = await resend.emails.send({
      from: "BGS Invest <notifications@bgsinvest.fr>",
      to: [adminEmail],
      subject: "Notification de virement bancaire",
      html: `
        <h1>Un utilisateur a confirmé un virement bancaire</h1>
        <p><strong>Utilisateur:</strong> ${userName}</p>
        <p><strong>ID utilisateur:</strong> ${userId}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Montant:</strong> ${amount}€</p>
        <p>${userName} a confirmé avoir effectué un virement bancaire de ${amount}€ avec la référence ${reference}</p>
        <p>Veuillez vérifier la réception du virement avant de créditer le compte.</p>
      `,
    });

    console.log("Email notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending bank transfer notification:", error);
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
