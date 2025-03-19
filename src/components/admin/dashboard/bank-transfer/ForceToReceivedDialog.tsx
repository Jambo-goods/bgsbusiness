
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Hammer } from "lucide-react";
import { BankTransferItem } from "../types/bankTransfer";

interface ForceToReceivedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onForce: () => void;
  item: BankTransferItem;
  userName: string;
}

export function ForceToReceivedDialog({
  open,
  onOpenChange,
  onForce,
  item,
  userName
}: ForceToReceivedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Forcer le statut à "Reçu"</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-md bg-red-50 p-4 border border-red-200 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">ATTENTION - Action critique</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Cette action va <strong>forcer</strong> le statut du virement à "Reçu", ignorer les validations standard, 
                    et recalculer manuellement le solde du portefeuille de l'utilisateur.
                  </p>
                  <p className="mt-1">
                    À utiliser uniquement lorsque les autres méthodes échouent et que le statut reste bloqué.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Virement de <strong>{item.amount}€</strong> pour <strong>{userName}</strong>
          </p>
          
          <div className="bg-yellow-50 p-3 border border-yellow-200 rounded-md text-sm text-yellow-800 mb-4">
            <p><strong>Fonctionnement:</strong> Cette opération contourne les triggers de base de données et effectue:</p>
            <ol className="list-decimal pl-5 mt-1 text-xs">
              <li>Un recalcul direct du solde du portefeuille de l'utilisateur</li>
              <li>Une mise à jour forcée du statut via plusieurs méthodes</li>
              <li>La création d'une notification pour l'utilisateur</li>
            </ol>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            variant="destructive"
            onClick={onForce}
          >
            <Hammer className="h-4 w-4 mr-1" />
            Forcer le changement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
