
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0/190482014103021/messages";
const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WithdrawalRequest {
  userId: string;
  userName: string;
  amount: number;
  iban: string;
  accountHolder: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userName, amount, iban, accountHolder } = await req.json() as WithdrawalRequest;

    // Log the received data
    console.log("Withdrawal notification request received:", { userId, userName, amount, iban, accountHolder });

    if (!WHATSAPP_ACCESS_TOKEN) {
      throw new Error("WHATSAPP_ACCESS_TOKEN is not configured");
    }

    const messageBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "33621071025", // Replace with your WhatsApp number
      type: "text",
      text: {
        body: `⚠️ Nouvelle demande de retrait ⚠️\n\nUtilisateur: ${userName}\nMontant: ${amount}€\nIBAN: ${iban}\nTitulaire: ${accountHolder}`
      }
    };

    // Send WhatsApp message
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(messageBody)
    });

    const responseData = await response.json();
    console.log("WhatsApp API response:", responseData);

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${JSON.stringify(responseData)}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent successfully" }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});
