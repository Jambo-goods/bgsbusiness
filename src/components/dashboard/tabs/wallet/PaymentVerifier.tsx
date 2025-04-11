
import React, { useEffect, useState } from 'react';
import { checkForUnprocessedPayments } from './utils/paymentProcessing';

interface PaymentVerifierProps {
  refreshBalance: (() => Promise<void>) | undefined;
  onVerificationComplete: () => void;
}

export default function PaymentVerifier({ refreshBalance, onVerificationComplete }: PaymentVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyPayments = async () => {
      await checkForUnprocessedPayments(refreshBalance);
      setIsVerifying(false);
      onVerificationComplete();
    };
    
    verifyPayments();
  }, [refreshBalance, onVerificationComplete]);

  if (!isVerifying) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <p className="text-blue-700">Vérification des paiements en attente...</p>
    </div>
  );
}
