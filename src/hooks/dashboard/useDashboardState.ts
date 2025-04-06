
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useDashboardState() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extraire le tab à partir de l'URL
  const pathParts = location.pathname.split('/');
  const tabFromPath = pathParts.length > 2 ? pathParts[2] : null;
  
  // Liste des onglets valides
  const validTabs = [
    "overview", "wallet", "yield", "investments", 
    "projects", "referrals", "profile", "notifications", "settings"
  ];
  
  // Initialiser l'état avec l'onglet de l'URL ou "overview" par défaut
  const [activeTab, setActiveTab] = useState(() => {
    return validTabs.includes(tabFromPath || "") ? tabFromPath : "overview";
  });

  // Mettre à jour l'état activeTab quand l'URL change
  useEffect(() => {
    if (tabFromPath && tabFromPath !== activeTab && validTabs.includes(tabFromPath)) {
      setActiveTab(tabFromPath);
    }
  }, [tabFromPath, activeTab]);

  // Gérer le changement d'onglet avec mise à jour de l'URL
  const handleTabChange = (tab: string) => {
    if (validTabs.includes(tab)) {
      setActiveTab(tab);
      navigate(`/dashboard/${tab}`, { replace: true });
    } else {
      console.warn(`Invalid tab: ${tab}. Defaulting to overview.`);
      setActiveTab("overview");
      navigate("/dashboard/overview", { replace: true });
    }
  };

  return {
    activeTab,
    setActiveTab: handleTabChange
  };
}
