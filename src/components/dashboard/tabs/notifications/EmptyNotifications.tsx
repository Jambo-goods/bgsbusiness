
import { Bell } from "lucide-react";

interface EmptyNotificationsProps {
  filter: 'all' | 'unread';
}

export default function EmptyNotifications({ filter }: EmptyNotificationsProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-8 text-center">
      <Bell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
      <h3 className="text-lg font-medium text-gray-900">Aucune notification</h3>
      <p className="text-gray-500 mt-1">
        Vous n'avez actuellement aucune notification {filter === 'unread' ? 'non lue' : ''}.
      </p>
    </div>
  );
}
