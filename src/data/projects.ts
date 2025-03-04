
import { Project } from "@/types/project";

// Sample project data
export const projects: Project[] = [
  {
    id: "wood-africa",
    name: "BGS Wood Africa",
    companyName: "BGS Wood Africa",
    description: "Achat de tronçonneuses pour découper du bois et produire des matériaux de construction.",
    profitability: 15,
    duration: "Flexible",
    location: "Afrique de l'Ouest",
    status: "active",
    minInvestment: 1500,
    category: "Foresterie",
    price: 50000,
    yield: 15,
    fundingProgress: 65,
    featured: true,
    image: "https://images.unsplash.com/photo-1614254136161-0314a45127a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "energy",
    name: "BGS Energy",
    companyName: "BGS Energy",
    description: "Achat d'équipements pour collecter et transformer les déchets en carburant, gaz et charbon.",
    profitability: 12,
    duration: "12 mois",
    location: "Afrique centrale",
    status: "upcoming",
    minInvestment: 2000,
    category: "Énergie",
    price: 75000,
    yield: 12,
    fundingProgress: 30,
    featured: true,
    image: "https://images.unsplash.com/photo-1540324603583-fa99c8235661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "agro-tech",
    name: "BGS AgroTech",
    companyName: "BGS AgroTech",
    description: "Achat de machines agricoles pour améliorer la production et réduire les pertes post-récolte.",
    profitability: 14,
    duration: "24 mois",
    location: "Afrique de l'Est",
    status: "upcoming",
    minInvestment: 2500,
    category: "Agriculture",
    price: 100000,
    yield: 14,
    fundingProgress: 25,
    featured: false,
    image: "https://images.unsplash.com/photo-1589923188651-268a9765e432?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "logistics",
    name: "BGS Logistics",
    companyName: "BGS Logistics",
    description: "Acquisition de véhicules de transport pour faciliter la distribution des produits sur les marchés locaux.",
    profitability: 13,
    duration: "18 mois",
    location: "Afrique de l'Ouest",
    status: "active",
    minInvestment: 3000,
    category: "Logistique",
    price: 120000,
    yield: 13,
    fundingProgress: 45,
    featured: false,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
];
