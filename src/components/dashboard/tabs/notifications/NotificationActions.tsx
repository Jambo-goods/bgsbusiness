
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

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
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleMarkAllAsRead = async () => {
    try {
      const success = await onMarkAllAsRead();
      if (success) {
        toast.success("Toutes les notifications ont été marquées comme lues");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Erreur", { description: "Impossible de marquer toutes les notifications comme lues" });
    }
  };
  
  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true);
      console.log("Attempting to delete all notifications from NotificationActions");
      const success = await onDeleteAll();
      
      if (success) {
        toast.success("Toutes les notifications ont été supprimées");
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("Erreur", { description: "Impossible de supprimer toutes les notifications" });
    } finally {
      setIsDeleting(false);
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
        onClick={handleMarkAllAsRead}
        disabled={unreadCount === 0}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Tout marquer comme lu
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={totalCount === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Tout supprimer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement toutes vos notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAll}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
