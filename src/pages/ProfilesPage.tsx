
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  projects_count?: number;
  investment_total?: number;
  wallet_balance?: number;
}

export default function ProfilesPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        setProfile(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [id]);
  
  return (
    <div className="container mx-auto py-12">
      {loading ? (
        <div>Loading...</div>
      ) : profile ? (
        <div>
          <h1 className="text-3xl font-bold">
            {profile.first_name} {profile.last_name}
          </h1>
          <p>Email: {profile.email}</p>
          <p>Phone: {profile.phone}</p>
          <p>Address: {profile.address}</p>
          <p>Investments: {profile.investment_total}</p>
          <p>Projects: {profile.projects_count}</p>
        </div>
      ) : (
        <div>Profile not found</div>
      )}
    </div>
  );
}
