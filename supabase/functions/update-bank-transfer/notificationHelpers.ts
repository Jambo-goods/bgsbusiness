
// Helper function to send notifications to users

export async function sendUserNotification(supabase: any, userId: string, transferData: any) {
  try {
    if (!userId) {
      console.log("No user ID provided for notification");
      return;
    }
    
    const amount = transferData.amount || 0;
    const reference = transferData.reference || '';
    
    // Create a notification for the user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Virement bancaire confirmé',
        message: `Votre virement bancaire de ${amount}€ a été confirmé et ajouté à votre portefeuille.`,
        type: 'deposit',
        seen: false,
        data: {
          amount,
          reference,
          category: 'success',
          timestamp: new Date().toISOString()
        }
      });
      
    if (notificationError) {
      console.error("Error creating notification:", notificationError.message);
    } else {
      console.log(`Notification sent to user ${userId} about transfer ${reference}`);
    }
  } catch (error: any) {
    console.error("Error sending notification:", error.message);
  }
}
