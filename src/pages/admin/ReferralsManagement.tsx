
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ReferralsTable from '@/components/admin/referrals/ReferralsTable';
import ReferralsHeader from '@/components/admin/referrals/ReferralsHeader';
import { useReferrals } from '@/hooks/admin/useReferrals';

export default function ReferralsManagement() {
  const { 
    referrals, 
    isLoading, 
    error, 
    refreshReferrals
  } = useReferrals();

  return (
    <>
      <Helmet>
        <title>Gestion des Parrainages | Admin BGS</title>
      </Helmet>

      <div className="space-y-6">
        <ReferralsHeader refreshData={refreshReferrals} />
        
        {error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600">
            Erreur lors du chargement des parrainages: {error}
          </div>
        ) : (
          <ReferralsTable 
            referrals={referrals} 
            isLoading={isLoading} 
          />
        )}
      </div>
    </>
  );
}
