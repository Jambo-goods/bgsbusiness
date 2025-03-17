
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  User,
  LogOut,
  Settings,
  CreditCard,
  BarChart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface UserMenuDropdownProps {
  handleSignOut: () => Promise<void>;
}

export default function UserMenuDropdown({ handleSignOut }: UserMenuDropdownProps) {
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        
        if (authData.session) {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("first_name, last_name, email")
            .eq("id", authData.session.user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            return;
          }

          if (profileData) {
            setUserData({
              firstName: profileData.first_name || "",
              lastName: profileData.last_name || "",
              email: profileData.email || authData.session.user.email || "",
            });
          }
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const getInitials = () => {
    if (!userData) return "U";
    
    const first = userData.firstName?.[0] || "";
    const last = userData.lastName?.[0] || "";
    
    return (first + last).toUpperCase() || "U";
  };

  const getFullName = () => {
    if (!userData) return "Utilisateur";
    return `${userData.firstName} ${userData.lastName}`.trim() || "Utilisateur";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-bgs-blue text-white">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{getFullName()}</p>
            <p className="text-xs text-gray-500 truncate">{userData?.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <BarChart className="mr-2 h-4 w-4" />
          <span>Tableau de bord</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate("/dashboard?tab=profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Mon profil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate("/dashboard?tab=wallet")}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Portefeuille</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate("/dashboard?tab=settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
