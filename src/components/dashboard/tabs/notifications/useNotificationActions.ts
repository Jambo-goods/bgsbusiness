
import { useState } from "react";
import { notificationService } from "@/services/notifications";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useNotificationActions() {
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success("Toutes les notifications ont été marquées comme lues");
      return true;
    } catch (err) {
      console.error("Error marking all as read:", err);
      toast.error("Erreur", { description: "Impossible de marquer toutes les notifications comme lues" });
      return false;
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      return true;
    } catch (err) {
      console.error("Error marking notification as read:", err);
      toast.error("Erreur", { description: "Impossible de marquer la notification comme lue" });
      return false;
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      console.log("Attempting to delete notification:", id);
      const success = await notificationService.deleteNotification(id);
      
      if (success) {
        toast.success("Notification supprimée");
        console.log("Notification deleted successfully from database");
        return true;
      } else {
        throw new Error("La suppression a échoué");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Erreur", { description: "Impossible de supprimer la notification" });
      return false;
    }
  };

  const handleDeleteAll = async () => {
    try {
      console.log("Attempting to delete all notifications");
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Erreur", { description: "Vous devez être connecté pour effectuer cette action" });
        return false;
      }
      
      const success = await notificationService.deleteAllNotifications();
      
      if (success) {
        toast.success("Toutes les notifications ont été supprimées");
        console.log("All notifications deleted successfully from database");
        return true;
      } else {
        throw new Error("La suppression a échoué");
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("Erreur", { description: "Impossible de supprimer toutes les notifications" });
      return false;
    }
  };

  return {
    handleMarkAllAsRead,
    handleMarkAsRead,
    handleDeleteNotification,
    handleDeleteAll
  };
}
