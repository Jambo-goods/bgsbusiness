
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useDashboardState() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extraire le tab à partir de l'URL
  const pathParts = location.pathname.split('/');
  const tabFromPath = pathParts.length > 2 ? pathParts[2] : null;
  
  // Initialiser l'état avec l'onglet de l'URL ou "overview" par défaut
  const [activeTab, setActiveTab] = useState(() => {
    return tabFromPath || "overview";
  });

  // Mettre à jour l'état activeTab quand l'URL change
  useEffect(() => {
    if (tabFromPath && tabFromPath !== activeTab) {
      setActiveTab(tabFromPath);
    }
  }, [tabFromPath, activeTab]);

  // Gérer le changement d'onglet avec mise à jour de l'URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/dashboard/${tab}`, { replace: true });
  };

  return {
    activeTab,
    setActiveTab: handleTabChange
  };
}
