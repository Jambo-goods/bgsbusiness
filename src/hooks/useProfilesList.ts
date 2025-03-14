
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ProfileData = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wallet_balance: number | null;
  projects_count: number | null;
  investment_total: number | null;
  created_at: string | null;
  last_active_at: string | null;
};

export function useProfilesList() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof ProfileData>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchProfiles();
  }, [sortField, sortDirection]);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching profiles...');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) {
        throw error;
      }

      console.log(`Fetched ${data?.length} profiles`);
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError('Erreur lors du chargement des profils');
      toast.error('Erreur lors du chargement des profils');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof ProfileData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (profile.first_name && profile.first_name.toLowerCase().includes(searchLower)) ||
      (profile.last_name && profile.last_name.toLowerCase().includes(searchLower)) ||
      (profile.email && profile.email.toLowerCase().includes(searchLower))
    );
  });

  return {
    profiles: filteredProfiles,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    refreshProfiles: fetchProfiles
  };
}
