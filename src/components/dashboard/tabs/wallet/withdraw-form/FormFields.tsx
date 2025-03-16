
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldsProps {
  amount: string;
  setAmount: (value: string) => void;
  accountOwner: string;
  setAccountOwner: (value: string) => void;
  bankName: string;
  setBankName: (value: string) => void;
  iban: string;
  setIban: (value: string) => void;
  bic: string;
  setBic: (value: string) => void;
  balance: number;
}

export default function FormFields({
  amount,
  setAmount,
  accountOwner,
  setAccountOwner,
  bankName,
  setBankName,
  iban,
  setIban,
  bic,
  setBic,
  balance
}: FormFieldsProps) {
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
  };
  
  return (
    <>
      <div>
        <Label htmlFor="amount">Montant (€)</Label>
        <Input
          id="amount"
          type="text"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Minimum 100€"
          className="mt-1"
        />
        {amount && parseInt(amount) > balance && (
          <p className="text-red-500 text-sm mt-1">
            Le montant ne peut pas dépasser votre solde actuel ({balance}€).
          </p>
        )}
      </div>
      
      <div>
        <Label htmlFor="accountOwner">Titulaire du compte</Label>
        <Input
          id="accountOwner"
          type="text"
          value={accountOwner}
          onChange={(e) => setAccountOwner(e.target.value)}
          placeholder="Nom et prénom du titulaire"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="bankName">Nom de la banque</Label>
        <Input
          id="bankName"
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="Nom de votre banque"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="iban">IBAN</Label>
        <Input
          id="iban"
          type="text"
          value={iban}
          onChange={(e) => setIban(e.target.value.toUpperCase())}
          placeholder="FR76..."
          className="mt-1 font-mono"
        />
      </div>
      
      <div>
        <Label htmlFor="bic">BIC / SWIFT</Label>
        <Input
          id="bic"
          type="text"
          value={bic}
          onChange={(e) => setBic(e.target.value.toUpperCase())}
          placeholder="BNPAFRPP..."
          className="mt-1 font-mono"
        />
      </div>
    </>
  );
}
