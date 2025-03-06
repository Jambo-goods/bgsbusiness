
import React from 'react';

type AdminLog = {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  admin_id: string;
  admin_users?: {
    first_name: string | null;
    last_name: string | null;
  };
};

type AdminLogsListProps = {
  adminLogs: AdminLog[];
};

export default function AdminLogsList({ adminLogs }: AdminLogsListProps) {
  // Format date for admin logs
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format action type for display
  const formatActionType = (type: string) => {
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
              {log.admin_users?.first_name} {log.admin_users?.last_name}
            </span>
            <span className="text-sm text-gray-500">{formatDate(log.created_at)}</span>
          </div>
          <div className="text-sm mt-1">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
              {formatActionType(log.action_type)}
            </span>
            {log.description}
          </div>
        </div>
      ))}
    </div>
  );
}
