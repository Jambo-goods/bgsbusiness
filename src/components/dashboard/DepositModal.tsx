
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Copy, ExternalLink } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"amount" | "details">("amount");
  
  // Bank account details (these would come from your backend in a real app)
  const bankDetails = {
    accountName: "BGS Business Club",
    iban: "FR76 1234 5678 9012 3456 7890 123",
    bic: "BNPAFRPPXXX",
    bankName: "Banque Nationale de Paris",
    reference: "DEP-" + Math.random().toString(36).substring(2, 8).toUpperCase()
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide supérieur à 0 €.",
      });
      return;
    }
    
    if (Number(amount) < 1500) {
      toast({
        variant: "destructive",
        title: "Montant minimum non atteint",
        description: "Le dépôt minimum est de 1500 €.",
      });
      return;
    }
    
    // Move to bank details step
    setStep("details");
  };
  
  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copié !",
          description: `${label} copié dans le presse-papier.`,
        });
      },
      (err) => {
        console.error("Impossible de copier: ", err);
        toast({
          variant: "destructive",
          title: "Erreur de copie",
          description: "Impossible de copier le texte. Veuillez réessayer.",
        });
      }
    );
  };
  
  const resetAndClose = () => {
    setAmount("");
    setStep("amount");
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        {step === "amount" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-bgs-blue">Faire un dépôt</DialogTitle>
              <DialogDescription>
                Veuillez entrer le montant que vous souhaitez déposer. Le montant minimum est de 1500 €.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="py-4">
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-bgs-blue/70 mb-1">
                  Montant (€)
                </label>
                <div className="relative">
                  <input
                    id="amount"
                    type="number"
                    min="1500"
                    step="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bgs-orange focus:border-transparent"
                    placeholder="1500"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">€</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <button 
                  type="button" 
                  onClick={resetAndClose}
                  className="px-4 py-2 text-bgs-blue hover:text-bgs-blue/70 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Continuer
                </button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-bgs-blue">Détails du virement</DialogTitle>
              <DialogDescription>
                Veuillez effectuer un virement bancaire avec les informations suivantes.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-bgs-blue/70">Montant:</span>
                    <span className="text-sm font-semibold text-bgs-blue">{Number(amount).toLocaleString()} €</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-bgs-blue/70">Bénéficiaire:</span>
                    <div className="flex items-center">
                      <span className="text-sm text-bgs-blue">{bankDetails.accountName}</span>
                      <button 
                        onClick={() => handleCopyToClipboard(bankDetails.accountName, "Nom du bénéficiaire")}
                        className="ml-2 text-bgs-blue/50 hover:text-bgs-orange"
                        aria-label="Copier le nom du bénéficiaire"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-bgs-blue/70">IBAN:</span>
                    <div className="flex items-center">
                      <span className="text-sm text-bgs-blue">{bankDetails.iban}</span>
                      <button 
                        onClick={() => handleCopyToClipboard(bankDetails.iban, "IBAN")}
                        className="ml-2 text-bgs-blue/50 hover:text-bgs-orange"
                        aria-label="Copier l'IBAN"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-bgs-blue/70">BIC/SWIFT:</span>
                    <div className="flex items-center">
                      <span className="text-sm text-bgs-blue">{bankDetails.bic}</span>
                      <button 
                        onClick={() => handleCopyToClipboard(bankDetails.bic, "BIC/SWIFT")}
                        className="ml-2 text-bgs-blue/50 hover:text-bgs-orange"
                        aria-label="Copier le BIC/SWIFT"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-bgs-blue/70">Référence:</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-bgs-blue">{bankDetails.reference}</span>
                      <button 
                        onClick={() => handleCopyToClipboard(bankDetails.reference, "Référence")}
                        className="ml-2 text-bgs-blue/50 hover:text-bgs-orange"
                        aria-label="Copier la référence"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-bgs-blue/70">
                  <p className="font-medium mb-2">Important:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Veuillez inclure la référence exacte dans votre virement.</li>
                    <li>Le traitement du dépôt peut prendre 1-3 jours ouvrés.</li>
                    <li>Conservez une preuve de paiement pour toute référence ultérieure.</li>
                  </ul>
                </div>
              </div>
            </div>
            <DialogFooter className="flex sm:justify-between">
              <button 
                type="button" 
                onClick={() => setStep("amount")}
                className="px-4 py-2 text-bgs-blue hover:text-bgs-blue/70 transition-colors"
              >
                Retour
              </button>
              <div className="flex space-x-2">
                <a 
                  href="https://www.banking.example.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-bgs-orange hover:text-bgs-orange-light"
                >
                  Accéder à ma banque
                  <ExternalLink size={14} className="ml-1" />
                </a>
                <button 
                  type="button" 
                  onClick={resetAndClose}
                  className="btn-primary"
                >
                  Terminé
                </button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
