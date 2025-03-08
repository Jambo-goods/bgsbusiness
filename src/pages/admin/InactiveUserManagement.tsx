
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, RefreshCw, UserX, Clock } from 'lucide-react';
import { toast } from 'sonner';
import StatusIndicator from '@/components/admin/dashboard/StatusIndicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wallet_balance: number | null;
  projects_count: number | null;
  investment_total: number | null;
  created_at: string | null;
  last_active_at?: string | null;
  inactive_days?: number | null;
};

export default function InactiveUserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realTimeStatus, setRealTimeStatus] = useState<'connected' | 'connecting' | 'error'>('connected');
  const [totalInactiveProfiles, setTotalInactiveProfiles] = useState(0);
  
  // Define inactive threshold as 30 days
  const INACTIVE_THRESHOLD_DAYS = 30;

  useEffect(() => {
    fetchInactiveProfiles();
  }, []);

  const fetchInactiveProfiles = async () => {
    try {
      setIsLoading(true);
      
      // Get all profiles
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Get today's date for inactive calculation
      const today = new Date();
      
      // Process profiles to calculate inactivity
      const processedProfiles: Profile[] = data?.map(profile => {
        const createdAt = profile.created_at ? new Date(profile.created_at) : null;
        const daysSinceCreation = createdAt ? Math.floor((today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        return {
          ...profile,
          inactive_days: daysSinceCreation,
        };
      }) || [];
      
      // Filter for inactive users (no activity in last 30 days)
      const inactiveProfiles = processedProfiles.filter(profile => 
        profile.inactive_days && profile.inactive_days >= INACTIVE_THRESHOLD_DAYS
      );
      
      setProfiles(inactiveProfiles);
      setTotalInactiveProfiles(inactiveProfiles.length);
      toast.success('Utilisateurs inactifs chargés avec succès');
    } catch (error) {
      console.error('Error fetching inactive profiles:', error);
      toast.error('Erreur lors du chargement des profils inactifs');
      setRealTimeStatus('error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInactiveProfiles();
  };

  const getInactivitySeverity = (days: number | null | undefined) => {
    if (!days) return 'default';
    if (days >= 90) return 'destructive';
    if (days >= 60) return 'secondary';
    return 'default';
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (profile.first_name && profile.first_name.toLowerCase().includes(searchLower)) ||
      (profile.last_name && profile.last_name.toLowerCase().includes(searchLower)) ||
      (profile.email && profile.email.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Utilisateurs Inactifs</h1>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
            {totalInactiveProfiles} utilisateurs
          </span>
        </div>
        
        <div className="flex gap-3">
          <StatusIndicator 
            realTimeStatus={realTimeStatus} 
            isRefreshing={isRefreshing} 
            onRefresh={handleRefresh} 
          />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Rechercher par nom, prénom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-md shadow">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex space-x-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prénom</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Portefeuille</TableHead>
                <TableHead>Projets</TableHead>
                <TableHead>Total investi</TableHead>
                <TableHead>Jours d'inactivité</TableHead>
                <TableHead>Date d'inscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    {searchTerm ? "Aucun profil inactif trouvé pour cette recherche" : "Aucun profil inactif disponible"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.first_name || '-'}</TableCell>
                    <TableCell>{profile.last_name || '-'}</TableCell>
                    <TableCell>{profile.email || '-'}</TableCell>
                    <TableCell>{profile.phone || '-'}</TableCell>
                    <TableCell>{profile.wallet_balance ? `${profile.wallet_balance} €` : '0 €'}</TableCell>
                    <TableCell>{profile.projects_count || 0}</TableCell>
                    <TableCell>{profile.investment_total ? `${profile.investment_total} €` : '0 €'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getInactivitySeverity(profile.inactive_days) as "default" | "secondary" | "destructive"}
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        <span>{profile.inactive_days || 0} jours</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
