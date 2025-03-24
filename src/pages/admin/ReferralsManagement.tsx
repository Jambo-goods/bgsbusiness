
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ReferralsTable from '@/components/admin/referrals/ReferralsTable';
import ReferralsHeader from '@/components/admin/referrals/ReferralsHeader';
import FixReferralCommissions from '@/components/admin/referrals/FixReferralCommissions';
import { useReferrals } from '@/hooks/admin/useReferrals';
import { AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="text-red-500 h-5 w-5" />
              <h3 className="font-medium text-red-800">Erreur lors du chargement des parrainages</h3>
            </div>
            <p className="text-red-600 ml-8">{error}</p>
            <div className="mt-4 ml-8">
              <p className="text-sm text-gray-600">
                Si vous êtes administrateur, assurez-vous que vous êtes correctement connecté avec un compte admin.
                Les politiques de sécurité permettent désormais aux administrateurs de voir tous les parrainages.
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="referrals">
            <TabsList className="mb-4">
              <TabsTrigger value="referrals">Parrainages</TabsTrigger>
              <TabsTrigger value="tools">Outils</TabsTrigger>
            </TabsList>
            
            <TabsContent value="referrals">
              <ReferralsTable 
                referrals={referrals} 
                isLoading={isLoading} 
              />
            </TabsContent>
            
            <TabsContent value="tools">
              <div className="space-y-6">
                <FixReferralCommissions />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
