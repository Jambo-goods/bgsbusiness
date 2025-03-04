
import React from "react";
import { 
  UserCheck, 
  Building2, 
  HandCoins, 
  ChartBar, 
  ArrowDownToLine, 
  CircleArrowUp
} from "lucide-react";
import InfoSection from "@/components/ui/InfoSection";

export default function InvestmentProcess() {
  // Steps for the investment process
  const investmentSteps = [
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
    {
      title: "Suivi des rendements",
      description: "Consultez régulièrement les performances de vos investissements depuis votre tableau de bord.",
      icon: <ChartBar size={32} />,
    },
    {
      title: "Perception des revenus",
      description: "Recevez mensuellement votre part des bénéfices générés par les actifs financés.",
      icon: <ArrowDownToLine size={32} />,
    },
    {
      title: "Retrait des bénéfices",
      description: "Retirez vos bénéfices quand vous le souhaitez par virement bancaire.",
      icon: <CircleArrowUp size={32} />,
    },
  ];

  return (
    <InfoSection
      title="Processus d'investissement"
      subtitle="Un parcours simple en 6 étapes pour investir et percevoir vos rendements"
      steps={investmentSteps}
    />
  );
}
