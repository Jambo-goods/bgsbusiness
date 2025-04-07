
export interface UserSettings {
  theme: string;
  language: string;
  interface: {
    sidebarCollapsed: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
  };
  notifications: {
    email: boolean;
    app: boolean;
    marketing: boolean;
  };
}

export const defaultSettings: UserSettings = {
  theme: "light",
  language: "fr",
  interface: {
    sidebarCollapsed: false
  },
  security: {
    twoFactorEnabled: false
  },
  notifications: {
    email: true,
    app: true,
    marketing: false
  }
};
