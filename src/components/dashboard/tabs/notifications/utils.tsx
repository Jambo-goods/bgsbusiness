
import { Wallet, Briefcase, Shield, Megaphone, Bell, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { NotificationType, NotificationCategory } from "@/services/notifications";

export const getNotificationTypeIcon = (type: NotificationType) => {
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
      return <Bell className="h-5 w-5 text-blue-500" />;
  }
};

export const getNotificationCategoryIcon = (category?: NotificationCategory) => {
  switch (category) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'info':
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};
