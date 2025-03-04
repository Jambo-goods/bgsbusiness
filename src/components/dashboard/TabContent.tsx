
import React from "react";
import { Project } from "@/types/project";
import Overview from "./Overview";
import Investments from "./Investments";
import Settings from "./Settings";
import WalletTab from "./tabs/WalletTab";
import CapitalTab from "./tabs/CapitalTab";
import YieldTab from "./tabs/YieldTab";
import ActiveListTab from "./tabs/ActiveListTab";
import HistoryTab from "./tabs/HistoryTab";
import TransfersTab from "./tabs/TransfersTab";

interface TabContentProps {
  activeTab: string;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    investmentTotal: number;
    projectsCount: number;
  };
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
}

export default function TabContent({ activeTab, userData, userInvestments, setActiveTab }: TabContentProps) {
  switch(activeTab) {
    case "overview":
      return (
        <Overview 
          userData={userData} 
          userInvestments={userInvestments} 
          setActiveTab={setActiveTab} 
        />
      );
    case "investments":
      return <Investments userInvestments={userInvestments} />;
    case "settings":
      return <Settings userData={userData} />;
    case "wallet":
      return <WalletTab />;
    case "capital":
      return <CapitalTab investmentTotal={userData.investmentTotal} />;
    case "yield":
      return <YieldTab />;
    case "activeList":
      return <ActiveListTab userInvestments={userInvestments} />;
    case "history":
      return <HistoryTab />;
    case "transfers":
      return <TransfersTab userData={userData} />;
    default:
      return (
        <Overview 
          userData={userData} 
          userInvestments={userInvestments} 
          setActiveTab={setActiveTab} 
        />
      );
  }
}
