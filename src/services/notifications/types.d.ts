
// Fix the TypeScript errors related to notification types
export interface NotificationData {
  [key: string]: any;
}

export interface DatabaseNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  data: NotificationData;
  seen: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  type: string;
  category: string;
  metadata: Record<string, any>;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export interface NotificationService {
  withdrawalPaid: (amount: number) => Promise<void>;
  withdrawalRejected: (amount: number) => Promise<void>;
  depositReceived: (amount: number, reference?: string) => Promise<void>;
  investmentConfirmed: (projectName: string, amount: number) => Promise<void>;
  yieldPaid: (projectName: string, amount: number) => Promise<void>;
  newMessage: (sender: string, messagePreview: string) => Promise<void>;
  projectUpdated: (projectName: string, updateType: string) => Promise<void>;
  newInvestmentOpportunity: (projectName: string) => Promise<void>;
}
