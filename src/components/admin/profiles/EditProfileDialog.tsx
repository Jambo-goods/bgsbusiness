
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';
import { formatCurrency } from '@/utils/currencyUtils';

interface EditProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onSuccess: () => void;
}

export default function EditProfileDialog({
  isOpen,
  onOpenChange,
  profile,
  onSuccess
}: EditProfileDialogProps) {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalBalance, setOriginalBalance] = useState<number>(0);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setWalletBalance(profile.wallet_balance?.toString() || '0');
      setOriginalBalance(profile.wallet_balance || 0);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    setIsProcessing(true);
    
    try {
      const balanceValue = parseFloat(walletBalance);
      
      // Update profile information
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          address: address,
          wallet_balance: balanceValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      // If balance was changed, create a transaction record
      if (balanceValue !== originalBalance) {
        const difference = balanceValue - originalBalance;
        
        const { error: transactionError } = await supabase
          .from('wallet_transactions')
          .insert({
            user_id: profile.id,
            amount: Math.abs(difference),
            type: difference > 0 ? 'deposit' : 'withdrawal',
            status: 'completed',
            description: `Modification manuelle du solde par administrateur (${difference > 0 ? 'ajout' : 'retrait'})`
          });
          
        if (transactionError) {
          console.error('Error creating transaction record:', transactionError);
          // Continue anyway as the balance was already updated
        }
      }
      
      toast.success('Profil mis à jour avec succès');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Téléphone"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adresse"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="walletBalance">Solde du portefeuille (€)</Label>
            <Input
              id="walletBalance"
              type="number"
              step="0.01"
              value={walletBalance}
              onChange={(e) => setWalletBalance(e.target.value)}
              placeholder="Solde du portefeuille"
            />
            {originalBalance !== parseFloat(walletBalance || '0') && (
              <p className="text-xs text-amber-600 mt-1">
                {parseFloat(walletBalance || '0') > originalBalance 
                  ? `+${formatCurrency(parseFloat(walletBalance || '0') - originalBalance)}` 
                  : formatCurrency(parseFloat(walletBalance || '0') - originalBalance)}
                {" "}(Modification du solde)
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
