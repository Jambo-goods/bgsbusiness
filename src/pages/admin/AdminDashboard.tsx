
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import StatusIndicator from "@/components/admin/dashboard/StatusIndicator";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import AdminLogsList from "@/components/admin/dashboard/AdminLogsList";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import { useAdminUsers } from "@/contexts/AdminUsersContext";
import ProfilesTable from "@/components/admin/users/ProfilesTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
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

  // Système toujours opérationnel par défaut, à adapter selon les besoins
  const systemStatus = 'operational';

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
          systemStatus={systemStatus as 'operational' | 'degraded' | 'maintenance'}
          isRefreshing={isRefreshing}
          onRefresh={refreshData}
        />
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500">Utilisateurs totaux</span>
            <span className="text-2xl font-bold">{stats.userCount}</span>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500">Utilisateurs en ligne</span>
            <span className="text-2xl font-bold">{onlineUserCount}</span>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500">Investissements totaux</span>
            <span className="text-2xl font-bold">{stats.totalInvestments.toLocaleString()} €</span>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500">Retraits en attente</span>
            <span className="text-2xl font-bold">{stats.pendingWithdrawals}</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-bgs-blue">
              Utilisateurs enregistrés
            </h2>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button 
                onClick={() => refreshProfiles()}
                variant="outline"
              >
                Actualiser
              </Button>
            </div>
          </div>
          
          <ProfilesTable 
            profiles={profiles} 
            filteredProfiles={filteredProfiles} 
            isLoading={isLoadingProfiles} 
            searchTerm={searchTerm}
            onAddFunds={handleAddFunds}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-bgs-blue mb-4">
              Actions récentes
            </h2>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="py-3">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <AdminLogsList adminLogs={adminLogs} />
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-bgs-blue mb-4">
              Actions rapides
            </h2>
            <QuickActions />
          </div>
        </div>
      </div>

      {/* Dialog for adding funds to a user */}
      <Dialog open={isAddFundsDialogOpen} onOpenChange={setIsAddFundsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter des fonds au portefeuille</DialogTitle>
            <DialogDescription>
              {selectedUser ? (
                <>Ajouter des fonds au portefeuille de {selectedUser.first_name} {selectedUser.last_name}</>
              ) : (
                <>Ajouter des fonds au portefeuille de l'utilisateur</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant (€)
              </Label>
              <Input
                id="amount"
                type="number"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
                className="col-span-3"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddFundsDialogOpen(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmAddFunds} 
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Traitement en cours...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
