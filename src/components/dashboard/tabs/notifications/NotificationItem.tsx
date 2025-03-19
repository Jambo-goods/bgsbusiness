
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Dot, MoreVertical, CheckCircle, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Notification } from "@/services/notifications/types";
import { getNotificationTypeIcon, getNotificationCategoryIcon } from "./utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
    setIsDropdownOpen(false);
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: fr,
    });
  };

  const category = notification.category || "info";
  const typeIcon = getNotificationTypeIcon(notification.type);
  const categoryIcon = getNotificationCategoryIcon(category);

  return (
    <Card
      className={`p-4 relative transition-colors hover:bg-gray-50 ${
        notification.read ? "" : "bg-blue-50 hover:bg-blue-50/80"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full p-2 bg-white">{typeIcon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm text-gray-900">
              {notification.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              {!notification.read && (
                <Dot className="h-6 w-6 text-blue-500 -mr-1" />
              )}
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDate(notification.date)}
              </span>
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {!notification.read && (
                    <DropdownMenuItem onClick={handleMarkAsRead}>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Marquer comme lu
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {notification.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
