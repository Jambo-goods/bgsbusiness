
// Helper functions for sending notifications to users

export async function sendUserNotification(supabase: any, userId: string, transferData: any) {
  try {
    if (!userId) {
      console.error("No user ID provided for notification");
      return;
    }
    
    console.log(`Sending notification to user ${userId} for transfer`);
    
    // Simple notification about deposit being received
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'wallet_deposit',
        title: 'Dépôt reçu',
        message: `Votre dépôt de ${transferData.amount || 0}€ a été confirmé.`,
        data: {
          amount: transferData.amount || 0,
          reference: transferData.reference || 'Virement bancaire'
        },
        seen: false
      });
      
    console.log("Notification sent successfully");
  } catch (error: any) {
    console.error("Error sending notification:", error.message);
  }
}
