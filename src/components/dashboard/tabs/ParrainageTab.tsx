
import React, { useState } from 'react';
import { Copy, Share, UserPlus, Gift } from 'lucide-react';
import { toast } from 'sonner';

const ParrainageTab = () => {
  const [referralCode] = useState('BGSINVEST2024');
  
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Code de parrainage copié !');
  };
  
  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Rejoignez BGS Invest',
        text: `Utilisez mon code de parrainage ${referralCode} pour vous inscrire sur BGS Invest et obtenez un bonus de bienvenue !`,
        url: window.location.origin,
      }).catch(err => {
        console.error('Erreur lors du partage:', err);
      });
    } else {
      copyReferralCode();
      toast.info('Lien copié. Partagez-le avec vos amis !');
    }
  };

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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vos parrainages</h3>
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">Vous n'avez pas encore parrainé d'amis.</p>
          <p className="text-gray-600 mt-2">Partagez votre code et commencez à gagner des commissions sur leurs gains !</p>
        </div>
      </div>
    </div>
  );
};

export default ParrainageTab;
