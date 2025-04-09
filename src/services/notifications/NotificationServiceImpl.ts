
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
  async withdrawalScheduled(amount: number): Promise<boolean> {
    const result = await this.withdrawalService.withdrawalScheduled(amount);
    return result;
  }

  async withdrawalValidated(amount: number): Promise<boolean> {
    const result = await this.withdrawalService.withdrawalValidated(amount);
    return result;
  }

  async withdrawalCompleted(amount: number): Promise<boolean> {
    const result = await this.withdrawalService.withdrawalCompleted(amount);
    if (result) toast.success(`Retrait de ${amount}€ complété`);
    return result;
  }

  async withdrawalRejected(amount: number): Promise<boolean> {
    const result = await this.withdrawalService.withdrawalRejected(amount);
    if (result) toast.error(`Retrait de ${amount}€ rejeté`);
    return result;
  }

  async withdrawalReceived(amount: number): Promise<boolean> {
    const result = await this.withdrawalService.withdrawalReceived(amount);
    return result;
  }

  async withdrawalConfirmed(amount: number): Promise<boolean> {
    const result = await this.withdrawalService.withdrawalConfirmed(amount);
    return result;
  }

  async withdrawalPaid(amount: number): Promise<boolean> {
    const result = await this.withdrawalService.withdrawalPaid(amount);
    if (result) toast.success(`Retrait de ${amount}€ payé`);
    return result;
  }

  // Investment methods delegated to investment service
  async investmentConfirmed(projectName: string, amount: number): Promise<boolean> {
    const result = await this.investmentService.investmentConfirmed(projectName, amount);
    if (result) toast.success(`Investissement de ${amount}€ confirmé`);
    return result;
  }

  // Implementing other required methods from interface
  async depositReceived(amount: number, reference?: string): Promise<boolean> {
    // This will be implemented later with a proper deposit service
    return this.createNotification({
      title: 'Dépôt reçu',
      description: `Votre dépôt de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été reçu.`,
      type: 'deposit',
      category: NotificationCategories.info
    });
  }

  async yieldPaid(projectName: string, amount: number): Promise<boolean> {
    return this.createNotification({
      title: 'Rendement payé',
      description: `Un rendement de ${amount}€ pour le projet "${projectName}" a été payé.`,
      type: 'yield',
      category: NotificationCategories.success
    });
  }

  async newMessage(sender: string, messagePreview: string): Promise<boolean> {
    return this.createNotification({
      title: 'Nouveau message',
      description: `${sender}: ${messagePreview}`,
      type: 'message',
      category: NotificationCategories.info
    });
  }

  async projectUpdated(projectName: string, updateType: string): Promise<boolean> {
    return this.createNotification({
      title: 'Projet mis à jour',
      description: `Le projet "${projectName}" a été mis à jour: ${updateType}`,
      type: 'project-update',
      category: NotificationCategories.info
    });
  }

  async newInvestmentOpportunity(projectName: string, projectId?: string): Promise<boolean> {
    return this.createNotification({
      title: 'Nouvelle opportunité d\'investissement',
      description: `Découvrez le projet "${projectName}"`,
      type: 'investment-opportunity',
      category: NotificationCategories.info,
      metadata: { projectId }
    });
  }
}
