
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircle, CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BankTransferInstructions() {
  const [copied, setCopied] = React.useState(false);

  const bankDetails = {
    name: "BGS Invest",
    iban: "FR76 1234 5678 9101 1121 3141 516",
    bic: "BGSFRINVXXX",
    bank: "Banque Générale Française",
    reference: "DEP-" + Math.floor(100000 + Math.random() * 900000)
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Pour déposer des fonds, effectuez un virement bancaire avec les coordonnées ci-dessous. 
          Le dépôt minimum est de 100€. Vos fonds seront disponibles dans votre portefeuille 
          sous 24-48h ouvrées après réception.
        </AlertDescription>
      </Alert>
      
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Bénéficiaire</p>
                <p className="font-semibold">{bankDetails.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Banque</p>
                <p className="font-semibold">{bankDetails.bank}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">BIC/SWIFT</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{bankDetails.bic}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => copyToClipboard(bankDetails.bic)}
                  >
                    {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-1">IBAN</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-semibold tracking-wider">{bankDetails.iban}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => copyToClipboard(bankDetails.iban)}
                >
                  {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Référence à indiquer</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-semibold tracking-wider text-bgs-blue">{bankDetails.reference}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => copyToClipboard(bankDetails.reference)}
                >
                  {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Assurez-vous d'inclure la référence exacte dans votre virement.
          Sans cette référence, l'identification de votre dépôt pourrait être retardée.
          Le montant minimum de dépôt est de 100€.
        </AlertDescription>
      </Alert>
    </div>
  );
}
