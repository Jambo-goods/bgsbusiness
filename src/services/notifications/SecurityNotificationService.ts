
import { BaseNotificationService } from "./BaseNotificationService";
import { NotificationCategories } from "./types";

export class SecurityNotificationService extends BaseNotificationService {
  async passwordChanged(): Promise<boolean> {
    return this.createNotification({
      title: "Mot de passe modifié",
      description: "Votre mot de passe a été modifié avec succès.",
      type: 'security',
      category: NotificationCategories.success
    });
  }
  
  async loginAttemptDetected(device: string, location: string, timestamp: string, success: boolean): Promise<boolean> {
    return this.createNotification({
      title: success ? "Connexion réussie" : "Tentative de connexion",
      description: `${success ? 'Connexion' : 'Tentative de connexion'} détectée depuis ${device} à ${location} le ${timestamp}.`,
      type: 'security',
      category: success ? NotificationCategories.info : NotificationCategories.warning,
      metadata: { device, location, timestamp, success }
    });
  }
  
  async securityAlert(type: string, details: string): Promise<boolean> {
    return this.createNotification({
      title: "Alerte de sécurité",
      description: `${type}: ${details}`,
      type: 'security',
      category: NotificationCategories.warning,
      metadata: { type, details }
    });
  }

  async successfulLogin(): Promise<boolean> {
    return this.createNotification({
      title: "Connexion réussie",
      description: "Vous vous êtes connecté avec succès à votre compte.",
      type: 'security',
      category: NotificationCategories.success
    });
  }

  async accountLocked(): Promise<boolean> {
    return this.createNotification({
      title: "Compte verrouillé",
      description: "Votre compte a été temporairement verrouillé suite à plusieurs tentatives de connexion échouées.",
      type: 'security',
      category: NotificationCategories.warning
    });
  }

  async deviceChange(): Promise<boolean> {
    return this.createNotification({
      title: "Nouvel appareil détecté",
      description: "Une connexion a été détectée depuis un nouvel appareil.",
      type: 'security',
      category: NotificationCategories.warning
    });
  }

  async emailChanged(): Promise<boolean> {
    return this.createNotification({
      title: "Adresse e-mail modifiée",
      description: "Votre adresse e-mail a été modifiée avec succès.",
      type: 'security',
      category: NotificationCategories.success
    });
  }
}
