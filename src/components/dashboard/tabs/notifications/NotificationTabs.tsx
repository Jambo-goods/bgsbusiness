
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationTabsProps {
  totalCount: number;
  unreadCount: number;
  filter: 'all' | 'unread';
  onFilterChange: (filter: 'all' | 'unread') => void;
}

export default function NotificationTabs({ 
  totalCount, 
  unreadCount, 
  filter, 
  onFilterChange 
}: NotificationTabsProps) {
  return (
    <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
      <TabsTrigger 
        value="all" 
        onClick={() => onFilterChange('all')}
      >
        Toutes ({totalCount})
      </TabsTrigger>
      <TabsTrigger 
        value="unread" 
        onClick={() => onFilterChange('unread')}
        disabled={unreadCount === 0}
      >
        Non lues ({unreadCount})
      </TabsTrigger>
    </TabsList>
  );
}
