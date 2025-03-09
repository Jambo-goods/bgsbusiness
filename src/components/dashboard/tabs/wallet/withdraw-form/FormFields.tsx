
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldsProps {
  amount: string;
  setAmount: (value: string) => void;
  accountHolder: string;
  setAccountHolder: (value: string) => void;
  bankName: string;
  setBankName: (value: string) => void;
  accountNumber: string;
  setAccountNumber: (value: string) => void;
  balance: number;
}

export default function FormFields({
  amount,
  setAmount,
  accountHolder,
  setAccountHolder,
  bankName,
  setBankName,
  accountNumber,
  setAccountNumber,
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
        <Label htmlFor="accountHolder">Titulaire du compte</Label>
        <Input
          id="accountHolder"
          type="text"
          value={accountHolder}
          onChange={(e) => setAccountHolder(e.target.value)}
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
        <Label htmlFor="accountNumber">Numéro de compte / IBAN</Label>
        <Input
          id="accountNumber"
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.toUpperCase())}
          placeholder="FR76..."
          className="mt-1 font-mono"
        />
      </div>
    </>
  );
}
