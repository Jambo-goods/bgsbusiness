
import React from "react";
import AdminLogsList from "@/components/admin/dashboard/AdminLogsList";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import { AdminLog } from "@/hooks/admin/types";

interface ActivitySectionProps {
  adminLogs: AdminLog[];
  isLoading: boolean;
}

export default function ActivitySection({ adminLogs, isLoading }: ActivitySectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-bgs-blue mb-4">
          Actions récentes
        </h2>
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="py-3">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <AdminLogsList adminLogs={adminLogs} />
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-bgs-blue mb-4">
          Actions rapides
        </h2>
        <QuickActions />
      </div>
    </div>
  );
}
