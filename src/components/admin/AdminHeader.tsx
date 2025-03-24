
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  description?: string;
  backUrl?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  title, 
  description, 
  backUrl 
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {backUrl !== undefined && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackClick}
            className="flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Retour
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
