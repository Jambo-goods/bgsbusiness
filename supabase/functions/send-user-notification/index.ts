
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserEmailRequest {
  userEmail: string;
  userName: string;
  subject: string;
  eventType: 'deposit' | 'withdrawal' | 'investment' | 'yield';
  data: {
    amount?: number;
    projectName?: string;
    status?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received user notification request");
    const { userEmail, userName, subject, eventType, data }: UserEmailRequest = await req.json();
    
    let emailContent = '';
    
    switch (eventType) {
      case 'deposit':
        emailContent = `
          <h1>Confirmation de dépôt</h1>
          <p>Bonjour ${userName},</p>
          <p>Votre dépôt de ${data.amount}€ a été ${data.status === 'completed' ? 'confirmé' : 'reçu et est en cours de traitement'}.</p>
          <p>Nous vous notifierons dès que les fonds seront disponibles dans votre portefeuille.</p>
        `;
        break;
        
      case 'withdrawal':
        emailContent = `
          <h1>Statut de votre retrait</h1>
          <p>Bonjour ${userName},</p>
          <p>Votre demande de retrait de ${data.amount}€ a été ${data.status}.</p>
          ${data.status === 'completed' ? '<p>Le virement a été effectué sur votre compte bancaire.</p>' : '<p>Nous traitons votre demande dans les plus brefs délais.</p>'}
        `;
        break;
        
      case 'yield':
        emailContent = `
          <h1>Rendement reçu</h1>
          <p>Bonjour ${userName},</p>
          <p>Nous avons le plaisir de vous informer qu'un rendement de ${data.amount}€ du projet ${data.projectName} a été crédité sur votre portefeuille.</p>
        `;
        break;
        
      // No case for 'investment' as we're removing that notification type
      default:
        emailContent = `
          <h1>${subject}</h1>
          <p>Bonjour ${userName},</p>
          <p>Vous avez reçu une notification de BGS Invest.</p>
        `;
    }

    const emailResponse = await resend.emails.send({
      from: "BGS Invest <notifications@bgsinvest.fr>",
      to: [userEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${emailContent}
          <p style="margin-top: 30px; color: #666;">Cordialement,<br>L'équipe BGS Invest</p>
        </div>
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
    console.error("Error sending user notification:", error);
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
