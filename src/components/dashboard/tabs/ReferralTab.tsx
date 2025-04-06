
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle, Users, Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ReferralTab() {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      // Récupérer l'ID de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour accéder à cette page");
        return;
      }

      // Récupérer le code de parrainage de l'utilisateur
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Si aucun code n'existe, en créer un nouveau
      if (codeError || !codeData) {
        // Générer un code aléatoire
        const newCode = generateReferralCode();
        
        // Enregistrer le nouveau code
        const { data: newCodeData, error: newCodeError } = await supabase
          .from('referral_codes')
          .insert([{ user_id: user.id, code: newCode }])
          .select()
          .single();

        if (newCodeError) {
          console.error("Erreur lors de la création du code:", newCodeError);
          toast.error("Impossible de créer votre code de parrainage");
        } else if (newCodeData) {
          setReferralCode(newCodeData.code);
        }
      } else {
        setReferralCode(codeData.code);
      }

      // Récupérer les parrainages de l'utilisateur
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:referred_id(first_name, last_name, email, created_at)
        `)
        .eq('referrer_id', user.id);

      if (referralsError) {
        console.error("Erreur lors de la récupération des parrainages:", referralsError);
      } else if (referralsData) {
        setReferrals(referralsData);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = () => {
    // Générer un code aléatoire de 8 caractères
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'BGS-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Lien de parrainage copié !");
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-full h-12" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-bgs-blue mb-4">Programme de parrainage</h2>
        <p className="text-gray-600 mb-6">
          Parrainez vos amis et recevez des récompenses lorsqu'ils commencent à investir avec BGS Invest.
          Partagez votre lien de parrainage personnalisé ci-dessous.
        </p>
      </div>
      
      {/* Section Code de Parrainage */}
      <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-medium text-gray-800 mb-4">Votre lien de parrainage</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input 
              value={`${window.location.origin}/register?ref=${referralCode}`}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <Button 
            onClick={copyReferralLink} 
            className="flex items-center gap-2"
            variant={copied ? "outline" : "default"}
          >
            {copied ? (
              <>
                <CheckCircle size={16} />
                <span>Copié</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copier</span>
              </>
            )}
          </Button>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Votre code: <span className="font-medium text-bgs-blue">{referralCode}</span></p>
        </div>
      </div>
      
      {/* Section Récompenses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
          <div className="mb-3 text-bgs-orange">
            <Users size={24} />
          </div>
          <h4 className="text-lg font-medium mb-2">Invitez vos amis</h4>
          <p className="text-gray-600 text-sm">
            Partagez votre lien unique avec vos amis, famille et collègues.
          </p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
          <div className="mb-3 text-bgs-orange">
            <Gift size={24} />
          </div>
          <h4 className="text-lg font-medium mb-2">Gagnez des récompenses</h4>
          <p className="text-gray-600 text-sm">
            Recevez 50€ pour chaque ami qui investit au moins 1000€.
          </p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
          <div className="mb-3 text-bgs-orange">
            <CheckCircle size={24} />
          </div>
          <h4 className="text-lg font-medium mb-2">Sans limite</h4>
          <p className="text-gray-600 text-sm">
            Aucune limite au nombre d'amis que vous pouvez parrainer.
          </p>
        </div>
      </div>
      
      {/* Section Liste des Parrainages */}
      <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-medium text-gray-800 mb-4">
          Vos parrainages {referrals.length > 0 && `(${referrals.length})`}
        </h3>
        
        {referrals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-700">Aucun parrainage pour l'instant</h4>
            <p className="mt-2 text-gray-500">
              Commencez à partager votre lien pour voir vos parrainages ici.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 bg-gray-50 text-gray-600 text-sm font-medium">Nom</th>
                  <th className="text-left py-3 px-4 bg-gray-50 text-gray-600 text-sm font-medium">Date d'inscription</th>
                  <th className="text-left py-3 px-4 bg-gray-50 text-gray-600 text-sm font-medium">Statut</th>
                  <th className="text-right py-3 px-4 bg-gray-50 text-gray-600 text-sm font-medium">Récompense</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id} className="border-t border-gray-100">
                    <td className="py-3 px-4 text-sm">
                      {referral.referred ? (
                        <>
                          <span className="font-medium">
                            {referral.referred.first_name} {referral.referred.last_name}
                          </span>
                          <br />
                          <span className="text-gray-500">{referral.referred.email}</span>
                        </>
                      ) : (
                        <span className="text-gray-500">Utilisateur inconnu</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {referral.referred && referral.referred.created_at 
                        ? new Date(referral.referred.created_at).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span 
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          referral.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : referral.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {referral.status === 'completed' ? 'Complété' : 
                         referral.status === 'pending' ? 'En attente' : 
                         referral.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${referral.referrer_rewarded ? 'text-green-600' : 'text-gray-400'}`}>
                        {referral.referrer_rewarded ? '+50€' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
