
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface NotificationActionsProps {
  unreadCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onMarkAllAsRead: () => Promise<boolean>;
  totalCount: number;
  onDeleteAll: () => Promise<boolean>;
}

export default function NotificationActions({
  unreadCount,
  isRefreshing,
  onRefresh,
  onMarkAllAsRead,
  totalCount,
  onDeleteAll
}: NotificationActionsProps) {
  const handleDeleteAll = async () => {
    try {
      const success = await onDeleteAll();
      if (success) {
        toast.success("Toutes les notifications ont été supprimées");
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("Erreur", { description: "Impossible de supprimer toutes les notifications" });
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
