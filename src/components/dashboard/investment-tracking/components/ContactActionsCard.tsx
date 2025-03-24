
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailIcon, PhoneCall, MessageSquare } from 'lucide-react';

interface ContactActionsCardProps {
  investmentId: string;
}

const ContactActionsCard: React.FC<ContactActionsCardProps> = ({ investmentId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Besoin d'assistance ?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full flex items-center gap-2 justify-start">
          <MailIcon className="h-4 w-4" />
          <span>Contacter par email</span>
        </Button>
        
        <Button variant="outline" className="w-full flex items-center gap-2 justify-start">
          <PhoneCall className="h-4 w-4" />
          <span>Demander un appel</span>
        </Button>
        
        <Button variant="outline" className="w-full flex items-center gap-2 justify-start">
          <MessageSquare className="h-4 w-4" />
          <span>Poser une question</span>
        </Button>
        
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          <p>ID Investissement: {investmentId.substring(0, 8)}...</p>
          <p className="mt-1">Notre équipe est disponible du lundi au vendredi de 9h à 18h.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactActionsCard;
