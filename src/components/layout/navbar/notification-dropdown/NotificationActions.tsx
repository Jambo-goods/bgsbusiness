
import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationActionsProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export default function NotificationActions({ 
  unreadCount, 
  onMarkAllAsRead 
}: NotificationActionsProps) {
  if (unreadCount === 0) return null;
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="w-full mb-2 text-xs"
      onClick={onMarkAllAsRead}
    >
      <Check className="h-3 w-3 mr-1" /> Tout marquer comme lu
    </Button>
  );
}
