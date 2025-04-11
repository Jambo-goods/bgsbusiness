
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useScheduledPayments } from "@/hooks/useScheduledPayments";
import PaymentEditForm from "./PaymentEditForm";
import { handlePaymentUpdate } from "./utils/paymentProcessing";

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: {
    id: string;
    project_id: string;
    payment_date: string;
    percentage: number;
    status: string;
    projects?: {
      name: string;
    };
  } | null;
}

export default function EditPaymentModal({ isOpen, onClose, payment }: EditPaymentModalProps) {
  const [percentage, setPercentage] = useState(payment?.percentage || 0);
  const [date, setDate] = useState<Date | undefined>(
    payment?.payment_date ? new Date(payment.payment_date) : undefined
  );
  const [status, setStatus] = useState(payment?.status || "scheduled");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updatePaymentStatus, refetch } = useScheduledPayments();

  // Reset form values when payment changes or modal opens
  useEffect(() => {
    if (payment) {
      setPercentage(payment.percentage || 0);
      setDate(payment.payment_date ? new Date(payment.payment_date) : undefined);
      setStatus(payment.status || "scheduled");
    }
  }, [payment, isOpen]);

  // Refresh data when modal opens
  useEffect(() => {
    if (isOpen && payment) {
      refetch();
    }
  }, [isOpen, payment, refetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payment || !date) return;
    
    setIsSubmitting(true);
    
    try {
      await handlePaymentUpdate(
        payment,
        status,
        date.toISOString(),
        percentage,
        updatePaymentStatus,
        refetch
      );
      
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      // Error handling is done in handlePaymentUpdate
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le paiement programmé</DialogTitle>
        </DialogHeader>
        
        <PaymentEditForm
          payment={payment}
          onSubmit={handleSubmit}
          onClose={onClose}
          isSubmitting={isSubmitting}
          percentage={percentage}
          setPercentage={setPercentage}
          date={date}
          setDate={setDate}
          status={status}
          setStatus={setStatus}
        />
      </DialogContent>
    </Dialog>
  );
}
