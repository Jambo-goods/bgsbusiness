
import { UserCheck, Building2, HandCoins } from "lucide-react";
import InfoSection from "@/components/ui/InfoSection";

export default function HowItWorksSection() {
  // How it works steps
  const howItWorksSteps = [
    {
      title: "Inscription & Dépôt",
      description: "Créez votre compte et effectuez un dépôt par virement bancaire pour commencer à investir.",
      icon: <UserCheck size={32} />,
    },
    {
      title: "Choisissez un projet",
      description: "Parcourez les différents projets disponibles et sélectionnez celui qui correspond à vos objectifs.",
      icon: <Building2 size={32} />,
    },
    {
      title: "Investissez",
      description: "Définissez le montant que vous souhaitez investir et confirmez votre participation au projet.",
      icon: <HandCoins size={32} />,
    },
  ];

  return (
    <InfoSection
      title="Comment ça marche"
      subtitle="Un processus simple pour investir et générer des rendements"
      steps={howItWorksSteps}
    />
  );
}
