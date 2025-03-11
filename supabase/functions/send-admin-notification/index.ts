
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL") || "jambogoodsafrica@gmail.com"; // Email administrateur

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  userId: string;
  userName: string;
  userEmail: string;
  notificationType: 'withdrawal' | 'bankTransfer' | 'investment';
  data: {
    amount?: number;
    bankDetails?: {
      accountName?: string;
      bankName?: string;
      accountNumber?: string;
    };
    reference?: string;
    projectName?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received admin notification request");
    const { userId, userName, userEmail, notificationType, data }: AdminNotificationRequest = await req.json();
    
    let subject = "";
    let emailContent = "";
    
    switch (notificationType) {
      case 'withdrawal':
        subject = "Nouvelle demande de retrait";
        emailContent = `
          <h1>Nouvelle demande de retrait</h1>
          <p><strong>Utilisateur:</strong> ${userName} (ID: ${userId})</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Montant:</strong> ${data.amount}€</p>
          
          <h2>Coordonnées bancaires</h2>
          <p><strong>Titulaire du compte:</strong> ${data.bankDetails?.accountName || 'Non spécifié'}</p>
          <p><strong>Banque:</strong> ${data.bankDetails?.bankName || 'Non spécifié'}</p>
          <p><strong>Numéro de compte:</strong> ${data.bankDetails?.accountNumber || 'Non spécifié'}</p>
          
          <p>Veuillez traiter cette demande de retrait dans les plus brefs délais.</p>
        `;
        break;
        
      case 'bankTransfer':
        subject = "Confirmation de virement bancaire";
        emailContent = `
          <h1>Confirmation de virement bancaire</h1>
          <p><strong>Utilisateur:</strong> ${userName} (ID: ${userId})</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Montant:</strong> ${data.amount}€</p>
          <p><strong>Référence:</strong> ${data.reference}</p>
          <p>L'utilisateur a confirmé avoir effectué le virement. Veuillez vérifier la réception avant de créditer le compte.</p>
        `;
        break;
        
      case 'investment':
        subject = "Nouvel investissement effectué";
        emailContent = `
          <h1>Nouvel investissement</h1>
          <p><strong>Utilisateur:</strong> ${userName} (ID: ${userId})</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Montant:</strong> ${data.amount}€</p>
          <p><strong>Projet:</strong> ${data.projectName}</p>
          <p>Un nouvel investissement a été effectué. Veuillez vérifier et valider la transaction.</p>
        `;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "BGS Invest <notifications@bgsinvest.fr>",
      to: [adminEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${emailContent}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px;">
            Ceci est une notification automatique du système BGS Invest.
          </p>
        </div>
      `,
    });

    console.log("Admin notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending admin notification:", error);
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
