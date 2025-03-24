
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Commission {
  id: string;
  amount: number;
  created_at: string;
  source: string;
  status: string;
  referral_id: string;
  referred_id: string;
  referredName?: string;
}

export function useReferralCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current authenticated user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }

        // Fetch referral commissions
        const { data: commissionsData, error: commissionsError } = await supabase
          .from('referral_commissions')
          .select('*')
          .eq('referrer_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (commissionsError) {
          throw commissionsError;
        }

        // Fetch referred users' names
        const referredIds = [...new Set(commissionsData?.map(c => c.referred_id) || [])];
        
        const referredProfiles: Record<string, { first_name?: string; last_name?: string }> = {};
        
        if (referredIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', referredIds);
            
          if (profilesData) {
            profilesData.forEach(profile => {
              referredProfiles[profile.id] = {
                first_name: profile.first_name,
                last_name: profile.last_name
              };
            });
          }
        }
        
        // Combine the data
        const enhancedCommissions = commissionsData?.map(commission => {
          const profile = referredProfiles[commission.referred_id];
          const referredName = profile ? 
            `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
            'Filleul';
            
          return {
            ...commission,
            referredName: referredName || 'Filleul'
          };
        }) || [];
        
        setCommissions(enhancedCommissions);
      } catch (err: any) {
        console.error('Error fetching referral commissions:', err);
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommissions();
    
    // Set up real-time subscription for new commissions
    const commissionsChannel = supabase
      .channel('referral_commissions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'referral_commissions' },
        () => {
          // Refresh data when changes occur
          fetchCommissions();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(commissionsChannel);
    };
  }, []);

  return { commissions, isLoading, error };
}
