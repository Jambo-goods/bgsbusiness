
import React from "react";
import { Card } from "@/components/ui/card";
import WithdrawalRequestsTable from "./WithdrawalRequestsTable";
import InfoAlert from "./withdraw-form/InfoAlert";
import FormFields from "./withdraw-form/FormFields";
import WithdrawButton from "./withdraw-form/WithdrawButton";
import { useWithdrawForm } from "./withdraw-form/useWithdrawForm";

interface WithdrawFundsFormProps {
  balance: number;
  onWithdraw: () => Promise<void>;
}

export default function WithdrawFundsForm({ balance, onWithdraw }: WithdrawFundsFormProps) {
  const {
    amount,
    setAmount,
    accountHolder,
    setAccountHolder,
    bankName,
    setBankName,
    accountNumber,
    setAccountNumber,
    isSubmitting,
    isValidForm,
    handleSubmit
  } = useWithdrawForm(balance, onWithdraw);
  
  return (
    <div className="space-y-6">
      <InfoAlert />
      
      <Card className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-amber-700 bg-amber-50 p-4 rounded-md mb-4">
            <p className="font-medium">Important : Les retraits nécessitent une validation administrative</p>
            <p>Votre demande de retrait sera examinée par notre équipe et le montant sera versé sur votre compte bancaire après approbation.</p>
          </div>
          
          <FormFields
            amount={amount}
            setAmount={setAmount}
            accountHolder={accountHolder}
            setAccountHolder={setAccountHolder}
            bankName={bankName}
            setBankName={setBankName}
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            balance={balance}
          />
          
          <WithdrawButton 
            isFormValid={isValidForm()} 
            isSubmitting={isSubmitting} 
          />
        </form>
        
        <WithdrawalRequestsTable />
      </Card>
    </div>
  );
}
