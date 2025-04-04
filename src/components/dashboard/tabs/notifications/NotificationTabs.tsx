
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
    <TabsList className="grid w-full grid-cols-2 max-w-[200px] p-1 bg-gray-100 rounded-md">
      <TabsTrigger 
        value="all" 
        onClick={() => onFilterChange('all')}
        data-state={filter === 'all' ? 'active' : 'inactive'}
        className={`rounded-md transition-all ${
          filter === 'all' 
            ? 'bg-bgs-blue text-white shadow-md' 
            : 'hover:bg-gray-200'
        }`}
      >
        Toutes ({totalCount})
      </TabsTrigger>
      <TabsTrigger 
        value="unread" 
        onClick={() => onFilterChange('unread')}
        data-state={filter === 'unread' ? 'active' : 'inactive'}
        className={`rounded-md transition-all ${
          filter === 'unread' 
            ? 'bg-bgs-blue text-white shadow-md' 
            : 'hover:bg-gray-200'
        }`}
        disabled={unreadCount === 0}
      >
        Non lues ({unreadCount})
      </TabsTrigger>
    </TabsList>
  );
}
