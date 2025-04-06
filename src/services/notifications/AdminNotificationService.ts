
import { supabase } from "@/integrations/supabase/client";
import { NotificationCategories } from "./types";
import type { NotificationCreateParams } from "./types";

export class AdminNotificationServiceImpl {
  async sendNotificationToUser(userId: string, params: NotificationCreateParams): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: params.title,
          message: params.description,
          type: params.type || 'admin',
          data: {
            category: params.category || NotificationCategories.info,
            ...params.metadata
          },
          seen: false
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending admin notification to user:', error);
      return false;
    }
  }

  async broadcastNotification(params: NotificationCreateParams): Promise<boolean> {
    try {
      // This would need to be implemented with a stored procedure or edge function
      // to efficiently broadcast to all users
      console.warn('Broadcast notification not fully implemented');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // For now, just log that it would be sent
      console.log(`Admin ${user?.email} would broadcast: ${params.title}`);
      
      return true;
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      return false;
    }
  }
}
