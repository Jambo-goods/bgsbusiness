
import React, { useState } from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  link?: string;
};

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Rendement mis à jour',
      message: 'Le rendement de BGS Wood Africa a augmenté à 15%',
      time: 'Il y a 2 heures',
      type: 'success',
      read: false,
      link: '/project/1'
    },
    {
      id: '2',
      title: 'Nouveau projet disponible',
      message: 'BGS Energy est maintenant ouvert aux investissements',
      time: 'Il y a 1 jour',
      type: 'info',
      read: false,
      link: '/project/2'
    },
    {
      id: '3',
      title: 'Paiement de rendement reçu',
      message: 'Vous avez reçu un paiement de 125€ de rendement',
      time: 'Il y a 3 jours',
      type: 'success',
      read: true,
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(
      notifications.filter(notification => notification.id !== id)
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationBgColor = (type: 'info' | 'success' | 'warning', read: boolean) => {
    if (read) return 'bg-gray-50';
    
    switch (type) {
      case 'info': return 'bg-blue-50';
      case 'success': return 'bg-green-50';
      case 'warning': return 'bg-amber-50';
      default: return 'bg-gray-50';
    }
  };

  const getNotificationTextColor = (type: 'info' | 'success' | 'warning') => {
    switch (type) {
      case 'info': return 'text-blue-700';
      case 'success': return 'text-green-700';
      case 'warning': return 'text-amber-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-medium text-bgs-blue flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-bgs-gray-medium"
            onClick={markAllAsRead}
          >
            Tout marquer comme lu
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-bgs-gray-medium"
            onClick={clearAllNotifications}
          >
            Effacer tout
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center p-4 text-bgs-gray-medium">
          Aucune notification
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-3 rounded-lg flex justify-between ${getNotificationBgColor(notification.type, notification.read)} ${notification.read ? 'opacity-70' : 'opacity-100'}`}
            >
              <div>
                <h3 className={`text-sm font-medium ${getNotificationTextColor(notification.type)}`}>
                  {notification.title}
                </h3>
                <p className="text-xs text-bgs-gray-medium mt-1">
                  {notification.message}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-bgs-gray-medium">
                    {notification.time}
                  </span>
                  
                  {notification.link && (
                    <a 
                      href={notification.link} 
                      className="text-xs flex items-center text-bgs-blue hover:text-bgs-blue-light ml-2"
                    >
                      <span>Voir</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <span className="sr-only">Marquer comme lu</span>
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 rounded-full"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <span className="sr-only">Rejeter</span>
                  <X className="h-3 w-3 text-bgs-gray-medium" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
