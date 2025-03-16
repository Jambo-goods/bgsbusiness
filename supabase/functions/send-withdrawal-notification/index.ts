
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = "jambogoodsafrica@gmail.com"; // Hardcoded admin email address

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WithdrawalNotificationRequest {
  userName: string;
  userId: string;
  userEmail: string;
  amount: number;
  bankDetails: {
    accountName: string;
    bankName: string;
    accountNumber: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received withdrawal notification request");
    const { userName, userId, userEmail, amount, bankDetails }: WithdrawalNotificationRequest = await req.json();
    
    console.log(`Preparing to send withdrawal notification for user: ${userName} (${userId}), amount: ${amount}€`);
    console.log(`Sending email to: ${adminEmail}`);

    const emailResponse = await resend.emails.send({
      from: "BGS Invest <notifications@bgsinvest.fr>",
      to: [adminEmail],
      subject: "Notification de demande de retrait",
      html: `
        <h1>Un utilisateur a demandé un retrait</h1>
        <p><strong>Utilisateur:</strong> ${userName}</p>
        <p><strong>ID utilisateur:</strong> ${userId}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Montant:</strong> ${amount}€</p>
        <h2>Coordonnées bancaires</h2>
        <p><strong>Titulaire du compte:</strong> ${bankDetails.accountName}</p>
        <p><strong>Banque:</strong> ${bankDetails.bankName}</p>
        <p><strong>Numéro de compte:</strong> ${bankDetails.accountNumber}</p>
        <p>Veuillez traiter cette demande de retrait.</p>
      `,
    });

    console.log("Email withdrawal notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending withdrawal notification:", error);
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
