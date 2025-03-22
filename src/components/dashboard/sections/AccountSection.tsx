
import React from "react";
import { Building2, CreditCard, HandCoins } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccountSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Projets</CardTitle>
            {/* Correctly render the icon component */}
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>Vos projets actifs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm">Voir vos projets</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Capital investi</CardTitle>
            {/* Correctly render the icon component */}
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>Total de vos investissements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3 400€</div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm">Découvrir les projets</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Rendements</CardTitle>
            {/* Correctly render the icon component */}
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>Rendements cumulés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">172€</div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm">Voir les détails</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
