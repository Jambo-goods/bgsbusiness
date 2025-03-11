
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import EmailTest from "@/components/admin/EmailTest";

export default function EmailTestPage() {
  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Test des notifications email</h1>
        </div>
        
        <EmailTest />
      </div>
    </AdminLayout>
  );
}
