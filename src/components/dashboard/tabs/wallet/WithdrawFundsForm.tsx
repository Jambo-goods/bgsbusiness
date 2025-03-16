
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
    accountOwner,
    setAccountOwner,
    bankName,
    setBankName,
    iban,
    setIban,
    isSubmitting,
    isFormValid,
    handleSubmit
  } = useWithdrawForm(balance, onWithdraw);
  
  return (
    <div className="space-y-6">
      <InfoAlert />
      
      <Card className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields
            amount={amount}
            setAmount={setAmount}
            accountOwner={accountOwner}
            setAccountOwner={setAccountOwner}
            bankName={bankName}
            setBankName={setBankName}
            iban={iban}
            setIban={setIban}
            balance={balance}
          />
          
          <WithdrawButton 
            isFormValid={isFormValid()} 
            isSubmitting={isSubmitting} 
          />
        </form>
        
        <WithdrawalRequestsTable />
      </Card>
    </div>
  );
}
