
import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle, Users, Gift, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export default function ReferralTab() {
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("BGS-" + Math.random().toString(36).substring(2, 10).toUpperCase());
  const [copied, setCopied] = useState(false);
  
  // Statistiques simplifiées (sans Supabase)
  const stats = {
    pendingCount: 0,
    completedCount: 0,
    totalEarned: 0
  };

  // Fonction simplifiée pour copier le lien de parrainage
  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Lien de parrainage copié !");
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  // Simuler un chargement bref pour une meilleure expérience utilisateur
  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
          Parrainez vos amis et recevez 25€ lorsqu'ils commencent à investir avec BGS Invest.
          Votre filleul reçoit également 25€ dès son inscription avec votre code.
        </p>
      </div>
      
      {/* Statistiques (version statique) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-full">
              <Users size={20} className="text-bgs-blue" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Filleuls en attente</p>
              <p className="text-2xl font-semibold">{stats.pendingCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 bg-white border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-full">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Parrainages complétés</p>
              <p className="text-2xl font-semibold">{stats.completedCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 bg-white border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2 rounded-full">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Gains totaux</p>
              <p className="text-2xl font-semibold">{stats.totalEarned} €</p>
            </div>
          </div>
        </Card>
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
      
      {/* Section Comment ça marche */}
      <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-medium text-gray-800 mb-4">Comment ça marche ?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-50 p-3 rounded-full mb-3">
              <Users size={24} className="text-bgs-blue" />
            </div>
            <h4 className="font-medium mb-2">1. Invitez vos amis</h4>
            <p className="text-sm text-gray-600">
              Partagez votre lien ou code de parrainage avec vos amis, famille et collègues.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-50 p-3 rounded-full mb-3">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <h4 className="font-medium mb-2">2. Ils s'inscrivent</h4>
            <p className="text-sm text-gray-600">
              Votre filleul s'inscrit avec votre lien ou code et reçoit 25€ immédiatement sur son compte.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-orange-50 p-3 rounded-full mb-3">
              <Gift size={24} className="text-bgs-orange" />
            </div>
            <h4 className="font-medium mb-2">3. Vous recevez 25€</h4>
            <p className="text-sm text-gray-600">
              Dès que votre filleul fait son premier investissement, vous recevez 25€ sur votre solde.
            </p>
          </div>
        </div>
      </div>
      
      {/* Section Liste des Parrainages (vide) */}
      <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-medium text-gray-800 mb-4">
          Vos parrainages
        </h3>
        
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-700">Aucun parrainage pour l'instant</h4>
          <p className="mt-2 text-gray-500">
            Commencez à partager votre lien pour voir vos parrainages ici.
          </p>
        </div>
      </div>
    </div>
  );
}
