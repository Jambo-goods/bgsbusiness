
import React from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ActionButtonsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  refreshBalance?: () => Promise<void>;
}

export default function ActionButtons({
  onDeposit,
  onWithdraw,
  refreshBalance
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2 mt-4">
      {/* No buttons here anymore */}
    </div>
  );
}
