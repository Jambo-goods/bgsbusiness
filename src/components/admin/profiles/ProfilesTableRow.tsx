
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MoreHorizontal, UserCircle, Wallet } from "lucide-react";
import { UserProfileDetail } from "./UserProfileDetail";
import AddFundsDialog from "./funds/AddFundsDialog";

interface ProfilesTableRowProps {
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    wallet_balance: number;
    investment_total: number;
    projects_count: number;
    created_at: string;
    last_active_at?: string;
  };
  onProfileUpdated: () => void;
}

export function ProfilesTableRow({ profile, onProfileUpdated }: ProfilesTableRowProps) {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isProfileDetailOpen, setIsProfileDetailOpen] = useState(false);
  
  return (
    <tr className="border-t border-gray-200">
      <td className="pl-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {profile.first_name} {profile.last_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {profile.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
        {profile.wallet_balance || 0} €
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {profile.investment_total || 0} €
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {profile.projects_count || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(profile.created_at).toLocaleDateString()}
      </td>
      <td className="pr-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsProfileDetailOpen(true)}>
              <UserCircle className="h-4 w-4 mr-2" />
              Voir le profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddFundsOpen(true)}>
              <Wallet className="h-4 w-4 mr-2" />
              Gérer les fonds
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <AddFundsDialog
          isOpen={isAddFundsOpen}
          onOpenChange={setIsAddFundsOpen}
          userId={profile.id}
          userName={`${profile.first_name} ${profile.last_name}`}
          currentBalance={profile.wallet_balance || 0}
          onClose={() => setIsAddFundsOpen(false)}
          onSuccess={onProfileUpdated}
        />
        
        <Dialog open={isProfileDetailOpen} onOpenChange={setIsProfileDetailOpen}>
          <DialogContent className="max-w-3xl">
            <UserProfileDetail 
              userId={profile.id} 
              onClose={() => setIsProfileDetailOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}
