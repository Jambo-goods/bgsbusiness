
import { Bell } from "lucide-react";

interface EmptyNotificationsProps {
  filter: 'all' | 'unread';
}

export default function EmptyNotifications({ filter }: EmptyNotificationsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <Bell className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">
        {filter === 'all' ? 'Aucune notification' : 'Aucune notification non lue'}
      </h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto">
        {filter === 'all' 
          ? 'Vous n\'avez pas encore reçu de notifications. Elles apparaîtront ici lorsque vous aurez des mises à jour importantes.'
          : 'Toutes vos notifications ont été lues. Consultez l\'onglet "Toutes" pour voir l\'historique de vos notifications.'}
      </p>
    </div>
  );
}
