
import { useState } from "react";
import { Bell, Settings, Trash2, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

// Mock notifications for demo purposes
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nouvel investissement disponible',
    description: 'Un nouveau projet d\'investissement est disponible sur la plateforme.',
    date: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
    read: false,
    type: 'info'
  },
  {
    id: '2',
    title: 'Rendement mis à jour',
    description: 'Le rendement de votre investissement dans "Projet Immobilier Paris" a été mis à jour.',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    type: 'success'
  },
  {
    id: '3',
    title: 'Paiement reçu',
    description: 'Vous avez reçu un paiement de 250€ sur votre portefeuille.',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    type: 'success'
  },
  {
    id: '4',
    title: 'Rappel de versement',
    description: 'N\'oubliez pas d\'effectuer votre versement mensuel pour le projet "Expansion Commerciale Lyon".',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    type: 'warning'
  },
  {
    id: '5',
    title: 'Mise à jour des conditions',
    description: 'Les conditions générales d\'utilisation ont été mises à jour. Veuillez les consulter.',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    read: true,
    type: 'info'
  }
];

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate a refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatNotificationDate = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-bgs-blue">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos alertes et notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotifications([])}
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Tout supprimer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
          <TabsTrigger 
            value="all" 
            onClick={() => setFilter('all')}
          >
            Toutes ({notifications.length})
          </TabsTrigger>
          <TabsTrigger 
            value="unread" 
            onClick={() => setFilter('unread')}
            disabled={unreadCount === 0}
          >
            Non lues ({unreadCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
        
        <TabsContent value="unread" className="mt-4">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderNotificationsList(notifications: Notification[]) {
    if (notifications.length === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Bell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Aucune notification</h3>
          <p className="text-gray-500 mt-1">
            Vous n'avez actuellement aucune notification {filter === 'unread' ? 'non lue' : ''}.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className={`p-4 rounded-lg border ${notification.read ? 'bg-white' : 'bg-blue-50 border-blue-100'} transition-colors`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className={`font-medium ${notification.read ? 'text-gray-900' : 'text-blue-800'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {formatNotificationDate(notification.date)}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-blue-700'}`}>
                  {notification.description}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!notification.read && (
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Marquer comme lu"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </Button>
                )}
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteNotification(notification.id)}
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
