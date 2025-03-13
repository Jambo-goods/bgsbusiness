
import React from "react";
import { AdminStats } from "@/hooks/admin/types";
import DashboardStats from "./DashboardStats";

interface DashboardGridProps {
  stats: AdminStats;
  isLoading: boolean;
  children?: React.ReactNode;
}

export default function DashboardGrid({ stats, isLoading, children }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardStats stats={stats} isLoading={isLoading} />
      {children}
    </div>
  );
}
