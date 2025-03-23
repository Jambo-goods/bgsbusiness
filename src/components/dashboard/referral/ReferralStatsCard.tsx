
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralStatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  loading?: boolean;
  highlighted?: boolean;
}

const ReferralStatsCard: React.FC<ReferralStatsCardProps> = ({
  icon,
  title,
  value,
  description,
  loading = false,
  highlighted = false,
}) => {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${highlighted ? "border-primary/50 shadow-sm" : "border-gray-200"}`}>
      <div className={`h-1 ${highlighted ? "bg-gradient-to-r from-blue-500 to-indigo-600" : "bg-gray-100"}`}></div>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            {icon}
            <span>{title}</span>
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className={`text-2xl font-bold ${highlighted ? "text-blue-600" : ""}`}>
              {value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralStatsCard;
