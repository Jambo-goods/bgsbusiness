
import { CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notification } from "@/services/notifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getNotificationTypeIcon } from "./utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: NotificationItemProps) {
  const formatNotificationDate = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: fr
    });
  };

  // Process the notification description to replace the specific text if found
  const processDescription = (description: string) => {
    if (description.includes("Un utilisateur a confirmé avoir effectué un virement bancaire avec la référence")) {
      // Extract the reference number from the original description
      const referenceMatch = description.match(/DEP-\d+/);
      const reference = referenceMatch ? referenceMatch[0] : "DEP-826253";
      
      // Return the new description with the specified reference
      return `a confirmé avoir effectué un virement bancaire avec la référence ${reference}`;
    }
    return description;
  };

  return (
    <div 
      key={notification.id}
      className={`p-4 rounded-lg border ${notification.read ? 'bg-white' : 'bg-blue-50 border-blue-100'} transition-colors`}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1">
          {getNotificationTypeIcon(notification.type)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className={`font-medium ${notification.read ? 'text-gray-900' : 'text-blue-800'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500">
              {formatNotificationDate(notification.date)}
            </span>
          </div>
          <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-blue-700'}`}>
            {processDescription(notification.description)}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!notification.read && (
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => onMarkAsRead(notification.id)}
              title="Marquer comme lu"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
          )}
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => onDelete(notification.id)}
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
