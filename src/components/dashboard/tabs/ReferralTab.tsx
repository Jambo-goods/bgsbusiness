
import { useState, useEffect } from "react";
import { Copy, Users, Gift, Award, ChevronRight, Share } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useUserSession } from "@/hooks/dashboard/useUserSession";

interface ReferralData {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  commission_rate: number;
  total_commission: number;
  created_at: string;
  referred_user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface CommissionData {
  id: string;
  referral_id: string;
  referrer_id: string;
  referred_id: string;
  amount: number;
  source: string;
  status: string;
  created_at: string;
}

export default function ReferralTab() {
  const { userId } = useUserSession();
  const [referralCode, setReferralCode] = useState<string>("");
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommission: 0,
  });

  useEffect(() => {
    if (userId) {
      fetchReferralData();
    }
  }, [userId]);

  const fetchReferralData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch user's referral code
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      setReferralCode(userData.referral_code || "");
      
      // Fetch referrals with referred users' details
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user:profiles!referrals_referred_id_fkey(
            first_name, 
            last_name,
            email
          )
        `)
        .eq('referrer_id', userId);
      
      if (referralsError) throw referralsError;
      
      // Format referrals data
      const formattedReferrals = referralsData
        .filter(ref => ref.referred_user && !ref.referred_user.error)
        .map(ref => ({
          ...ref,
          referred_user: ref.referred_user as unknown as { first_name: string; last_name: string; email: string }
        }));
        
      setReferrals(formattedReferrals);
      
      // Fetch commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('referral_commissions')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });
      
      if (commissionsError) throw commissionsError;
      setCommissions(commissionsData || []);
      
      // Calculate stats
      const totalReferrals = formattedReferrals.length;
      const activeReferrals = formattedReferrals.filter(r => r.status === 'active').length;
      const totalCommission = commissionsData.reduce((sum, comm) => sum + Number(comm.amount), 0);
      
      setStats({
        totalReferrals,
        activeReferrals,
        totalCommission
      });
      
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast.error("Erreur lors du chargement des données de parrainage");
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success("Lien de parrainage copié !"))
      .catch(() => toast.error("Erreur lors de la copie du lien"));
  };

  const shareReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Rejoignez BGS Invest',
        text: 'Inscrivez-vous à BGS Invest avec mon code parrain et bénéficiez d\'avantages exclusifs !',
        url: link,
      })
      .then(() => console.log('Partage réussi'))
      .catch((error) => console.log('Erreur lors du partage', error));
    } else {
      copyReferralLink();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      active: "bg-green-100 text-green-800 hover:bg-green-200", 
      inactive: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      completed: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    };
    
    const frenchStatus = {
      pending: "En attente",
      active: "Actif",
      inactive: "Inactif",
      completed: "Complété",
    };
    
    const badgeStyle = status in styles ? styles[status as keyof typeof styles] : styles.pending;
    const displayStatus = status in frenchStatus ? frenchStatus[status as keyof typeof frenchStatus] : status;
    
    return <Badge variant="default" className={badgeStyle}>{displayStatus}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-bgs-blue mb-2">Programme de Parrainage</h2>
        <p className="text-bgs-blue/70 mb-6">
          Parrainez vos proches et gagnez 10% de commission sur leurs rendements d'investissement
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Filleuls Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-bgs-blue mr-2" />
              <span className="text-2xl font-bold">{stats.totalReferrals}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Filleuls Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{stats.activeReferrals}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Commissions Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Gift className="h-5 w-5 text-bgs-orange mr-2" />
              <span className="text-2xl font-bold">{stats.totalCommission.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <CardTitle>Votre lien de parrainage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
              <div className="font-medium">
                <span className="text-bgs-blue mr-2">Mon code:</span>
                <span className="bg-bgs-blue/10 rounded px-2 py-1">{referralCode}</span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyReferralLink}
                  className="flex items-center"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copier
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={shareReferralLink}
                  className="flex items-center bg-bgs-blue hover:bg-bgs-blue-dark"
                >
                  <Share className="h-4 w-4 mr-1" />
                  Partager
                </Button>
              </div>
            </div>
            <Alert>
              <AlertDescription className="text-sm">
                Partagez ce lien avec vos amis, famille ou collègues. Pour chaque personne qui s'inscrit avec votre code et investit, vous recevrez 10% de leurs rendements.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
      
      {/* Referrals List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Mes filleuls</h3>
        
        {referrals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium mb-2">Aucun filleul pour le moment</h3>
              <p className="text-gray-500 mb-4">Partagez votre code de parrainage pour commencer à gagner des commissions</p>
              <Button onClick={shareReferralLink} className="bg-bgs-blue hover:bg-bgs-blue-dark">
                Partager mon lien
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {referrals.map(referral => (
              <Card key={referral.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {referral.referred_user.first_name} {referral.referred_user.last_name}
                      </h4>
                      <p className="text-sm text-gray-500">{referral.referred_user.email}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 md:mt-0">
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-gray-500">Commission</span>
                        <span className="font-medium">{referral.total_commission.toFixed(2)} €</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-gray-500">Statut</span>
                        {getStatusBadge(referral.status)}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 flex justify-between">
                    <span>Parrainé le: {formatDate(referral.created_at)}</span>
                    <span>Taux: {referral.commission_rate}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Commissions History */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Historique des commissions</h3>
        
        {commissions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Gift className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium mb-2">Pas encore de commissions</h3>
              <p className="text-gray-500">Les commissions apparaîtront ici quand vos filleuls généreront des rendements</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {commissions.map(commission => (
              <Card key={commission.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{commission.source === 'investment_yield' ? 'Commission sur rendement' : commission.source}</p>
                      <p className="text-sm text-gray-500">{formatDate(commission.created_at)}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-green-600">+{commission.amount.toFixed(2)} €</span>
                      {getStatusBadge(commission.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
