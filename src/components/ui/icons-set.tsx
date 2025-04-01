
import React from 'react';
import { 
  Bell, Calendar, ChevronDown, ChevronLeft, ChevronRight, Check, 
  CreditCard, Download, ExternalLink, File, FileText, Home, Info, 
  Link, Loader2, LogOut, Mail, Menu, MessageSquare, MoreHorizontal, 
  MoreVertical, Package, Paperclip, Pencil, Plus, RefreshCw, Search, 
  Send, Settings, Share, ShoppingCart, Star, Trash, Trash2, User, 
  X, AlertCircle, Banknote
} from 'lucide-react';

export const Icons = {
  logo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
      <path d="M17 8.5a2.5 2.5 0 0 0 2.5 -2.5a2.5 2.5 0 1 0 -2.5 2.5" />
    </svg>
  ),
  user: User,
  login: LogOut,
  alert: AlertCircle,
  bell: Bell,
  calendar: Calendar,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  check: Check,
  creditCard: CreditCard,
  download: Download,
  externalLink: ExternalLink,
  file: File,
  fileText: FileText,
  home: Home,
  info: Info,
  link: Link,
  loader: Loader2,
  logout: LogOut,
  mail: Mail,
  menu: Menu,
  messageSquare: MessageSquare,
  moreHorizontal: MoreHorizontal,
  moreVertical: MoreVertical,
  package: Package,
  paperclip: Paperclip,
  pencil: Pencil,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  send: Send,
  settings: Settings,
  share: Share,
  shoppingCart: ShoppingCart,
  star: Star,
  trash: Trash,
  trash2: Trash2,
  x: X,
  banknote: Banknote,
};
