
import React from "react";
import { Separator } from "@/components/ui/separator";
import { History } from "lucide-react";

export default function WalletHistory() {
  // This is a placeholder component that can be expanded in the future
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-bgs-blue" />
        <h2 className="text-lg font-semibold text-bgs-blue">Historique des transactions</h2>
      </div>
      
      <Separator className="my-4" />
      
      <p className="text-center py-6 text-bgs-gray-medium">
        Aucune transaction récente à afficher
      </p>
    </div>
  );
}
