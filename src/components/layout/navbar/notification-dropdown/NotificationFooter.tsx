
import React from "react";
import { Link } from "react-router-dom";

export default function NotificationFooter() {
  return (
    <Link 
      to="/dashboard?tab=notifications" 
      className="block w-full text-center text-sm text-bgs-blue hover:text-bgs-blue-dark mt-3 font-medium transition-colors"
    >
      Voir toutes les notifications
    </Link>
  );
}
