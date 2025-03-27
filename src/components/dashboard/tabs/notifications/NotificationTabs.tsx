
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
        data-state={filter === 'all' ? 'active' : 'inactive'}
        className={filter === 'all' ? 'data-[state=active]:bg-bgs-blue text-white' : ''}
      >
        Toutes ({totalCount})
      </TabsTrigger>
      <TabsTrigger 
        value="unread" 
        onClick={() => onFilterChange('unread')}
        data-state={filter === 'unread' ? 'active' : 'inactive'}
        className={filter === 'unread' ? 'data-[state=active]:bg-bgs-blue text-white' : ''}
        disabled={unreadCount === 0}
      >
        Non lues ({unreadCount})
      </TabsTrigger>
    </TabsList>
  );
}
