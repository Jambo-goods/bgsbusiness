
import React from "react";
import BankTransferManagement from "./admin/BankTransferManagement";
import { Helmet } from "react-helmet-async";
import { Toaster } from "sonner";

export default function BankTransfersPage() {
  return (
    <>
      <Helmet>
        <title>Gestion des Virements | Administration</title>
      </Helmet>
      <Toaster position="top-right" richColors closeButton />
      <BankTransferManagement />
    </>
  );
}
