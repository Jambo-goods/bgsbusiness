import React, { useState } from "react";
import { Eye, Plus, Wallet, ChevronsUpDown, ArrowRight, Bank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboard } from "@/contexts/DashboardContext";

interface ActionButtonsProps {
  userId: string;
}

export function ActionButtons({ userId }: ActionButtonsProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("wallet");
  const navigate = useNavigate();
  const { user } = useUser();
  const { setShowBankTransferModal } = useDashboard();

  const handleShowBankTransfer = (userId: string) => {
    setShowBankTransferModal(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);
  };

  const handleDeposit = () => {
    if (!amount) {
      toast.error("Veuillez entrer un montant");
      return;
    }

    if (isNaN(Number(amount))) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (Number(amount) <= 0) {
      toast.error("Le montant doit être supérieur à zéro");
      return;
    }

    toast.success(`Dépôt de ${amount} € via ${selectedPaymentMethod} effectué`);
    setOpen(false);
  };

  const handleWithdraw = () => {
    navigate("/dashboard/wallet");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/invest")}>
          <Plus className="mr-2 h-4 w-4" />
          Investir
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/wallet")}>
          <Wallet className="mr-2 h-4 w-4" />
          Mon Portefeuille
        </Button>
        <Button variant="outline" className="w-full" onClick={() => handleShowBankTransfer(userId)}>
          <Bank className="mr-2 h-4 w-4" />
          Virement Bancaire
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <ChevronsUpDown className="mr-2 h-4 w-4" />
            Déposer des fonds
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Déposer des fonds</DialogTitle>
            <DialogDescription>
              Choisissez le montant et la méthode de paiement pour déposer des fonds sur votre
              compte.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant
              </Label>
              <Input
                type="number"
                id="amount"
                placeholder="0.00"
                className="col-span-3"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">
                Méthode de paiement
              </Label>
              <Select onValueChange={handlePaymentMethodChange} defaultValue={selectedPaymentMethod}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une méthode de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wallet">Portefeuille</SelectItem>
                  <SelectItem value="creditCard">Carte de crédit</SelectItem>
                  <SelectItem value="bankTransfer">Virement bancaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" onClick={handleDeposit}>
            Déposer
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
