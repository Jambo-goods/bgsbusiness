
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ArrowLeft, ArrowUp, ArrowDown, 
  CreditCard, Lock, Info, AlertCircle,
  CheckCircle, XCircle, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

export function UserDetailsPanel({ user, onClose, onAddFunds, onWithdrawFunds }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addFundsAmount, setAddFundsAmount] = useState(0);
  const [addFundsDescription, setAddFundsDescription] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawDescription, setWithdrawDescription] = useState('');
  const [isAdmin2FAOpen, setIsAdmin2FAOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [actionType, setActionType] = useState<'deposit' | 'withdrawal' | null>(null);
  const [actionAmount, setActionAmount] = useState(0);
  const [actionDescription, setActionDescription] = useState('');

  useEffect(() => {
    fetchUserTransactions();
  }, [user.id]);

  const fetchUserTransactions = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setTransactions(data || []);
      
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      toast.error("Erreur lors du chargement des transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: fr });
    } catch (error) {
      console.error("Invalid date:", dateString);
      return 'Date invalide';
    }
  };

  const handleAdminAction = (type: 'deposit' | 'withdrawal', amount: number, description: string) => {
    setActionType(type);
    setActionAmount(amount);
    setActionDescription(description);
    setIsAdmin2FAOpen(true);
  };

  const handleVerifyAdminAction = () => {
    // In a real app, this would verify the admin's password
    // For now, we'll just check if any password is provided
    if (!adminPassword) {
      toast.error("Veuillez entrer votre mot de passe");
      return;
    }
    
    if (actionType === 'deposit') {
      onAddFunds(user.id, actionAmount, actionDescription);
    } else if (actionType === 'withdrawal') {
      onWithdrawFunds(user.id, actionAmount, actionDescription);
    }
    
    // Reset form
    setAdminPassword('');
    setIsAdmin2FAOpen(false);
    setActionType(null);
    setActionAmount(0);
    setActionDescription('');
  };

  const getTransactionStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Complété
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            En attente
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Échoué
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Back button */}
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClose}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <h2 className="ml-4 text-lg font-semibold">
          Détails du compte: {user.first_name} {user.last_name}
        </h2>
      </div>
      
      {/* User details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-bgs-blue" />
            Informations personnelles
          </h3>
          <div className="space-y-2">
            <div>
              <div className="text-sm text-gray-500">Nom</div>
              <div className="font-medium">{user.first_name} {user.last_name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">ID</div>
              <div className="font-medium text-xs truncate">{user.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Dernière connexion</div>
              <div className="font-medium">{formatDate(user.last_active_at) || 'Jamais'}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            Informations financières
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Solde actuel</div>
              <div className="text-2xl font-bold text-green-600">{(user.wallet_balance || 0).toLocaleString()} €</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Projets</div>
                <div className="font-medium">{user.investments?.length || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total investi</div>
                <div className="font-medium">{(user.investment_total || 0).toLocaleString()} €</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-bgs-blue" />
            Actions administratives
          </h3>
          
          <div className="space-y-4">
            {/* Add funds form */}
            <div>
              <label className="text-sm text-gray-500 block mb-1">Ajouter des fonds</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(parseInt(e.target.value))}
                  placeholder="Montant (€)"
                  className="w-full"
                />
                <Button
                  onClick={() => handleAdminAction('deposit', addFundsAmount, addFundsDescription)}
                  className="whitespace-nowrap bg-green-600 hover:bg-green-700"
                  disabled={!addFundsAmount || addFundsAmount <= 0}
                >
                  <ArrowUp className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <Textarea
                value={addFundsDescription}
                onChange={(e) => setAddFundsDescription(e.target.value)}
                placeholder="Description (optionnelle)"
                className="mt-2 text-sm"
              />
            </div>
            
            <div className="border-t pt-4">
              <label className="text-sm text-gray-500 block mb-1">Retirer des fonds</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max={user.wallet_balance || 0}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(parseInt(e.target.value))}
                  placeholder="Montant (€)"
                  className="w-full"
                />
                <Button
                  onClick={() => handleAdminAction('withdrawal', withdrawAmount, withdrawDescription)}
                  className="whitespace-nowrap bg-orange-600 hover:bg-orange-700"
                  disabled={!withdrawAmount || withdrawAmount <= 0 || withdrawAmount > (user.wallet_balance || 0)}
                >
                  <ArrowDown className="w-4 h-4 mr-1" />
                  Retirer
                </Button>
              </div>
              <Textarea
                value={withdrawDescription}
                onChange={(e) => setWithdrawDescription(e.target.value)}
                placeholder="Description (optionnelle)"
                className="mt-2 text-sm"
              />
              {withdrawAmount > (user.wallet_balance || 0) && (
                <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Le montant dépasse le solde disponible
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Transactions history */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Historique des transactions</h3>
        
        {isLoading ? (
          <div className="py-10 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-bgs-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500">Aucune transaction trouvée pour cet utilisateur</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {transaction.type === 'deposit' ? (
                          <>
                            <ArrowUp className="w-4 h-4 text-green-600" />
                            <span>Dépôt</span>
                          </>
                        ) : (
                          <>
                            <ArrowDown className="w-4 h-4 text-orange-600" />
                            <span>Retrait</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={`font-semibold ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString()} €
                    </TableCell>
                    <TableCell>{transaction.description || '-'}</TableCell>
                    <TableCell>{getTransactionStatusBadge(transaction.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* Admin verification dialog */}
      <Dialog open={isAdmin2FAOpen} onOpenChange={setIsAdmin2FAOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vérification Administrateur</DialogTitle>
            <DialogDescription>
              Pour des raisons de sécurité, veuillez entrer votre mot de passe pour confirmer cette action.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-700 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-700">Détails de l'opération</h4>
                <p className="text-sm text-blue-600">
                  {actionType === 'deposit' ? 'Ajout' : 'Retrait'} de {actionAmount.toLocaleString()} € 
                  sur le compte de {user.first_name} {user.last_name}
                </p>
              </div>
            </div>
            
            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium mb-1">
                Mot de passe administrateur
              </label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdmin2FAOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleVerifyAdminAction}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
