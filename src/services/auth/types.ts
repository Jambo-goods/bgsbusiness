
export type UserCredentials = {
  email: string;
  password: string;
};

export type UserRegistrationData = UserCredentials & {
  firstName: string;
  lastName: string;
  referralCode?: string | null;
};

export type AuthResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: any;
};
