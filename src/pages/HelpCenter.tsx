
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Phone, 
  Mail,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

export default function HelpCenter() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler l'envoi du formulaire
    toast.success("Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.");
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Centre d'Aide | BGS Business</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-bgs-blue mb-4 text-center">Centre d'Aide</h1>
          
          {/* Options de contact */}
          <h2 className="text-2xl font-semibold text-bgs-blue mb-6 text-center mt-8">Besoin d'une assistance personnalisée ?</h2>
          
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <Card className="bg-white flex-1">
              <CardContent className="p-6 text-center">
                <Phone className="h-10 w-10 text-bgs-orange mx-auto mb-3" />
                <h3 className="font-medium text-bgs-blue mb-2">Par téléphone</h3>
                <p className="text-sm text-bgs-blue/80 mb-3">Disponible lun-ven, 9h-18h</p>
                <a href="tel:+33123456789" className="text-bgs-orange font-medium">+33 1 23 45 67 89</a>
              </CardContent>
            </Card>
            
            <Card className="bg-white flex-1">
              <CardContent className="p-6 text-center">
                <Mail className="h-10 w-10 text-bgs-orange mx-auto mb-3" />
                <h3 className="font-medium text-bgs-blue mb-2">Par email</h3>
                <p className="text-sm text-bgs-blue/80 mb-3">Réponse sous 24-48h</p>
                <a href="mailto:support@bgsbusiness.com" className="text-bgs-orange font-medium">support@bgsbusiness.com</a>
              </CardContent>
            </Card>
            
            <Card className="bg-white flex-1">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-10 w-10 text-bgs-orange mx-auto mb-3" />
                <h3 className="font-medium text-bgs-blue mb-2">Chat en direct</h3>
                <p className="text-sm text-bgs-blue/80 mb-3">Temps d'attente actuel: ~5 min</p>
                <Button variant="outline" className="text-bgs-orange border-bgs-orange hover:bg-bgs-orange/10">
                  Démarrer un chat
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Formulaire de contact */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-bgs-blue mb-6 text-center">Envoyez-nous un message</h2>
            
            <form onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-bgs-blue mb-1">Nom complet</label>
                  <Input
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-bgs-blue mb-1">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium text-bgs-blue mb-1">Sujet</label>
                <Input
                  id="subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactFormChange}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-bgs-blue mb-1">Message</label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={contactForm.message}
                  onChange={handleContactFormChange}
                  required
                  className="resize-none"
                />
              </div>
              
              <Button type="submit" className="w-full bg-bgs-blue hover:bg-bgs-blue/90">
                Envoyer le message
              </Button>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
