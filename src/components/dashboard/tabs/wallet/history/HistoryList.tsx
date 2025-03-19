
import React from "react";
import HistoryItem, { HistoryItemType } from "./HistoryItem";
import EmptyState from "./EmptyState";

interface HistoryListProps {
  items: HistoryItemType[];
}

export default function HistoryList({ items }: HistoryListProps) {
  if (items.length === 0) {
    return <EmptyState />;
  }

  // Créer un mapping des références pour identifier les transactions et notifications liées
  const refMapping: Record<string, HistoryItemType[]> = {};
  
  // Première passe: grouper les éléments par référence
  items.forEach(item => {
    let ref = null;
    
    // Extraire la référence selon le type d'élément
    if (item.itemType === 'transaction' && item.description) {
      const match = item.description.match(/DEP-\d+/);
      ref = match ? match[0] : null;
    } else if (item.itemType === 'notification' && item.type === 'deposit' && item.description) {
      const match = item.description.match(/DEP-\d+/);
      ref = match ? match[0] : null;
    }
    
    // Si on a trouvé une référence, l'ajouter au mapping
    if (ref) {
      if (!refMapping[ref]) {
        refMapping[ref] = [];
      }
      refMapping[ref].push(item);
    }
  });
  
  // Filtrer les éléments pour éviter les doublons
  const filteredItems = items.filter(item => {
    // Les demandes de retrait doivent toujours être affichées
    if (item.itemType === 'notification' && item.type === 'withdrawal') {
      return true;
    }
    
    // Cas 1: L'élément n'a pas de référence DEP-XXXXX, on le garde toujours
    let ref = null;
    
    if (item.itemType === 'transaction' && item.description) {
      const match = item.description.match(/DEP-\d+/);
      ref = match ? match[0] : null;
    } else if (item.itemType === 'notification' && item.type === 'deposit' && item.description) {
      const match = item.description.match(/DEP-\d+/);
      ref = match ? match[0] : null;
    }
    
    // Si pas de référence, on garde l'élément
    if (!ref) {
      return true;
    }
    
    // Si cet élément a une référence, on vérifie s'il fait partie d'un groupe
    const group = refMapping[ref];
    if (!group || group.length <= 1) {
      return true; // Pas de groupe ou un seul élément, on garde
    }
    
    // Pour les groupes: on garde seulement la transaction (pas la notification)
    // Si pas de transaction dans le groupe, on garde alors la notification la plus récente
    const hasTransaction = group.some(grpItem => grpItem.itemType === 'transaction');
    
    if (hasTransaction) {
      // Si c'est une transaction, on la garde
      if (item.itemType === 'transaction') {
        return true;
      }
      // Sinon c'est une notification et on l'ignore car on a déjà la transaction
      return false;
    } else {
      // Pas de transaction, on garde uniquement la notification la plus récente
      // (celle qui a la date la plus récente, donc la première dans le groupe trié)
      const sortedGroup = [...group].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return item.id === sortedGroup[0].id;
    }
  });

  return (
    <div className="space-y-4">
      {filteredItems.map((item) => (
        <HistoryItem key={item.id} item={item} />
      ))}
    </div>
  );
}
