
import { BaseNotificationService } from "./BaseNotificationService";

export class SecurityNotificationService extends BaseNotificationService {
  loginSuccess(device: string): Promise<void> {
    return this.createNotification({
      title: "Connexion réussie",
      description: `Connexion réussie depuis ${device}.`,
      type: 'security',
      category: 'info',
      metadata: { device }
    });
  }
  
  suspiciousLogin(device: string): Promise<void> {
    return this.createNotification({
      title: "Tentative de connexion suspecte",
      description: `Alerte : Nouvelle connexion suspecte sur votre compte depuis ${device}. Si ce n'est pas vous, changez votre mot de passe.`,
      type: 'security',
      category: 'warning',
      metadata: { device }
    });
  }
  
  passwordChanged(): Promise<void> {
    return this.createNotification({
      title: "Mot de passe changé",
      description: "Votre mot de passe a été modifié avec succès.",
      type: 'security',
      category: 'success'
    });
  }
}
