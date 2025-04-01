
import React from 'react';
import { AdminLog } from '@/hooks/admin/types';

type AdminLogsListProps = {
  adminLogs: AdminLog[];
};

export default function AdminLogsList({ adminLogs }: AdminLogsListProps) {
  // Format date for admin logs
  const formatDate = (dateString: string | Date) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format action type for display
  const formatActionType = (type: string | undefined) => {
    if (!type) return 'Action';
    
    const typeMap: Record<string, string> = {
      'login': 'Connexion',
      'user_management': 'Gestion utilisateur',
      'project_management': 'Gestion projet',
      'wallet_management': 'Gestion portefeuille',
      'withdrawal_management': 'Gestion retrait'
    };
    
    return typeMap[type] || type;
  };

  if (adminLogs.length === 0) {
    return <p className="text-gray-500 text-center py-4">Aucune action récente</p>;
  }

  return (
    <div className="divide-y">
      {adminLogs.map((log) => (
        <div key={log.id} className="py-3">
          <div className="flex justify-between">
            <span className="font-medium text-bgs-blue">
              {log.admin?.first_name} {log.admin?.last_name}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(log.timestamp || log.created_at || new Date())}
            </span>
          </div>
          <div className="text-sm mt-1">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
              {formatActionType(log.action_type || log.action)}
            </span>
            {log.description}
          </div>
        </div>
      ))}
    </div>
  );
}
