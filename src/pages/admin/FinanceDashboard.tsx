
import React from 'react';
import { Search, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusIndicator from '@/components/admin/dashboard/StatusIndicator';
import FinanceStats from '@/components/admin/finance/FinanceStats';
import ProfilesTab from '@/components/admin/finance/ProfilesTab';
import WithdrawalsTab from '@/components/admin/finance/WithdrawalsTab';
import TransactionsTab from '@/components/admin/finance/TransactionsTab';
import AddFundsDialog from '@/components/admin/finance/AddFundsDialog';
import { useFinanceDashboard } from '@/hooks/admin/useFinanceDashboard';

export default function FinanceDashboard() {
  const {
    activeTab,
    setActiveTab,
    isLoading,
    realTimeStatus,
    searchTerm,
    setSearchTerm,
    isRefreshing,
    isAddFundsDialogOpen,
    setIsAddFundsDialogOpen,
    isProcessing,
    totalProfiles,
    pendingWithdrawals,
    profiles,
    stats,
    transactions,
    filteredProfiles,
    filteredWithdrawals,
    fetchDashboardData,
    handleAddFundsToAll,
    handleApproveWithdrawal,
    handleRejectWithdrawal
  } = useFinanceDashboard();

  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tableau de Bord Financier</h1>
          <p className="text-slate-500">Gestion des finances et des transactions des utilisateurs</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsAddFundsDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <DollarSign className="mr-1 h-4 w-4" />
            Ajouter des fonds à tous
          </Button>
          <StatusIndicator 
            realTimeStatus={realTimeStatus} 
            isRefreshing={isRefreshing} 
            onRefresh={handleRefresh} 
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <FinanceStats 
        stats={stats} 
        pendingWithdrawals={pendingWithdrawals} 
        totalProfiles={totalProfiles} 
      />

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="profiles">Profils</TabsTrigger>
          <TabsTrigger value="withdrawals">Demandes de retrait</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-4">
          <ProfilesTab 
            isLoading={isLoading} 
            filteredProfiles={filteredProfiles} 
            searchTerm={searchTerm} 
          />
        </TabsContent>
        
        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-4">
          <WithdrawalsTab 
            isLoading={isLoading}
            filteredWithdrawals={filteredWithdrawals}
            profiles={profiles}
            handleApproveWithdrawal={handleApproveWithdrawal}
            handleRejectWithdrawal={handleRejectWithdrawal}
          />
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <TransactionsTab 
            isLoading={isLoading}
            transactions={transactions}
            profiles={profiles}
          />
        </TabsContent>
      </Tabs>

      {/* Add Funds Dialog */}
      <AddFundsDialog 
        isOpen={isAddFundsDialogOpen}
        setIsOpen={setIsAddFundsDialogOpen}
        isProcessing={isProcessing}
        totalProfiles={totalProfiles}
        handleAddFunds={handleAddFundsToAll}
      />
    </div>
  );
}
