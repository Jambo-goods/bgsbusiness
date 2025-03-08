
import React from "react";

interface NotificationHeaderProps {
  unreadCount: number;
}

export default function NotificationHeader({ unreadCount }: NotificationHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-medium text-bgs-blue">Notifications</h3>
      {unreadCount > 0 && (
        <span className="text-xs bg-bgs-orange/10 text-bgs-orange px-2 py-0.5 rounded-full font-medium">
          {unreadCount} {unreadCount === 1 ? 'nouvelle' : 'nouvelles'}
        </span>
      )}
    </div>
  );
}
