
import { useState } from "react";
import { PersonalInfoForm } from "./profile/PersonalInfoForm";
import { SecuritySection } from "./profile/SecuritySection";
import { NotificationPreferences } from "./profile/NotificationPreferences";

interface ProfileTabProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

export default function ProfileTab({ userData }: ProfileTabProps) {
  const [securityLevel] = useState(70);
  const [notifications] = useState({
    email: true,
    sms: false,
    app: true,
    marketing: false
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-bgs-blue mb-4">Informations personnelles</h2>
        <PersonalInfoForm userData={userData} />
      </div>
      
      <SecuritySection securityLevel={securityLevel} />
      
      <NotificationPreferences initialSettings={notifications} />
    </div>
  );
}
