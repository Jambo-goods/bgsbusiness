
import { useState } from "react";
import { Thermometer, Clock, AlertCircle, BarChart4 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { calculateHeaterConsumption, calculateEnergyCost } from "@/utils/accountUtils";

const HeaterDashboard = () => {
  const [isHeaterOn, setIsHeaterOn] = useState(true);
  const [temperature, setTemperature] = useState(21);
  const [powerLevel, setPowerLevel] = useState(80);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  
  const dailyConsumption = calculateHeaterConsumption(powerLevel, isHeaterOn);
  const monthlyCost = calculateEnergyCost(dailyConsumption * 30);
  
  const handleToggleHeater = () => {
    setIsHeaterOn(!isHeaterOn);
    toast({
      title: isHeaterOn ? "Chauffage désactivé" : "Chauffage activé",
      description: isHeaterOn 
        ? "Votre chauffage a été désactivé avec succès." 
        : "Votre chauffage a été activé avec succès.",
      duration: 3000,
    });
  };

  const handleTemperatureChange = (value: number[]) => {
    setTemperature(value[0]);
  };

  const handlePowerLevelChange = (value: number[]) => {
    setPowerLevel(value[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-bgs-blue">Gestion du Chauffage</h2>
        <Badge variant={isHeaterOn ? "default" : "destructive"}>
          {isHeaterOn ? "En marche" : "Arrêté"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Thermometer className="mr-2 text-bgs-orange" />
              Contrôle de Température
            </CardTitle>
            <CardDescription>Réglez la température de votre chauffage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <span className="text-5xl font-bold text-bgs-blue">{temperature}°</span>
            </div>
            <div className="px-4">
              <Slider
                defaultValue={[temperature]}
                max={30}
                min={16}
                step={0.5}
                onValueChange={handleTemperatureChange}
                disabled={!isHeaterOn}
              />
              <div className="flex justify-between mt-2 text-sm text-bgs-blue/60">
                <span>16°C</span>
                <span>23°C</span>
                <span>30°C</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t pt-4">
            <Button variant="outline" size="sm" onClick={() => setTemperature(20)} disabled={!isHeaterOn}>
              Réinitialiser
            </Button>
            <Button
              variant={isHeaterOn ? "default" : "outline"}
              onClick={handleToggleHeater}
            >
              {isHeaterOn ? "Arrêter" : "Activer"}
            </Button>
          </CardFooter>
        </Card>

        {/* Power Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart4 className="mr-2 text-bgs-orange" />
              Niveau de Puissance
            </CardTitle>
            <CardDescription>Ajustez la puissance de votre chauffage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <span className="text-5xl font-bold text-bgs-blue">{powerLevel}%</span>
            </div>
            <div className="px-4">
              <Slider
                defaultValue={[powerLevel]}
                max={100}
                min={20}
                step={5}
                onValueChange={handlePowerLevelChange}
                disabled={!isHeaterOn}
              />
              <div className="flex justify-between mt-2 text-sm text-bgs-blue/60">
                <span>Eco</span>
                <span>Normal</span>
                <span>Max</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="w-full flex justify-between items-center">
              <span className="text-sm text-bgs-blue/80">Consommation quotidienne:</span>
              <span className="font-medium">{dailyConsumption.toFixed(1)} kWh</span>
            </div>
          </CardFooter>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 text-bgs-orange" />
              Programmation
            </CardTitle>
            <CardDescription>Configurez l'horaire de votre chauffage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <span className="font-medium">Programme automatique</span>
              <Switch 
                checked={scheduleEnabled} 
                onCheckedChange={setScheduleEnabled}
                disabled={!isHeaterOn}
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Matin (6h - 9h)</span>
                <Badge variant="outline">21°C</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Journée (9h - 17h)</span>
                <Badge variant="outline">19°C</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Soir (17h - 23h)</span>
                <Badge variant="outline">22°C</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Nuit (23h - 6h)</span>
                <Badge variant="outline">18°C</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button variant="outline" size="sm" disabled={!isHeaterOn || !scheduleEnabled}>
              Modifier
            </Button>
          </CardFooter>
        </Card>

        {/* Energy Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 text-bgs-orange" />
              Statistiques Énergétiques
            </CardTitle>
            <CardDescription>Analysez votre consommation d'énergie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Consommation journalière:</span>
                <span className="font-medium">{dailyConsumption.toFixed(1)} kWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Consommation mensuelle estimée:</span>
                <span className="font-medium">{(dailyConsumption * 30).toFixed(0)} kWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Coût mensuel estimé:</span>
                <span className="font-medium">{monthlyCost.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Émissions de CO₂:</span>
                <span className="font-medium">{(dailyConsumption * 0.1 * 30).toFixed(0)} kg/mois</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-4">
            <Button variant="outline" size="sm">
              Historique complet
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HeaterDashboard;
