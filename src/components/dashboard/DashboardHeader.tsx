
import { useState } from "react";

interface DashboardHeaderProps {
  userData: {
    firstName: string;
    lastName: string;
  };
}

export default function DashboardHeader({ userData }: DashboardHeaderProps) {
  return (
    <header className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h1 className="text-2xl font-bold text-bgs-blue">
        Bonjour, {userData.firstName} {userData.lastName}
      </h1>
      <p className="text-bgs-gray-medium mt-1">
        Bienvenue sur votre tableau de bord BGS Business Club
      </p>
    </header>
  );
}
