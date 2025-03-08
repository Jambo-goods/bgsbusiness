
import React from "react";
import { Bell } from "lucide-react";

interface EmptyNotificationsProps {
  filter?: 'all' | 'unread';
}

export default function EmptyNotifications({ filter }: EmptyNotificationsProps = {}) {
  const message = filter === 'unread' 
    ? "Aucune notification non lue"
    : "Aucune notification";
    
  return (
    <div className="py-8 text-center text-sm text-gray-500">
      <Bell className="h-5 w-5 mx-auto text-gray-400 mb-2" />
      {message}
    </div>
  );
}
