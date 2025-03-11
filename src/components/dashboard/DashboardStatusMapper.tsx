
import React from "react";

interface DashboardStatusMapperProps {
  pollingStatus: 'active' | 'disabled' | 'error';
}

export default function DashboardStatusMapper({ pollingStatus }: DashboardStatusMapperProps): 'connected' | 'connecting' | 'error' {
  const pollingStatusMap: Record<'active' | 'disabled' | 'error', 'connected' | 'connecting' | 'error'> = {
    'active': 'connected',
    'disabled': 'connecting',
    'error': 'error'
  };
  
  return pollingStatusMap[pollingStatus] || 'connecting';
}
