
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NotificationActionsProps {
  unreadCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onMarkAllAsRead: () => void;
  totalCount: number;
}

export default function NotificationActions({
  unreadCount,
  isRefreshing,
  onRefresh,
  onMarkAllAsRead,
  totalCount
}: NotificationActionsProps) {
  const handleDeleteAll = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      // Find all notification IDs for this user
      const { data } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', session.session.user.id);
      
      if (!data || data.length === 0) return;
      
      // Delete by IDs as we can't use direct user_id filtering with delete
      const ids = data.map(n => n.id);
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
      
      return [];
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Actualiser
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onMarkAllAsRead}
        disabled={unreadCount === 0}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Tout marquer comme lu
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDeleteAll}
        disabled={totalCount === 0}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Tout supprimer
      </Button>
    </div>
  );
}
