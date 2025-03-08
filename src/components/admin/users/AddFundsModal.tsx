
import React from 'react';
import { Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddFundsModalProps {
  isOpen: boolean;
  selectedUser: any;
  fundAmount: string;
  setFundAmount: (value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AddFundsModal({
  isOpen,
  selectedUser,
  fundAmount,
  setFundAmount,
  onClose,
  onSubmit
}: AddFundsModalProps) {
  if (!isOpen || !selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-bgs-blue mb-4">
          Ajouter des fonds
        </h2>
        <p className="text-gray-600 mb-4">
          Vous ajoutez des fonds au compte de <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>
        </p>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Montant (€)
            </label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                className="pl-10"
                placeholder="Montant"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-bgs-blue hover:bg-bgs-blue-light text-white"
            >
              Confirmer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
