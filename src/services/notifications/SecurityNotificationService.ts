
import { BaseNotificationService } from "./BaseNotificationService";

export class SecurityNotificationService extends BaseNotificationService {
  passwordChanged(): Promise<void> {
    return this.createNotification({
      title: "Mot de passe modifié",
      description: "Votre mot de passe a été modifié avec succès.",
      type: 'security',
      category: 'success'
    });
  }
  
  loginAttemptDetected(device: string, location: string, timestamp: string, success: boolean): Promise<void> {
    return this.createNotification({
      title: success ? "Connexion réussie" : "Tentative de connexion",
      description: `${success ? 'Connexion' : 'Tentative de connexion'} détectée depuis ${device} à ${location} le ${timestamp}.`,
      type: 'security',
      category: success ? 'info' : 'warning',
      metadata: { device, location, timestamp, success }
    });
  }
  
  securityAlert(type: string, details: string): Promise<void> {
    return this.createNotification({
      title: "Alerte de sécurité",
      description: `${type}: ${details}`,
      type: 'security',
      category: 'warning',
      metadata: { type, details }
    });
  }

  successfulLogin(): Promise<void> {
    return this.createNotification({
      title: "Connexion réussie",
      description: "Vous vous êtes connecté avec succès à votre compte.",
      type: 'security',
      category: 'success'
    });
  }

  accountLocked(): Promise<void> {
    return this.createNotification({
      title: "Compte verrouillé",
      description: "Votre compte a été temporairement verrouillé suite à plusieurs tentatives de connexion échouées.",
      type: 'security',
      category: 'warning'
    });
  }

  deviceChange(): Promise<void> {
    return this.createNotification({
      title: "Nouvel appareil détecté",
      description: "Une connexion a été détectée depuis un nouvel appareil.",
      type: 'security',
      category: 'warning'
    });
  }

  emailChanged(): Promise<void> {
    return this.createNotification({
      title: "Adresse e-mail modifiée",
      description: "Votre adresse e-mail a été modifiée avec succès.",
      type: 'security',
      category: 'success'
    });
  }
}
