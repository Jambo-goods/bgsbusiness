
import { Flame, Thermometer, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function HeaterDashboard() {
  const [status, setStatus] = useState<"on" | "off">("on");
  const [temperature, setTemperature] = useState(22);
  const [powerLevel, setPowerLevel] = useState(65);
  
  const toggleStatus = () => {
    const newStatus = status === "on" ? "off" : "on";
    setStatus(newStatus);
    toast({
      title: `Chauffage ${newStatus === "on" ? "activé" : "désactivé"}`,
      description: `Le chauffage a été ${newStatus === "on" ? "activé" : "désactivé"} avec succès.`,
      variant: newStatus === "on" ? "default" : "destructive",
    });
  };
  
  const handleTemperatureChange = (value: number[]) => {
    setTemperature(value[0]);
    toast({
      title: "Température modifiée",
      description: `La température a été réglée à ${value[0]}°C.`,
    });
  };
  
  const handlePowerChange = (value: number[]) => {
    setPowerLevel(value[0]);
    toast({
      title: "Puissance modifiée",
      description: `La puissance a été réglée à ${value[0]}%.`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-bgs-blue">Heater</h2>
        <Badge variant={status === "on" ? "success" : "destructive"} className="flex items-center gap-1">
          {status === "on" ? (
            <>
              <CheckCircle2 size={14} />
              <span>Actif</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              <span>Inactif</span>
            </>
          )}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer size={20} />
              <span>Contrôle de température</span>
            </CardTitle>
            <CardDescription>Réglez la température souhaitée</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-4xl font-bold text-bgs-blue">{temperature}°C</span>
              </div>
              
              <div className="py-4">
                <Slider
                  defaultValue={[temperature]}
                  min={10}
                  max={30}
                  step={1}
                  onValueChange={handleTemperatureChange}
                  disabled={status === "off"}
                />
                <div className="flex justify-between mt-2 text-xs text-bgs-blue/60">
                  <span>10°C</span>
                  <span>20°C</span>
                  <span>30°C</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={toggleStatus}>
              {status === "on" ? "Désactiver" : "Activer"}
            </Button>
            <Button onClick={() => setTemperature(22)} disabled={status === "off"}>
              Réinitialiser
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame size={20} />
              <span>Niveau de puissance</span>
            </CardTitle>
            <CardDescription>Ajustez la puissance du chauffage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-4xl font-bold text-bgs-blue">{powerLevel}%</span>
              </div>
              
              <div className="py-4">
                <Slider
                  defaultValue={[powerLevel]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={handlePowerChange}
                  disabled={status === "off"}
                />
                <div className="flex justify-between mt-2 text-xs text-bgs-blue/60">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <Progress value={powerLevel} className="h-2" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant={powerLevel > 80 ? "destructive" : "outline"} 
              className="w-full"
              disabled={status === "off"}
              onClick={() => setPowerLevel(100)}
            >
              Mode Boost (100%)
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              <span>Programmation</span>
            </CardTitle>
            <CardDescription>Planifiez les périodes de chauffage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-2 border rounded">
                <div>
                  <h4 className="text-sm font-medium text-bgs-blue">Matin</h4>
                  <p className="text-xs text-bgs-blue/60">06:00 - 09:00</p>
                </div>
                <Badge>Actif</Badge>
              </div>
              
              <div className="flex justify-between items-center p-2 border rounded">
                <div>
                  <h4 className="text-sm font-medium text-bgs-blue">Soir</h4>
                  <p className="text-xs text-bgs-blue/60">17:00 - 22:00</p>
                </div>
                <Badge>Actif</Badge>
              </div>
              
              <div className="flex justify-between items-center p-2 border rounded opacity-50">
                <div>
                  <h4 className="text-sm font-medium text-bgs-blue">Après-midi</h4>
                  <p className="text-xs text-bgs-blue/60">12:00 - 14:00</p>
                </div>
                <Badge variant="outline">Inactif</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled={status === "off"}>
              Gérer la programmation
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Statistiques de consommation</CardTitle>
          <CardDescription>Consommation énergétique du chauffage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/50 p-4 rounded">
              <h4 className="text-sm font-medium text-bgs-blue mb-1">Aujourd'hui</h4>
              <p className="text-2xl font-bold text-bgs-blue">3.2 kWh</p>
              <p className="text-xs text-bgs-blue/60">Environ 0.64€</p>
            </div>
            
            <div className="bg-white/50 p-4 rounded">
              <h4 className="text-sm font-medium text-bgs-blue mb-1">Cette semaine</h4>
              <p className="text-2xl font-bold text-bgs-blue">18.7 kWh</p>
              <p className="text-xs text-bgs-blue/60">Environ 3.74€</p>
            </div>
            
            <div className="bg-white/50 p-4 rounded">
              <h4 className="text-sm font-medium text-bgs-blue mb-1">Ce mois-ci</h4>
              <p className="text-2xl font-bold text-bgs-blue">78.4 kWh</p>
              <p className="text-xs text-bgs-blue/60">Environ 15.68€</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
