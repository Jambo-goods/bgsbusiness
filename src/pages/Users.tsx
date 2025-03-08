
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, RefreshCw } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import UserStatusBadge from '@/components/admin/users/UserStatusBadge';
import { calculateInactivityTime } from '@/utils/inactivityCalculator';
import { useProfilesRealTimeSubscription } from '@/hooks/useProfilesRealTimeSubscription';
import { Badge } from '@/components/ui/badge';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string | null;
  last_active_at?: string | null;
  projects_count?: number | null;
  investment_total?: number | null;
  account_status?: 'active' | 'inactive' | 'suspended';
};

export default function Users() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching profiles:', error);
        setError('Impossible de récupérer les données des utilisateurs');
        toast.error('Erreur de chargement', {
          description: 'Impossible de récupérer les données des utilisateurs'
        });
        return;
      }

      console.log(`Fetched ${data?.length || 0} user profiles from database`);
      setProfiles(data || []);
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
      setError('Une erreur est survenue lors du chargement des données');
      toast.error('Erreur de chargement', {
        description: 'Une erreur est survenue lors du chargement'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProfiles();
  }, [fetchProfiles]);

  // Initial data fetching
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Set up real-time subscriptions
  const { realTimeStatus } = useProfilesRealTimeSubscription(
    profiles,
    handleRefresh
  );

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile => {
    const searchString = searchTerm.toLowerCase();
    return (
      (profile.first_name?.toLowerCase().includes(searchString) || false) ||
      (profile.last_name?.toLowerCase().includes(searchString) || false) ||
      (profile.email?.toLowerCase().includes(searchString) || false)
    );
  });

  // Determine user status based on last activity
  const getUserStatus = (profile: Profile): 'active' | 'inactive' | 'suspended' => {
    if (!profile.last_active_at) return 'inactive';
    
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    return profile.last_active_at >= fifteenMinutesAgo ? 'active' : 'inactive';
  };

  return (
    <>
      <Helmet>
        <title>Utilisateurs de la plateforme | BGS Invest</title>
        <meta name="description" content="Liste des utilisateurs inscrits sur la plateforme BGS Invest" />
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bgs-blue mb-2">Utilisateurs de la plateforme</h1>
          <p className="text-gray-600">
            Découvrez la communauté d'investisseurs qui nous font confiance.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Search and refresh controls with real-time status */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Badge 
                variant={realTimeStatus === 'connected' ? 'success' : realTimeStatus === 'connecting' ? 'outline' : 'destructive'}
                className="hidden md:flex"
              >
                {realTimeStatus === 'connected' 
                  ? 'Synchronisation en temps réel active' 
                  : realTimeStatus === 'connecting' 
                    ? 'Connexion en cours...' 
                    : 'Erreur de connexion'}
              </Badge>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>

          {/* Mobile real-time status */}
          <div className="md:hidden mb-4">
            <Badge 
              variant={realTimeStatus === 'connected' ? 'success' : realTimeStatus === 'connecting' ? 'outline' : 'destructive'}
              className="w-full justify-center py-1"
            >
              {realTimeStatus === 'connected' 
                ? 'Synchronisation en temps réel active' 
                : realTimeStatus === 'connecting' 
                  ? 'Connexion en cours...' 
                  : 'Erreur de connexion'}
            </Badge>
          </div>

          {/* Users list */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg flex flex-wrap gap-4 animate-pulse">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? "Aucun utilisateur trouvé pour cette recherche" : "Aucun utilisateur dans la base de données"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nom</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date d'inscription</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Durée d'inactivité</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Projets</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Investissements</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm">
                        {profile.first_name && profile.last_name 
                          ? `${profile.first_name} ${profile.last_name}`
                          : 'Utilisateur anonyme'}
                      </td>
                      <td className="px-4 py-4 text-sm">{profile.email || '-'}</td>
                      <td className="px-4 py-4 text-sm">
                        {profile.created_at 
                          ? new Date(profile.created_at).toLocaleDateString('fr-FR') 
                          : '-'}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {calculateInactivityTime(profile.last_active_at, profile.created_at)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {profile.projects_count !== undefined && profile.projects_count !== null 
                          ? profile.projects_count 
                          : '0'}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {profile.investment_total !== undefined && profile.investment_total !== null 
                          ? `${profile.investment_total.toLocaleString()} €` 
                          : '0 €'}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <UserStatusBadge status={getUserStatus(profile)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
