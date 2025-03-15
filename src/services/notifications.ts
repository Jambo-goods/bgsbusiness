
// Empty notification service that does nothing
// This is kept as a compatibility layer after removing the notifications table

export const notificationService = {
  // Empty methods that maintain the API but do nothing
  depositSuccess: (amount: number) => {
    console.log('Notification service disabled - deposit success:', amount);
    return Promise.resolve();
  },
  
  withdrawalRequested: (amount: number) => {
    console.log('Notification service disabled - withdrawal requested:', amount);
    return Promise.resolve();
  },
  
  investmentConfirmed: (projectName: string, amount: number) => {
    console.log('Notification service disabled - investment confirmed:', projectName, amount);
    return Promise.resolve();
  },
  
  // Add any other methods that were being called
  createNotification: () => Promise.resolve(),
  markAsRead: () => Promise.resolve(),
  markAllAsRead: () => Promise.resolve(),
  deleteNotification: () => Promise.resolve(),
  getNotifications: () => Promise.resolve([])
};
