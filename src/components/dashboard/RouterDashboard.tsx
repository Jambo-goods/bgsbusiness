
import { Wifi, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function RouterDashboard() {
  const [status, setStatus] = useState<"online" | "offline">("online");
  const [bandwidth, setBandwidth] = useState(65);
  const [devices, setDevices] = useState(7);
  
  const toggleStatus = () => {
    const newStatus = status === "online" ? "offline" : "online";
    setStatus(newStatus);
    toast({
      title: `Router ${newStatus === "online" ? "activé" : "désactivé"}`,
      description: `Le router a été ${newStatus === "online" ? "activé" : "désactivé"} avec succès.`,
      variant: newStatus === "online" ? "default" : "destructive",
    });
  };
  
  const restartRouter = () => {
    setStatus("offline");
    toast({
      title: "Redémarrage en cours",
      description: "Le router est en train de redémarrer. Cela peut prendre quelques secondes.",
    });
    
    setTimeout(() => {
      setStatus("online");
      toast({
        title: "Redémarrage terminé",
        description: "Le router a été redémarré avec succès.",
        variant: "default",
      });
    }, 3000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-bgs-blue">Router</h2>
        <Badge variant={status === "online" ? "success" : "destructive"} className="flex items-center gap-1">
          {status === "online" ? (
            <>
              <CheckCircle2 size={14} />
              <span>En ligne</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              <span>Hors ligne</span>
            </>
          )}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi size={20} />
              <span>État du router</span>
            </CardTitle>
            <CardDescription>Supervisez l'état actuel de votre router</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-bgs-blue/70">Utilisation de la bande passante</span>
                  <span className="text-sm font-medium text-bgs-blue">{bandwidth}%</span>
                </div>
                <Progress value={bandwidth} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-bgs-blue/70">Appareils connectés</span>
                  <span className="text-sm font-medium text-bgs-blue">{devices}</span>
                </div>
                <div className="relative pt-1">
                  <div className="flex h-2 mb-4 overflow-hidden text-xs bg-bgs-blue/10 rounded">
                    <div 
                      style={{ width: `${Math.min(devices / 10 * 100, 100)}%` }} 
                      className="flex flex-col justify-center text-center text-white whitespace-nowrap transition-all duration-300 bg-bgs-blue"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={toggleStatus}>
              {status === "online" ? "Désactiver" : "Activer"}
            </Button>
            <Button onClick={restartRouter}>Redémarrer</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Configuration WiFi</CardTitle>
            <CardDescription>Paramètres de votre réseau sans fil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-bgs-blue">Nom du réseau (SSID)</h4>
                <p className="text-bgs-blue/80">BGS_Network</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-bgs-blue">Sécurité</h4>
                <p className="text-bgs-blue/80">WPA2-PSK</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-bgs-blue">Canal</h4>
                <p className="text-bgs-blue/80">Auto (Actuellement: 6)</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-bgs-blue">Bande</h4>
                <p className="text-bgs-blue/80">Double (2.4GHz & 5GHz)</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Modifier la configuration</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Statistiques de connexion</CardTitle>
            <CardDescription>Performance actuelle du router</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-bgs-blue">Vitesse descendante</h4>
                <p className="text-bgs-blue/80">124 Mbps</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-bgs-blue">Vitesse montante</h4>
                <p className="text-bgs-blue/80">48 Mbps</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-bgs-blue">Latence</h4>
                <p className="text-bgs-blue/80">12 ms</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-bgs-blue">Temps de fonctionnement</h4>
                <p className="text-bgs-blue/80">7 jours, 14 heures</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Tester la connexion</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
