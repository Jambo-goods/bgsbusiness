
import { Bell } from "lucide-react";

interface NotificationHeaderProps {
  notificationCount: number;
}

export default function NotificationHeader({ notificationCount }: NotificationHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-bgs-blue">Notifications</h2>
      <p className="text-sm text-gray-500 mt-1">
        Gérez vos alertes et notifications {notificationCount > 0 && `(${notificationCount})`}
      </p>
    </div>
  );
}
