
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

interface ThemeSectionProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
}

export default function ThemeSection({ selectedTheme, onThemeChange }: ThemeSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sun className="text-bgs-blue" size={20} />
        <h3 className="text-lg font-medium text-bgs-blue">Thème</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button 
          variant={selectedTheme === "light" ? "default" : "outline"}
          className={selectedTheme === "light" ? "bg-bgs-blue text-white" : ""}
          onClick={() => onThemeChange("light")}
        >
          <Sun className="mr-2 h-4 w-4" />
          Clair
        </Button>
        <Button 
          variant={selectedTheme === "dark" ? "default" : "outline"}
          className={selectedTheme === "dark" ? "bg-bgs-blue text-white" : ""}
          onClick={() => onThemeChange("dark")}
        >
          <Moon className="mr-2 h-4 w-4" />
          Sombre
        </Button>
        <Button 
          variant={selectedTheme === "system" ? "default" : "outline"}
          className={selectedTheme === "system" ? "bg-bgs-blue text-white" : ""}
          onClick={() => onThemeChange("system")}
        >
          <div className="mr-2 relative w-4 h-4">
            <Sun className="absolute h-4 w-4 opacity-50" />
            <Moon className="absolute h-4 w-4 opacity-50" />
          </div>
          Système
        </Button>
      </div>
    </div>
  );
}
