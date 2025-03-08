
import React from "react";
import { Bell } from "lucide-react";

export default function EmptyNotifications() {
  return (
    <div className="py-8 text-center text-sm text-gray-500">
      <Bell className="h-5 w-5 mx-auto text-gray-400 mb-2" />
      Aucune notification
    </div>
  );
}
