
import React from "react";

interface NotificationDropdownProps {
  isOpen: boolean;
}

export default function NotificationDropdown({ isOpen }: NotificationDropdownProps) {
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 p-4 border border-gray-100 animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-bgs-blue">Notifications</h3>
        <span className="text-xs bg-bgs-orange/10 text-bgs-orange px-2 py-0.5 rounded-full font-medium">3 nouvelles</span>
      </div>
      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        <div className="py-3 hover:bg-gray-50 cursor-pointer rounded-md px-3 transition-colors">
          <p className="text-sm font-medium text-bgs-blue">Nouvel investissement disponible</p>
          <p className="text-xs text-gray-500 mt-0.5">Il y a 20 minutes</p>
        </div>
        <div className="py-3 hover:bg-gray-50 cursor-pointer rounded-md px-3 transition-colors">
          <p className="text-sm font-medium text-bgs-blue">Rendement mis à jour</p>
          <p className="text-xs text-gray-500 mt-0.5">Il y a 2 heures</p>
        </div>
        <div className="py-3 hover:bg-gray-50 cursor-pointer rounded-md px-3 transition-colors">
          <p className="text-sm font-medium text-bgs-blue">Paiement reçu</p>
          <p className="text-xs text-gray-500 mt-0.5">Il y a 1 jour</p>
        </div>
      </div>
      <button className="w-full text-center text-sm text-bgs-blue hover:text-bgs-blue-dark mt-3 font-medium transition-colors">
        Voir toutes les notifications
      </button>
    </div>
  );
}
