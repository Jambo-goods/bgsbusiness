
import { Bell } from "lucide-react";

interface EmptyNotificationsProps {
  filter: 'all' | 'unread';
}

export default function EmptyNotifications({ filter }: EmptyNotificationsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gray-100 p-3 mb-4">
        <Bell className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        {filter === 'all' ? 'Aucune notification' : 'Aucune notification non lue'}
      </h3>
      <p className="text-sm text-gray-500 max-w-md">
        {filter === 'all' 
          ? 'Vous n\'avez pas encore reçu de notifications. Elles apparaîtront ici lorsque vous aurez des mises à jour importantes.'
          : 'Toutes vos notifications ont été lues. Revenez plus tard pour voir les nouvelles notifications.'}
      </p>
    </div>
  );
}
