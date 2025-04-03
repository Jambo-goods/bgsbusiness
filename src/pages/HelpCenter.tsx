
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Book, 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Search, 
  Mail, 
  FileText,
  AlertCircle,
  CreditCard,
  Users,
  Shield,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

// Données pour les catégories d'aide
const helpCategories = [
  {
    title: "Premiers pas",
    icon: <Book className="h-6 w-6 text-bgs-orange" />,
    description: "Guide pour démarrer avec BGS Invest",
    articles: [
      "Comment créer un compte",
      "Finaliser votre profil",
      "Comprendre les différents types de projets",
      "Effectuer votre premier investissement"
    ]
  },
  {
    title: "Investissements",
    icon: <CreditCard className="h-6 w-6 text-bgs-orange" />,
    description: "Tout sur les opportunités d'investissement",
    articles: [
      "Comment fonctionnent les rendements",
      "Comprendre les risques",
      "Durée des investissements",
      "Diversification du portefeuille"
    ]
  },
  {
    title: "Paiements et retraits",
    icon: <CreditCard className="h-6 w-6 text-bgs-orange" />,
    description: "Gérer votre portefeuille et vos transactions",
    articles: [
      "Ajouter des fonds à votre compte",
      "Processus de retrait",
      "Comprendre les frais",
      "Options de paiement disponibles"
    ]
  },
  {
    title: "Compte et sécurité",
    icon: <Shield className="h-6 w-6 text-bgs-orange" />,
    description: "Protéger votre compte et vos données",
    articles: [
      "Authentification à deux facteurs",
      "Modifier vos informations",
      "Réinitialiser votre mot de passe",
      "Protection des données"
    ]
  },
  {
    title: "Programme de parrainage",
    icon: <Users className="h-6 w-6 text-bgs-orange" />,
    description: "Inviter des amis et gagner des bonus",
    articles: [
      "Comment fonctionne le parrainage",
      "Suivre vos parrainages",
      "Conditions et récompenses",
      "Questions fréquentes sur le parrainage"
    ]
  },
  {
    title: "Problèmes techniques",
    icon: <AlertCircle className="h-6 w-6 text-bgs-orange" />,
    description: "Résoudre les problèmes techniques",
    articles: [
      "Problèmes de connexion",
      "Erreurs lors des transactions",
      "Problèmes d'affichage",
      "Bugs et signalements"
    ]
  }
];

export default function HelpCenter() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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

  // Filtrer les catégories en fonction de la recherche
  const filteredCategories = searchTerm 
    ? helpCategories.filter(category => 
        category.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.articles.some(article => article.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : helpCategories;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Centre d'Aide | BGS Invest</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-bgs-blue mb-4 text-center">Centre d'Aide</h1>
          <p className="text-bgs-blue/80 text-center mb-8">
            Trouvez rapidement des réponses à vos questions ou contactez notre équipe d'assistance
          </p>
          
          {/* Barre de recherche */}
          <div className="relative mb-12">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Rechercher un sujet d'aide..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Catégories d'aide */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    {category.icon}
                    <CardTitle className="text-lg font-semibold text-bgs-blue">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-bgs-blue/80 text-sm mb-4">{category.description}</p>
                    <ul className="space-y-2">
                      {category.articles.map((article, artIndex) => (
                        <li key={artIndex} className="text-sm">
                          <a href="#" className="flex items-center text-bgs-blue/90 hover:text-bgs-orange">
                            <FileText className="h-3.5 w-3.5 mr-2" />
                            {article}
                          </a>
                        </li>
                      )).slice(0, 4)}
                    </ul>
                    {category.articles.length > 4 && (
                      <a href="#" className="text-xs flex items-center text-bgs-orange mt-2">
                        Voir tous les articles
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucun résultat trouvé pour "{searchTerm}"</p>
                <p className="text-sm text-gray-400">Essayez un autre terme ou contactez directement notre support</p>
              </div>
            )}
          </div>
          
          {/* Options de contact */}
          <div className="bg-gray-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold text-bgs-blue mb-6 text-center">Besoin d'une assistance personnalisée ?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white">
                <CardContent className="p-6 text-center">
                  <Phone className="h-10 w-10 text-bgs-orange mx-auto mb-3" />
                  <h3 className="font-medium text-bgs-blue mb-2">Par téléphone</h3>
                  <p className="text-sm text-bgs-blue/80 mb-3">Disponible lun-ven, 9h-18h</p>
                  <a href="tel:+33123456789" className="text-bgs-orange font-medium">+33 1 23 45 67 89</a>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="p-6 text-center">
                  <Mail className="h-10 w-10 text-bgs-orange mx-auto mb-3" />
                  <h3 className="font-medium text-bgs-blue mb-2">Par email</h3>
                  <p className="text-sm text-bgs-blue/80 mb-3">Réponse sous 24-48h</p>
                  <a href="mailto:support@bgsinvest.com" className="text-bgs-orange font-medium">support@bgsinvest.com</a>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
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
