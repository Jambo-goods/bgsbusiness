
import React from 'react';
import { Outlet } from 'react-router-dom';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col">
        {/* Header could go here */}
        
        {/* Main content area */}
        <main className="flex-1 p-4">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
