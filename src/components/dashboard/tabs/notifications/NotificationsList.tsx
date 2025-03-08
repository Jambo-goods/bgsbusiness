
import { Notification } from "@/services/notifications";
import NotificationItem from "./NotificationItem";
import EmptyNotifications from "./EmptyNotifications";

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  filter: 'all' | 'unread';
}

export default function NotificationsList({ 
  notifications, 
  onMarkAsRead, 
  onDelete, 
  filter 
}: NotificationsListProps) {
  if (notifications.length === 0) {
    return <EmptyNotifications filter={filter} />;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
