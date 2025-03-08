
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import StatusIndicator from "@/components/admin/dashboard/StatusIndicator";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import { useAdminUsers } from "@/contexts/AdminUsersContext";
import UsersSection from "@/components/admin/dashboard/UsersSection";
import ActivitySection from "@/components/admin/dashboard/ActivitySection";
import AddFundsDialog from "@/components/admin/dashboard/AddFundsDialog";

export default function AdminDashboard() {
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [amountToAdd, setAmountToAdd] = useState<string>("100");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    stats, 
    adminLogs, 
    isLoading, 
    isRefreshing, 
    refreshData 
  } = useAdminDashboard();

  const {
    profiles,
    filteredProfiles,
    isLoading: isLoadingProfiles,
    searchTerm,
    setSearchTerm,
    refreshProfiles,
    onlineUserCount,
    addFundsToUser
  } = useAdminUsers();

  const handleAddFunds = (userId: string) => {
    setSelectedUserId(userId);
    setIsAddFundsDialogOpen(true);
  };

  const handleConfirmAddFunds = async () => {
    if (!selectedUserId) return;
    
    try {
      setIsProcessing(true);
      const amount = parseInt(amountToAdd, 10);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Le montant doit être un nombre positif');
      }
      
      const success = await addFundsToUser(selectedUserId, amount);
      
      if (success) {
        setIsAddFundsDialogOpen(false);
        setAmountToAdd("100");
      }
    } catch (error) {
      console.error('Error processing funds:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedUser = selectedUserId ? profiles.find(p => p.id === selectedUserId) : null;
  
  // Mettre à jour les statistiques pour inclure les utilisateurs en ligne
  const statsWithOnlineUsers = {
    ...stats,
    onlineUserCount
  };

  return (
    <div className="p-6">
      <Helmet>
        <title>Tableau de bord d'administration | BGS</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold text-bgs-blue mb-4 md:mb-0">
          Tableau de bord d'administration
        </h1>
        
        <StatusIndicator 
          systemStatus="operational"
          isRefreshing={isRefreshing}
          onRefresh={refreshData}
        />
      </div>
      
      <div className="space-y-6">
        <DashboardStats stats={statsWithOnlineUsers} isLoading={isLoading} />
        
        <UsersSection 
          profiles={profiles}
          filteredProfiles={filteredProfiles}
          isLoading={isLoadingProfiles}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          refreshProfiles={refreshProfiles}
          onAddFunds={handleAddFunds}
        />
        
        <ActivitySection 
          adminLogs={adminLogs}
          isLoading={isLoading}
        />
      </div>

      <AddFundsDialog 
        isOpen={isAddFundsDialogOpen}
        setIsOpen={setIsAddFundsDialogOpen}
        selectedUser={selectedUser}
        amountToAdd={amountToAdd}
        setAmountToAdd={setAmountToAdd}
        isProcessing={isProcessing}
        onConfirm={handleConfirmAddFunds}
      />
    </div>
  );
}
