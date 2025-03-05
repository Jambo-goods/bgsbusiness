
import { History } from "lucide-react";
import SidebarNavItem from "../SidebarNavItem";

interface TransactionsSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  expanded: boolean;
}

export default function TransactionsSection({ activeTab, setActiveTab, expanded }: TransactionsSectionProps) {
  const navItems = [
    { id: "history", label: "Historique", icon: History },
  ];

  return (
    <>
      {navItems.map((item) => (
        <SidebarNavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          isActive={activeTab === item.id}
          expanded={expanded}
          onClick={() => setActiveTab(item.id)}
        />
      ))}
    </>
  );
}
