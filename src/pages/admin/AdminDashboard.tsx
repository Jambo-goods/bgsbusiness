
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { CreditCard, Users, Database, TrendingUp, ArrowLeftRight } from 'lucide-react';

export default function AdminDashboard() {
  const { adminUser } = useAdmin();
  const [stats, setStats] = useState({
    userCount: 0,
    totalInvestments: 0,
    totalProjects: 0,
    pendingWithdrawals: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (userError) throw userError;
        
        // Fetch total investment amount
        const { data: investmentData, error: investmentError } = await supabase
          .from('investments')
          .select('amount')
          .eq('status', 'active');
          
        if (investmentError) throw investmentError;
        
        const totalInvestments = investmentData.reduce((sum, item) => sum + item.amount, 0);
        
        // Fetch project count
        const { count: projectCount, error: projectError } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });
          
        if (projectError) throw projectError;
        
        // Fetch pending withdrawals
        const { count: pendingWithdrawals, error: withdrawalError } = await supabase
          .from('withdrawal_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        if (withdrawalError) throw withdrawalError;
        
        setStats({
          userCount: userCount || 0,
          totalInvestments: totalInvestments,
          totalProjects: projectCount || 0,
          pendingWithdrawals: pendingWithdrawals || 0
        });
        
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);

  // Last login info
  const lastLogin = adminUser?.last_login 
    ? new Date(adminUser.last_login).toLocaleString('fr-FR')
    : 'Première connexion';

  return (
    <div>
      <h1 className="text-2xl font-semibold text-bgs-blue mb-6">Tableau de bord administrateur</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <p className="text-gray-500">
          Bienvenue, <span className="font-medium text-bgs-blue">{adminUser?.first_name} {adminUser?.last_name}</span>.
          Dernière connexion: {lastLogin}
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-bgs-blue" />
              </div>
              <h3 className="text-lg text-gray-700">Utilisateurs</h3>
            </div>
            <p className="text-3xl font-bold text-bgs-blue">{stats.userCount}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg text-gray-700">Investissements</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.totalInvestments.toLocaleString()} €</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg text-gray-700">Projets</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.totalProjects}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <ArrowLeftRight className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg text-gray-700">Retraits en attente</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.pendingWithdrawals}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-bgs-blue mb-4">Dernières actions</h2>
          {/* Admin logs would go here */}
          <p className="text-gray-500 text-center py-4">Aucune action récente</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-bgs-blue mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              <Users className="h-8 w-8 mx-auto mb-2 text-bgs-blue" />
              <span className="font-medium text-bgs-blue">Gérer les utilisateurs</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/admin/projects'}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              <Database className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <span className="font-medium text-bgs-blue">Gérer les projets</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/admin/wallets'}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <span className="font-medium text-bgs-blue">Gérer les portefeuilles</span>
            </button>
            
            <button 
              onClick={() => window.location.href = '/admin/withdrawals'}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <span className="font-medium text-bgs-blue">Gérer les retraits</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
