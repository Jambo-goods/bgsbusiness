
import { Button } from "@/components/ui/button";
import { Globe, Languages } from "lucide-react";

interface LanguageSectionProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function LanguageSection({ selectedLanguage, onLanguageChange }: LanguageSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="text-bgs-blue" size={20} />
        <h3 className="text-lg font-medium text-bgs-blue">Langue</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button 
          variant={selectedLanguage === "fr" ? "default" : "outline"}
          className={selectedLanguage === "fr" ? "bg-bgs-blue text-white" : ""}
          onClick={() => onLanguageChange("fr")}
        >
          <Languages className="mr-2 h-4 w-4" />
          Français
        </Button>
        <Button 
          variant={selectedLanguage === "en" ? "default" : "outline"}
          className={selectedLanguage === "en" ? "bg-bgs-blue text-white" : ""}
          onClick={() => onLanguageChange("en")}
        >
          <Languages className="mr-2 h-4 w-4" />
          English
        </Button>
        <Button 
          variant={selectedLanguage === "es" ? "default" : "outline"}
          className={selectedLanguage === "es" ? "bg-bgs-blue text-white" : ""}
          onClick={() => onLanguageChange("es")}
        >
          <Languages className="mr-2 h-4 w-4" />
          Español
        </Button>
      </div>
    </div>
  );
}
