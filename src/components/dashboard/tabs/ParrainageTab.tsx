
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Users, RefreshCw, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type Referral = {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  commission_percentage: number;
  created_at: string;
  referred_user: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

export default function ParrainageTab() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalCommission, setTotalCommission] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchReferralData();

    // Set up real-time listener for referrals table
    const channel = supabase
      .channel('referrals-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'referrals' },
        (payload) => {
          console.log('Referrals table change:', payload);
          fetchReferralData(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReferralData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // Get current user session
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Vous devez être connecté pour accéder à cette page");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Get user's referral code
      const { data: profileData } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', session.session.user.id)
        .single();

      if (profileData) {
        setReferralCode(profileData.referral_code);
      }

      // Get user's referrals 
      const { data: referralsData, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', session.session.user.id);

      if (error) {
        console.error('Error fetching referrals:', error);
        toast.error("Erreur lors de la récupération des parrainages");
      } else {
        // For each referral, fetch the referred user details
        const referralsWithUserDetails = await Promise.all(
          (referralsData || []).map(async (referral) => {
            const { data: userData } = await supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', referral.referred_id)
              .single();
            
            return {
              ...referral,
              referred_user: {
                first_name: userData?.first_name || 'Utilisateur',
                last_name: userData?.last_name || 'Inconnu',
                email: userData?.email || 'email@inconnu.com',
              }
            } as Referral;
          })
        );
        
        setReferrals(referralsWithUserDetails);
        
        // Calculate total commission (assuming we have a commission amount somewhere)
        // For now, just count the number of successful referrals and multiply by 25
        const completedReferrals = referralsWithUserDetails.filter(r => r.status === 'completed').length;
        setTotalCommission(completedReferrals * 25);
      }
    } catch (err) {
      console.error('Error in fetchReferralData:', err);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCopyReferralLink = () => {
    if (!referralCode) return;
    
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        toast.success("Lien de parrainage copié !");
      })
      .catch(() => {
        toast.error("Impossible de copier le lien");
      });
  };

  const handleShare = async () => {
    if (!referralCode) return;
    
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BGS Invest - Parrainage',
          text: 'Rejoignez BGS Invest avec mon code de parrainage et obtenez un bonus de 25€ !',
          url: referralLink,
        });
        toast.success("Partage réussi !");
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyReferralLink();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Votre code de parrainage</CardTitle>
          <CardDescription>Partagez ce code avec vos amis pour leur offrir un bonus de 25€</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            {referralCode ? (
              <>
                <div className="mb-4">
                  <span className="text-xl font-semibold bg-white px-6 py-3 rounded-lg border border-gray-200 inline-block shadow-sm">
                    {referralCode}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Pour chaque ami qui s'inscrit avec votre code et effectue un investissement, 
                  vous recevrez une commission de 25€.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleCopyReferralLink}
                  >
                    <Copy className="h-4 w-4" />
                    Copier le lien
                  </Button>
                  <Button 
                    variant="default" 
                    className="flex items-center gap-2"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                    Partager
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p>Aucun code de parrainage trouvé.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vos parrainages</CardTitle>
            <CardDescription>Suivez les personnes que vous avez parrainées</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchReferralData(false)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Total des commissions gagnées :</span>
            </div>
            <span className="text-lg font-semibold text-green-600">{totalCommission} €</span>
          </div>
          
          {referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nom</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Statut</th>
                    <th className="text-left py-3 px-4">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {`${referral.referred_user.first_name} ${referral.referred_user.last_name}`}
                      </td>
                      <td className="py-3 px-4">{referral.referred_user.email}</td>
                      <td className="py-3 px-4">
                        {new Date(referral.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${referral.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : referral.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-gray-100 text-gray-800'}`}
                        >
                          {referral.status === 'completed' ? 'Complété' : 
                           referral.status === 'pending' ? 'En attente' : referral.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {referral.status === 'completed' ? '25 €' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Vous n'avez pas encore parrainé d'amis.</p>
              <p className="text-sm mt-1">Partagez votre code pour commencer !</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
