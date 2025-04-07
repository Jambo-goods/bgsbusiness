
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenuDropdown } from "./UserMenuDropdown";
import { NotificationDropdown } from "./NotificationDropdown";
import { DashboardMenuDropdown } from "./DashboardMenuDropdown";

export default function NavbarActions() {
  const { user } = useAuth();
  
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <DashboardMenuDropdown />
        <UserMenuDropdown />
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <Link to="/login">
        <Button variant="ghost" className="text-bgs-blue hover:text-bgs-orange hover:bg-transparent">
          Se connecter
        </Button>
      </Link>
    </div>
  );
}
