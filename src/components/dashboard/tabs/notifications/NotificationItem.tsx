
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Bell, 
  Wallet, 
  Briefcase, 
  Shield, 
  Megaphone, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  Check,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notification } from "@/services/notifications";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: NotificationItemProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'withdrawal':
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'investment':
        return <Briefcase className="h-5 w-5 text-green-500" />;
      case 'security':
        return <Shield className="h-5 w-5 text-purple-500" />;
      case 'marketing':
        return <Megaphone className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: fr
    });
  };

  return (
    <Card 
      className={`p-4 ${notification.read ? 'bg-white' : 'bg-blue-50 shadow-md'} transition-all hover:shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {getTypeIcon(notification.type)}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <p className={`font-semibold ${notification.read ? 'text-gray-900' : 'text-blue-800'}`}>
              {notification.title}
            </p>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {formatDate(notification.date)}
            </span>
          </div>
          
          <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-blue-700'}`}>
            {notification.description}
          </p>
          
          {!notification.read && (
            <div className="mt-3 flex justify-end">
              <Button 
                onClick={() => onMarkAsRead(notification.id)} 
                variant="ghost" 
                size="sm"
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                <Check className="h-4 w-4 mr-1" />
                Marquer comme lu
              </Button>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(notification.id)}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50"
          aria-label="Supprimer la notification"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
