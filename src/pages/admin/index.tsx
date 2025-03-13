
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminIndex() {
  const navigate = useNavigate();
  const { adminUser, isAdminLoading } = useAdmin();

  useEffect(() => {
    if (!isAdminLoading) {
      if (adminUser) {
        navigate('/admin/dashboard');
      } else {
        navigate('/admin/login');
      }
    }
  }, [adminUser, isAdminLoading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bgs-blue"></div>
    </div>
  );
}
