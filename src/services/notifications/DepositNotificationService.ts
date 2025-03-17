
import { notificationService } from "./index";

export class DepositNotificationService {
  depositRequested(amount: number, reference: string): Promise<void> {
    return notificationService.depositRequested(amount, reference);
  }
  
  depositConfirmed(amount: number): Promise<void> {
    return notificationService.depositConfirmed(amount);
  }
  
  depositRejected(amount: number, reason: string): Promise<void> {
    return notificationService.depositRejected(amount, reason);
  }
  
  depositSuccess(amount: number): Promise<void> {
    return notificationService.depositSuccess(amount);
  }
  
  insufficientFunds(amount: number): Promise<void> {
    return notificationService.insufficientFunds(amount);
  }
  
  createNotification(params: any = {}): Promise<void> {
    return notificationService.createNotification(params);
  }
}

export const depositNotificationService = new DepositNotificationService();
