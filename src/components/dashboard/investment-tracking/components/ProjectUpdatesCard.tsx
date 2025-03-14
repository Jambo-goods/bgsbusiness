
import React from "react";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function ProjectUpdatesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suivi du projet en temps réel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Progression des travaux</h4>
            <Progress value={75} className="h-2 mb-4" />
            <p className="text-sm text-gray-600">Le projet avance selon le planning prévu.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Documents disponibles</h4>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Rapport mensuel - Mars 2024
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
