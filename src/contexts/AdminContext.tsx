
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, getCurrentAdmin } from '@/services/adminAuthService';

interface AdminContextType {
  adminUser: AdminUser | null;
  setAdminUser: React.Dispatch<React.SetStateAction<AdminUser | null>>;
  isAdminLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    // Check if we have an admin user in localStorage on mount
    const admin = getCurrentAdmin();
    setAdminUser(admin);
    setIsAdminLoading(false);
  }, []);

  return (
    <AdminContext.Provider value={{ adminUser, setAdminUser, isAdminLoading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
