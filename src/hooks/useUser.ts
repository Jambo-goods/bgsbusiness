
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          setUser(null);
          return;
        }
        
        // Get user profile to check if admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        // Check if user has admin role
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          isAdmin: adminData ? true : false
        });
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }
    
    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
