
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Check, Users, TrendingUp, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralTab() {
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [userStats, setUserStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommissions: 0
  });
  const [referrals, setReferrals] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) return;

        const userId = sessionData.session.user.id;
        
        // Get user profile and referral code
        const { data: profileData } = await supabase
          .from('profiles')
          .select('referral_code, first_name, last_name, email')
          .eq('id', userId)
          .single();
        
        if (profileData?.referral_code) {
          setReferralCode(profileData.referral_code);
        } else {
          // Generate a referral code if user doesn't have one
          const code = generateReferralCode(profileData?.first_name, profileData?.last_name);
          const { data } = await supabase
            .from('profiles')
            .update({ referral_code: code })
            .eq('id', userId);
          
          setReferralCode(code);
        }
        
        // Get referrals (users referred by current user)
        const { data: referralsData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, created_at, investment_total')
          .eq('referred_by', userId);
        
        if (referralsData) {
          setReferrals(referralsData);
          setUserStats(prev => ({
            ...prev,
            totalReferrals: referralsData.length,
            activeReferrals: referralsData.filter(r => r.investment_total > 0).length
          }));
        }
        
        // Get commission history
        const { data: commissionsData } = await supabase
          .from('referral_commissions')
          .select('*')
          .eq('referrer_id', userId)
          .order('created_at', { ascending: false });
        
        if (commissionsData) {
          setCommissions(commissionsData);
          
          // Calculate total commissions
          const total = commissionsData.reduce((sum, item) => sum + (item.amount || 0), 0);
          setUserStats(prev => ({
            ...prev,
            totalCommissions: total
          }));
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
        toast.error('Impossible de charger les données de parrainage');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferralData();
  }, []);

  // Generate a referral code based on user name
  const generateReferralCode = (firstName, lastName) => {
    const prefix = firstName?.substring(0, 3).toUpperCase() || 'REF';
    const suffix = lastName?.substring(0, 3).toUpperCase() || 'BGS';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${suffix}${random}`;
  };

  const copyReferralLink = () => {
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}/register?ref=${referralCode}`;
    
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopied(true);
        toast.success('Lien de parrainage copié');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Impossible de copier le lien');
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bgs-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-bgs-blue mb-2">Programme de Parrainage</h2>
        <p className="text-gray-600">
          Parrainez vos amis et gagnez 10% de commission sur leurs rendements d'investissement.
        </p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Filleuls</p>
            <p className="text-2xl font-semibold">{userStats.totalReferrals}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Filleuls Actifs</p>
            <p className="text-2xl font-semibold">{userStats.activeReferrals}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4">
          <div className="bg-amber-100 p-3 rounded-full">
            <Wallet className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Commissions</p>
            <p className="text-2xl font-semibold">{formatCurrency(userStats.totalCommissions)}</p>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Votre lien de parrainage</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 w-full bg-gray-50 p-3 rounded-lg border border-gray-200">
            <span className="text-gray-700 font-medium">Code: {referralCode}</span>
          </div>
          <button
            onClick={copyReferralLink}
            className="flex items-center px-4 py-2 bg-bgs-blue text-white rounded-lg hover:bg-bgs-blue/90 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copié
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copier le lien
              </>
            )}
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Partagez ce lien avec vos amis pour qu'ils puissent s'inscrire et vous désigner comme parrain.
        </p>
      </div>

      {/* Referrals List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium">Mes filleuls</h3>
        </div>
        
        {referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investissements
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referrals.map((referral) => (
                  <tr key={referral.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {referral.first_name} {referral.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{referral.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(referral.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(referral.investment_total)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        referral.investment_total > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {referral.investment_total > 0 ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              Vous n'avez pas encore de filleuls. Partagez votre lien pour commencer à parrainer !
            </p>
          </div>
        )}
      </div>

      {/* Commission History */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium">Historique des commissions</h3>
        </div>
        
        {commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filleul
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissions.map((commission) => (
                  <tr key={commission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(commission.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {commission.referred_name || 'Utilisateur'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{commission.description || 'Commission'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        +{formatCurrency(commission.amount)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              Vous n'avez pas encore reçu de commissions. Les commissions sont versées lorsque vos filleuls génèrent des rendements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
