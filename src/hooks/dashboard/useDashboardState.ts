
import { useState } from "react";

export function useDashboardState() {
  const [activeTab, setActiveTab] = useState("overview");

  return {
    activeTab,
    setActiveTab
  };
}
