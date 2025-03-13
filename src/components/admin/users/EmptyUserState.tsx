
import React from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyUserStateProps {
  onCreateUser: () => void;
}

export default function EmptyUserState({ onCreateUser }: EmptyUserStateProps) {
  return (
    <div className="text-center p-8 text-gray-500">
      Aucun utilisateur trouvé dans la base de données.
      <div className="mt-4">
        <Button
          onClick={onCreateUser}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Créer un premier utilisateur test
        </Button>
      </div>
    </div>
  );
}
