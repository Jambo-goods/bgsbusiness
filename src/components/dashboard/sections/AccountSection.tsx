
import React from "react";
import { User, CreditCard, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export default function AccountSection() {
  return (
    <div className="mb-6 space-y-1">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Mon compte
      </h2>

      <Link
        to="/dashboard/account/profile"
        className="flex items-center py-2 px-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-bgs-blue rounded-md transition-colors"
      >
        <span className="mr-3 text-gray-400">
          <User size={18} />
        </span>
        Profil
      </Link>

      <Link
        to="/dashboard/account/bank"
        className="flex items-center py-2 px-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-bgs-blue rounded-md transition-colors"
      >
        <span className="mr-3 text-gray-400">
          <CreditCard size={18} />
        </span>
        Coordonnées bancaires
      </Link>

      <Link
        to="/auth/logout"
        className="flex items-center py-2 px-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
      >
        <span className="mr-3 text-gray-400">
          <LogOut size={18} />
        </span>
        Déconnexion
      </Link>
    </div>
  );
}
