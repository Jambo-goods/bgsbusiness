
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import { useAdminUsers } from "@/contexts/AdminUsersContext";
import StatusIndicator from "@/components/admin/dashboard/StatusIndicator";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import AdminLogsList from "@/components/admin/dashboard/AdminLogsList";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import ProfilesTable from "@/components/admin/users/ProfilesTable";
import SearchBar from "@/components/admin/users/SearchBar";
import { Button } from "@/components/ui/button";
import { Users, RefreshCcw } from "lucide-react";

export default function AdminDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    stats, 
    adminLogs, 
    isLoading: statsLoading, 
    refreshData 
  } = useAdminDashboard();

  const {
    filteredProfiles,
    isLoading: profilesLoading,
    searchTerm,
    setSearchTerm,
    totalProfiles,
    refreshProfiles,
    totalWalletBalance
  } = useAdminUsers();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshData(), refreshProfiles()]);
    setIsRefreshing(false);
  };

  // Add wallet balance to stats
  const enhancedStats = {
    ...stats,
    userCount: totalProfiles,
    totalWalletBalance: totalWalletBalance || 0
  };

  return (
    <div className="p-6">
      <Helmet>
        <title>Tableau de bord administrateur | BGS Business Club</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold text-bgs-blue mb-4 md:mb-0">
          Tableau de bord d'administration
        </h1>
        
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isRefreshing}
        >
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser les données
        </Button>
      </div>
      
      <div className="space-y-6">
        <DashboardStats stats={enhancedStats} isLoading={statsLoading} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-bgs-blue mb-4">
              Actions récentes
            </h2>
            {statsLoading ? (
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

        {/* Users Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-bgs-blue">Utilisateurs</h2>
              <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                <Users className="h-3 w-3" />
                {totalProfiles} utilisateurs
              </div>
            </div>
            <Button 
              onClick={refreshProfiles}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              Actualiser la liste
            </Button>
          </div>

          <div className="mb-4">
            <SearchBar 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              placeholder="Rechercher par nom, prénom ou email..."
            />
          </div>

          <div className="overflow-x-auto">
            <ProfilesTable 
              profiles={[]}
              filteredProfiles={filteredProfiles.slice(0, 5)} 
              isLoading={profilesLoading}
              searchTerm={searchTerm}
              showAdminControls={true}
            />
          </div>

          {filteredProfiles.length > 5 && (
            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                onClick={() => window.location.href = '/admin/profiles'}
              >
                Voir tous les utilisateurs
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
