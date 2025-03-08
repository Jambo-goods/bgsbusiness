
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NewUser {
  first_name: string;
  last_name: string;
  email: string;
  wallet_balance: string;
}

interface CreateUserModalProps {
  isOpen: boolean;
  newUser: NewUser;
  setNewUser: (user: NewUser) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CreateUserModal({
  isOpen,
  newUser,
  setNewUser,
  onClose,
  onSubmit
}: CreateUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-bgs-blue mb-4">
          Créer un utilisateur test
        </h2>
        <p className="text-gray-600 mb-4">
          Cet utilisateur sera créé uniquement pour les tests et n'aura pas d'accès au compte.
        </p>
        
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                value={newUser.first_name}
                onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                value={newUser.last_name}
                onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="wallet_balance">Solde initial (€)</Label>
              <Input
                id="wallet_balance"
                type="number"
                min="0"
                step="1"
                value={newUser.wallet_balance}
                onChange={(e) => setNewUser({...newUser, wallet_balance: e.target.value})}
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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Créer l'utilisateur
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
