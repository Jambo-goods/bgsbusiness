
import { BaseNotificationService } from "./BaseNotificationService";

export class AdminNotificationService extends BaseNotificationService {
  /**
   * Send a system notification to a specific user
   */
  sendSystemNotification(
    userId: string, 
    title: string, 
    message: string, 
    category: "info" | "success" | "warning" | "error" = "info"
  ): Promise<void> {
    return this.createNotification({
      title,
      description: message,
      type: "system",
      category,
      metadata: {
        sentByAdmin: true,
        timestamp: new Date().toISOString()
      },
      userId
    });
  }
  
  /**
   * Send a marketing notification to a specific user
   */
  sendMarketingNotification(
    userId: string, 
    title: string, 
    message: string, 
    category: "info" | "success" | "warning" | "error" = "info"
  ): Promise<void> {
    return this.createNotification({
      title,
      description: message,
      type: "marketing",
      category,
      metadata: {
        sentByAdmin: true,
        timestamp: new Date().toISOString()
      },
      userId
    });
  }
  
  /**
   * Send a custom notification to a specific user
   */
  sendCustomNotification(
    userId: string, 
    title: string, 
    message: string, 
    category: "info" | "success" | "warning" | "error" = "info"
  ): Promise<void> {
    return this.createNotification({
      title,
      description: message,
      type: "custom",
      category,
      metadata: {
        sentByAdmin: true,
        timestamp: new Date().toISOString()
      },
      userId
    });
  }
  
  /**
   * Send a broadcast notification to all users
   */
  async broadcastNotification(
    title: string, 
    message: string, 
    type: "system" | "marketing" | "custom" = "marketing",
    category: "info" | "success" | "warning" | "error" = "info"
  ): Promise<void> {
    const { data: supabase } = await this.supabase.from('profiles').select('id');
    
    if (!supabase) return;
    
    const promises = supabase.map(user => 
      this.createNotification({
        title,
        description: message,
        type,
        category,
        metadata: {
          broadcast: true,
          sentByAdmin: true,
          timestamp: new Date().toISOString()
        },
        userId: user.id
      })
    );
    
    await Promise.all(promises);
  }
}

// Export a singleton instance
export const adminNotificationService = new AdminNotificationService();
