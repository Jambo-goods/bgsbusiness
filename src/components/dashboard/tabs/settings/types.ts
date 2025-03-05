
export type UserSettings = {
  language: string;
  theme: string;
  sidebarCollapsed: boolean;
  notifications: {
    email: boolean;
    app: boolean;
    marketing: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
  }
};

// Default settings values
export const defaultSettings: UserSettings = {
  language: "fr",
  theme: "light",
  sidebarCollapsed: false,
  notifications: {
    email: true,
    app: true,
    marketing: false
  },
  security: {
    twoFactorEnabled: false
  }
};
