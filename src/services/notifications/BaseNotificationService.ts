
import { supabase } from "@/integrations/supabase/client";
import { NotificationCategory } from "./types";

interface NotificationData {
  title: string;
  description: string;
  type: string;
  category: NotificationCategory;
  metadata?: Record<string, any>;
}

export class BaseNotificationService {
  protected async createNotification(data: NotificationData): Promise<void> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.error("No session found when trying to create notification");
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.session.user.id,
          title: data.title,
          message: data.description,
          type: data.type,
          data: {
            category: data.category,
            ...data.metadata
          }
        });
        
      if (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }
}
