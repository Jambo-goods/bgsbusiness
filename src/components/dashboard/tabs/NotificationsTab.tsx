
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useNotifications } from "./notifications/useNotifications";
import { useNotificationActions } from "./notifications/useNotificationActions";
import NotificationHeader from "./notifications/NotificationHeader";
import NotificationActions from "./notifications/NotificationActions";
import NotificationTabs from "./notifications/NotificationTabs";
import NotificationsList from "./notifications/NotificationsList";
import LoadingState from "./notifications/LoadingState";
import ErrorState from "./notifications/ErrorState";

export default function NotificationsTab() {
  const {
    notifications,
    filter,
    setFilter,
    isRefreshing,
    isLoading,
    error,
    fetchNotifications,
    clearNotifications
  } = useNotifications();
  
  const {
    handleMarkAllAsRead,
    handleMarkAsRead,
    handleDeleteNotification,
    handleDeleteAll
  } = useNotificationActions();

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    console.log("Changing filter to:", newFilter);
    setFilter(newFilter);
  };

  // Wrapper for delete all to ensure UI is updated
  const handleDeleteAllWithUpdate = async () => {
    const success = await handleDeleteAll();
    if (success) {
      clearNotifications();
    }
    return success;
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchNotifications} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <NotificationHeader notificationCount={notifications.length} />
        <NotificationActions
          unreadCount={unreadCount}
          isRefreshing={isRefreshing}
          onRefresh={fetchNotifications}
          onMarkAllAsRead={handleMarkAllAsRead}
          totalCount={notifications.length}
          onDeleteAll={handleDeleteAllWithUpdate}
        />
      </div>

      <Tabs value={filter} className="w-full">
        <NotificationTabs 
          totalCount={notifications.length}
          unreadCount={unreadCount}
          filter={filter}
          onFilterChange={handleFilterChange}
        />
        
        <TabsContent value={filter} className="mt-4">
          <NotificationsList 
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDeleteNotification}
            filter={filter}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
