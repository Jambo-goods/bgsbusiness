
import React from "react";
import { MessageSquare, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContactActionsCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Actions disponibles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full justify-start" variant="outline">
          <MessageSquare className="h-4 w-4 mr-2" />
          Contacter l'équipe du projet
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Phone className="h-4 w-4 mr-2" />
          Demander un rendez-vous
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Envoyer un email
        </Button>
      </CardContent>
    </Card>
  );
}
