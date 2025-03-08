
import { BaseNotificationService } from "./BaseNotificationService";
import { DepositNotificationService } from "./DepositNotificationService";
import { WithdrawalNotificationService } from "./WithdrawalNotificationService";
import { InvestmentNotificationService } from "./InvestmentNotificationService";
import { SecurityNotificationService } from "./SecurityNotificationService";
import { MarketingNotificationService } from "./MarketingNotificationService";
import { Notification, NotificationCategory, NotificationType, NotificationCategories } from "./types";

// Create a composite notification service that combines all specialized services
class NotificationService extends BaseNotificationService {
  private depositService: DepositNotificationService;
  private withdrawalService: WithdrawalNotificationService;
  private investmentService: InvestmentNotificationService;
  private securityService: SecurityNotificationService;
  private marketingService: MarketingNotificationService;

  constructor() {
    super();
    this.depositService = new DepositNotificationService();
    this.withdrawalService = new WithdrawalNotificationService();
    this.investmentService = new InvestmentNotificationService();
    this.securityService = new SecurityNotificationService();
    this.marketingService = new MarketingNotificationService();
  }

  // Deposit Notifications
  depositSuccess(amount: number): Promise<void> {
    return this.depositService.depositSuccess(amount);
  }

  depositPending(amount: number): Promise<void> {
    return this.depositService.depositPending(amount);
  }

  insufficientFunds(): Promise<void> {
    return this.depositService.insufficientFunds();
  }

  // Withdrawal Notifications
  withdrawalValidated(amount: number): Promise<void> {
    return this.withdrawalService.withdrawalValidated(amount);
  }

  withdrawalCompleted(amount: number): Promise<void> {
    return this.withdrawalService.withdrawalCompleted(amount);
  }

  // Investment Notifications
  newInvestmentOpportunity(projectName: string, projectId: string): Promise<void> {
    return this.investmentService.newInvestmentOpportunity(projectName, projectId);
  }

  investmentConfirmed(amount: number, projectName: string, projectId: string): Promise<void> {
    return this.investmentService.investmentConfirmed(amount, projectName, projectId);
  }

  profitReceived(amount: number, projectName: string, projectId: string): Promise<void> {
    return this.investmentService.profitReceived(amount, projectName, projectId);
  }

  projectFunded(projectName: string, projectId: string): Promise<void> {
    return this.investmentService.projectFunded(projectName, projectId);
  }

  projectCompleted(projectName: string, projectId: string): Promise<void> {
    return this.investmentService.projectCompleted(projectName, projectId);
  }

  // Security Notifications
  loginSuccess(device: string): Promise<void> {
    return this.securityService.loginSuccess(device);
  }

  suspiciousLogin(device: string): Promise<void> {
    return this.securityService.suspiciousLogin(device);
  }

  passwordChanged(): Promise<void> {
    return this.securityService.passwordChanged();
  }

  // Marketing Notifications
  eventInvitation(eventName: string, date: string): Promise<void> {
    return this.marketingService.eventInvitation(eventName, date);
  }

  specialOffer(percentage: number, endDate: string): Promise<void> {
    return this.marketingService.specialOffer(percentage, endDate);
  }

  referralBonus(friendName: string, bonus: number): Promise<void> {
    return this.marketingService.referralBonus(friendName, bonus);
  }
}

// Export the singleton instance
export const notificationService = new NotificationService();

// Re-export types
export { 
  Notification, 
  NotificationCategory, 
  NotificationType, 
  NotificationCategories 
};
