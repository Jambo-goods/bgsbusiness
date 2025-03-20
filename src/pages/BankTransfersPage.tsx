
import React, { useEffect } from "react";
import BankTransferManagement from "./admin/BankTransferManagement";
import { Toaster } from "sonner";
import { AlertTriangle } from "lucide-react";

export default function BankTransfersPage() {
  // Vérifier si l'utilisateur est connecté en tant qu'admin
  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user');
    if (!adminUser) {
      console.warn("Aucun utilisateur admin trouvé dans le localStorage");
    }
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <BankTransferManagement />
    </>
  );
}
