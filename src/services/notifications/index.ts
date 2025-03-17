
import { BaseNotificationService } from "./BaseNotificationService";
import { DepositNotificationService } from "./DepositNotificationService";
import { InvestmentNotificationService } from "./InvestmentNotificationService";
import { MarketingNotificationService } from "./MarketingNotificationService";
import { SecurityNotificationService } from "./SecurityNotificationService";
import { WithdrawalNotificationService } from "./WithdrawalNotificationService";
import { Notification, NotificationType, NotificationCategory, NotificationCategories } from "./types";

class NotificationService {
  private baseNotificationService: BaseNotificationService;
  private depositNotificationService: DepositNotificationService;
  private investmentNotificationService: InvestmentNotificationService;
  private marketingNotificationService: MarketingNotificationService;
  private securityNotificationService: SecurityNotificationService;
  private withdrawalNotificationService: WithdrawalNotificationService;

  constructor() {
    this.baseNotificationService = new BaseNotificationService();
    this.depositNotificationService = new DepositNotificationService();
    this.investmentNotificationService = new InvestmentNotificationService();
    this.marketingNotificationService = new MarketingNotificationService();
    this.securityNotificationService = new SecurityNotificationService();
    this.withdrawalNotificationService = new WithdrawalNotificationService();
  }

  // Base notification methods
  async createNotification(props) {
    return this.baseNotificationService.createNotification(props);
  }

  async markAsRead(notificationId: string) {
    return this.baseNotificationService.markAsRead(notificationId);
  }

  async deleteNotification(notificationId: string) {
    return this.baseNotificationService.deleteNotification(notificationId);
  }
  
  async getNotifications() {
    return this.baseNotificationService.getNotifications();
  }
  
  async getUnreadCount() {
    return this.baseNotificationService.getUnreadCount();
  }
  
  async markAllAsRead() {
    return this.baseNotificationService.markAllAsRead();
  }
  
  async setupRealtimeSubscription(callback: () => void) {
    return this.baseNotificationService.setupRealtimeSubscription(callback);
  }

  // Deposit notification methods
  async depositRequested(amount: number, reference: string) {
    return this.depositNotificationService.depositRequested(amount, reference);
  }

  async depositConfirmed(amount: number) {
    return this.depositNotificationService.depositConfirmed(amount);
  }

  async depositRejected(amount: number, reason: string) {
    return this.depositNotificationService.depositRejected(amount, reason);
  }
  
  async depositSuccess(amount: number) {
    return this.depositNotificationService.depositSuccess(amount);
  }
  
  async insufficientFunds(amount: number) {
    return this.depositNotificationService.insufficientFunds(amount);
  }

  // Investment notification methods
  async investmentConfirmed(projectName: string, amount: number) {
    return this.investmentNotificationService.investmentConfirmed(projectName, amount);
  }

  async investmentReceived(projectName: string, amount: number) {
    return this.investmentNotificationService.investmentReceived(projectName, amount);
  }

  async projectUpdate(projectName: string, updateType: string, details: string) {
    return this.investmentNotificationService.projectUpdate(projectName, updateType, details);
  }

  async yieldPaid(projectName: string, amount: number, date: string) {
    return this.investmentNotificationService.yieldPaid(projectName, amount, date);
  }

  async investmentMatured(projectName: string, amount: number) {
    return this.investmentNotificationService.investmentMatured(projectName, amount);
  }
  
  async newInvestmentOpportunity(projectName: string) {
    return this.investmentNotificationService.newInvestmentOpportunity(projectName);
  }
  
  async projectCompleted(projectName: string, projectId: string) {
    return this.investmentNotificationService.projectCompleted(projectName, projectId);
  }
  
  async profitReceived(amount: number, projectName: string, projectId: string) {
    return this.investmentNotificationService.profitReceived(amount, projectName, projectId);
  }

  // Security notification methods
  async passwordChanged() {
    return this.securityNotificationService.passwordChanged();
  }

  async loginAttemptDetected(device: string, location: string, timestamp: string, success: boolean) {
    return this.securityNotificationService.loginAttemptDetected(device, location, timestamp, success);
  }

  async securityAlert(type: string, details: string) {
    return this.securityNotificationService.securityAlert(type, details);
  }

  // Withdrawal notification methods
  async withdrawalRequested(amount: number) {
    return this.withdrawalNotificationService.withdrawalRequested(amount);
  }

  async withdrawalPending(amount: number) {
    return this.withdrawalNotificationService.withdrawalPending(amount);
  }

  async withdrawalProcessed(amount: number) {
    return this.withdrawalNotificationService.withdrawalProcessed(amount);
  }

  async withdrawalRejected(amount: number, reason: string) {
    return this.withdrawalNotificationService.withdrawalRejected(amount, reason);
  }
  
  async withdrawalScheduled(amount: number) {
    return this.withdrawalNotificationService.withdrawalScheduled(amount);
  }
  
  async withdrawalValidated(amount: number) {
    return this.withdrawalNotificationService.withdrawalValidated(amount);
  }
  
  async withdrawalCompleted(amount: number) {
    return this.withdrawalNotificationService.withdrawalCompleted(amount);
  }
  
  async withdrawalReceived(amount: number) {
    return this.withdrawalNotificationService.withdrawalReceived(amount);
  }
  
  async withdrawalConfirmed(amount: number) {
    return this.withdrawalNotificationService.withdrawalConfirmed(amount);
  }
  
  async withdrawalPaid(amount: number) {
    return this.withdrawalNotificationService.withdrawalPaid(amount);
  }

  // Marketing notification methods
  async eventInvitation(eventName: string, date: string) {
    return this.marketingNotificationService.eventInvitation(eventName, date);
  }

  async specialOffer(percentage: number, endDate: string) {
    return this.marketingNotificationService.specialOffer(percentage, endDate);
  }
}

export const notificationService = new NotificationService();
export { Notification, NotificationType, NotificationCategory, NotificationCategories };
