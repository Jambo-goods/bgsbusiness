
import React from 'react';
import { Card } from "@/components/ui/card";
import { ProfilesTableRow } from './ProfilesTableRow';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  wallet_balance: number;
  investment_total: number;
  projects_count: number;
  created_at: string;
  last_active_at?: string;
}

interface ProfilesTableProps {
  profiles: Profile[];
  isLoading: boolean;
  filteredProfiles: Profile[];
  onProfileUpdated?: () => void;
}

export default function ProfilesTable({ 
  profiles, 
  isLoading, 
  filteredProfiles,
  onProfileUpdated = () => {} 
}: ProfilesTableProps) {
  const displayProfiles = filteredProfiles.length > 0 ? filteredProfiles : profiles;
  
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="pl-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Solde
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Investissement
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projets
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Création
              </th>
              <th scope="col" className="relative pl-6 pr-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayProfiles.map((profile) => (
              <ProfilesTableRow 
                key={profile.id} 
                profile={profile} 
                onProfileUpdated={onProfileUpdated}
              />
            ))}
            
            {displayProfiles.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun profil trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
