
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-10 border rounded-md">
      <p className="text-muted-foreground">Aucun parrainage trouvé dans la base de données</p>
    </div>
  );
};

export default EmptyState;
