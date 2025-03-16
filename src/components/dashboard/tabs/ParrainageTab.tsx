
import React, { useState, useEffect } from 'react';
import { Copy, Share, UserPlus, Gift, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUserSession } from '@/hooks/dashboard/useUserSession';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface Referral {
  id: string;
  referred_id: string;
  status: string;
  created_at: string;
  commission_percentage: number;
  referred_user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const ParrainageTab = () => {
  const { userId } = useUserSession();
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalCommissions, setTotalCommissions] = useState<number>(0);
  
  // Fetch referral code and referrals from the database
  useEffect(() => {
    if (!userId) return;
    
    const fetchReferralData = async () => {
      setLoading(true);
      try {
        // Get the user's referral code
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', userId)
          .single();
          
        if (profileError) {
          console.error('Error fetching referral code:', profileError);
        } else if (profileData) {
          setReferralCode(profileData.referral_code || '');
        }
        
        // Get the user's referrals
        const { data: referralsData, error: referralsError } = await supabase
          .from('referrals')
          .select(`
            *,
            referred_user:profiles!referred_id(
              first_name, 
              last_name,
              email
            )
          `)
          .eq('referrer_id', userId);
          
        if (referralsError) {
          console.error('Error fetching referrals:', referralsError);
        } else if (referralsData) {
          setReferrals(referralsData as Referral[]);
          
          // Calculate total commissions (just a placeholder for now)
          let total = 0;
          referralsData.forEach(referral => {
            // Let's say each referral generates 25€ for simplicity
            total += 25;
          });
          setTotalCommissions(total);
        }
      } catch (error) {
        console.error('Error in fetchReferralData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferralData();
    
    // Set up real-time subscription for referrals
    const referralsSubscription = supabase
      .channel('referrals-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'referrals',
        filter: `referrer_id=eq.${userId}`,
      }, (payload) => {
        console.log('New referral:', payload);
        toast.success('Nouveau filleul inscrit !', {
          description: 'Un nouvel utilisateur s\'est inscrit avec votre code de parrainage.'
        });
        
        // Refresh data
        fetchReferralData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(referralsSubscription);
    };
  }, [userId]);
  
  const copyReferralCode = () => {
    if (!referralCode) return;
    
    navigator.clipboard.writeText(referralCode);
    toast.success('Code de parrainage copié !');
  };
  
  const shareReferral = () => {
    if (!referralCode) return;
    
    const shareText = `Rejoignez BGS Invest avec mon code de parrainage "${referralCode}" et obtenez un bonus de 25€ sur votre premier investissement !`;
    const shareUrl = `${window.location.origin}/register?ref=${referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Rejoignez BGS Invest',
        text: shareText,
        url: shareUrl,
      }).catch(err => {
        console.error('Erreur lors du partage:', err);
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      toast.info('Lien et message copiés. Partagez-les avec vos amis !');
    }
  };

  const getReferralStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">En attente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-bgs-blue">Programme de Parrainage</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div className="md:w-1/2 space-y-4">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-16 w-full" />
              
              <div className="mt-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
            
            <div className="md:w-1/2 space-y-4">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-6 w-36" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-bgs-blue">Programme de Parrainage</h2>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="md:w-1/2 space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg inline-block mb-2">
              <UserPlus className="w-8 h-8 text-bgs-blue" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Invitez vos amis et gagnez</h3>
            <p className="text-gray-600">
              Parrainez vos amis et recevez <span className="font-semibold">10% de tous les gains de vos filleuls</span> de manière permanente.
              Votre filleul bénéficie également d'un bonus de 25€ sur son premier investissement.
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="relative">
                <label className="text-sm font-medium text-gray-700">Votre code de parrainage</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    readOnly
                    value={referralCode}
                    className="flex-1 min-w-0 block w-full px-3 py-3 rounded-md border border-gray-300 bg-gray-50 text-gray-900 sm:text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={copyReferralCode}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-bgs-blue hover:bg-bgs-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bgs-blue"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copier
                  </button>
                </div>
              </div>
              
              <button
                onClick={shareReferral}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-bgs-blue hover:bg-bgs-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bgs-blue"
              >
                <Share className="h-4 w-4 mr-2" />
                Partager mon code
              </button>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Lien d'invitation :</span>
                  <br />
                  <a 
                    href={`${window.location.origin}/register?ref=${referralCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bgs-blue hover:underline flex items-center gap-1 mt-1"
                  >
                    {`${window.location.origin}/register?ref=${referralCode}`}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 space-y-4 border-t pt-6 md:pt-0 md:border-t-0 md:border-l md:pl-8 mt-6 md:mt-0">
            <div className="bg-green-50 p-3 rounded-lg inline-block mb-2">
              <Gift className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Comment ça marche</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-bgs-blue text-white text-xs font-medium">
                  1
                </div>
                <div className="ml-3">
                  <p className="text-gray-600">Partagez votre code avec vos amis</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-bgs-blue text-white text-xs font-medium">
                  2
                </div>
                <div className="ml-3">
                  <p className="text-gray-600">Ils s'inscrivent en utilisant votre code</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-bgs-blue text-white text-xs font-medium">
                  3
                </div>
                <div className="ml-3">
                  <p className="text-gray-600">Ils effectuent leur premier investissement</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-bgs-blue text-white text-xs font-medium">
                  4
                </div>
                <div className="ml-3">
                  <p className="text-gray-600">Vous recevez 10% de tous leurs gains</p>
                </div>
              </li>
            </ul>
            
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Exemple :</span> Si votre filleul gagne 100€ de rendement, vous recevez automatiquement 10€ sur votre portefeuille. Ces commissions sont calculées à vie sur l'ensemble de ses gains !
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Vos parrainages</h3>
          
          {referrals.length > 0 && (
            <div className="mt-2 md:mt-0">
              <Badge className="bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1">
                Total des commissions: {totalCommissions}€
              </Badge>
            </div>
          )}
        </div>
        
        {referrals.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filleul</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-bgs-blue rounded-full flex items-center justify-center text-white font-semibold">
                            {referral.referred_user?.first_name?.[0] || '?'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {referral.referred_user?.first_name} {referral.referred_user?.last_name}
                            </div>
                            <div className="text-xs text-gray-500">{referral.referred_user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(referral.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getReferralStatusBadge(referral.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="text-green-600 font-medium">
                          {referral.commission_percentage}% des gains
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Alert className="bg-blue-50 border-blue-100">
              <AlertDescription className="text-blue-800">
                Les commissions sont directement ajoutées à votre solde et apparaissent dans l'historique de transactions dans votre portefeuille.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600">Vous n'avez pas encore parrainé d'amis.</p>
            <p className="text-gray-600 mt-2">Partagez votre code et commencez à gagner des commissions sur leurs gains !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParrainageTab;
