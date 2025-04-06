
import React from 'react';

interface ProfileTabProps {
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
  };
}

export default function ProfileTab({ userData = {} }: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mon Profil</h1>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nom</h3>
            <p className="mt-1">{userData?.firstName || ''} {userData?.lastName || ''}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1">{userData?.email || ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
