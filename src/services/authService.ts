
// This file is maintained for backward compatibility
// It re-exports all the auth services from the new structure

export { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  resetPassword,
  updatePassword
} from './auth';

export type { UserCredentials, UserRegistrationData, AuthResponse } from './auth';

