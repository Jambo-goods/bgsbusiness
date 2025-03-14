
import React from "react";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContactActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions disponibles</CardTitle>
      </CardHeader>
      <CardContent>
        <Button className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          Contacter l'équipe du projet
        </Button>
      </CardContent>
    </Card>
  );
}
