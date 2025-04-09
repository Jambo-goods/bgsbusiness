
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BaseNotificationService } from "./BaseNotificationService";
import { WithdrawalNotificationService } from "./WithdrawalNotificationService";
import { InvestmentNotificationService } from "./InvestmentNotificationService";
import { NotificationCategories } from "./types";

export class NotificationServiceImpl extends BaseNotificationService {
  private withdrawalService: WithdrawalNotificationService;
  private investmentService: InvestmentNotificationService;

  constructor() {
    super();
    this.withdrawalService = new WithdrawalNotificationService();
    this.investmentService = new InvestmentNotificationService();
  }

  // Withdrawal methods delegated to withdrawal service
  async withdrawalScheduled(amount: number): Promise<void> {
    await this.withdrawalService.withdrawalScheduled(amount);
  }

  async withdrawalValidated(amount: number): Promise<void> {
    await this.withdrawalService.withdrawalValidated(amount);
  }

  async withdrawalCompleted(amount: number): Promise<void> {
    await this.withdrawalService.withdrawalCompleted(amount);
    toast.success(`Retrait de ${amount}€ complété`);
  }

  async withdrawalRejected(amount: number): Promise<void> {
    await this.withdrawalService.withdrawalRejected(amount);
    toast.error(`Retrait de ${amount}€ rejeté`);
  }

  async withdrawalReceived(amount: number): Promise<void> {
    await this.withdrawalService.withdrawalReceived(amount);
  }

  async withdrawalConfirmed(amount: number): Promise<void> {
    await this.withdrawalService.withdrawalConfirmed(amount);
  }

  async withdrawalPaid(amount: number): Promise<void> {
    await this.withdrawalService.withdrawalPaid(amount);
    toast.success(`Retrait de ${amount}€ payé`);
  }

  // Investment methods delegated to investment service
  async investmentConfirmed(projectName: string, amount: number): Promise<void> {
    await this.investmentService.investmentConfirmed(projectName, amount);
    toast.success(`Investissement de ${amount}€ confirmé`);
  }
}
