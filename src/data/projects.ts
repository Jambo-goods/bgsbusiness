
import { Project } from "@/types/project";

// Sample project data
export const projects: Project[] = [
  {
    id: "wood-africa",
    name: "BGS Wood Africa",
    companyName: "BGS Wood Africa Corporation",
    description: "Achat de tronçonneuses pour découper du bois et produire des matériaux de construction.",
    profitability: 15,
    duration: "24 mois",
    location: "Afrique de l'Ouest",
    status: "active",
    minInvestment: 1500,
    category: "Foresterie",
    price: 50000,
    yield: 15,
    fundingProgress: 65,
    featured: true,
    possibleDurations: [12, 24, 36],
    startDate: "2023-10-15",
    endDate: "2025-10-15",
    firstPaymentDate: "2023-11-15",
    image: "https://images.unsplash.com/photo-1614254136161-0314a45127a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "energy",
    name: "BGS Energy",
    companyName: "BGS Energy Solutions",
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
    possibleDurations: [6, 12, 18],
    startDate: "2024-01-10",
    endDate: "2025-01-10",
    firstPaymentDate: "2024-02-10",
    image: "https://images.unsplash.com/photo-1540324603583-fa99c8235661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "agro-tech",
    name: "BGS AgroTech",
    companyName: "BGS AgroTech Industries",
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
    possibleDurations: [12, 24, 36, 48],
    startDate: "2024-03-01",
    endDate: "2026-03-01",
    firstPaymentDate: "2024-04-01",
    image: "https://images.unsplash.com/photo-1589923188651-268a9765e432?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "logistics",
    name: "BGS Logistics",
    companyName: "BGS Logistics & Transport",
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
    possibleDurations: [12, 18, 24],
    startDate: "2023-08-15",
    endDate: "2025-02-15",
    firstPaymentDate: "2023-09-15",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "poules-pondeuses",
    name: "BGS Poules Pondeuses",
    companyName: "BGS Aviculture",
    description: "Installation d'un poulailler moderne pour la production d'œufs biologiques avec des poules élevées en plein air.",
    profitability: 18,
    duration: "24 mois",
    location: "Afrique centrale",
    status: "active",
    minInvestment: 2000,
    category: "Agriculture",
    price: 80000,
    yield: 18,
    fundingProgress: 10,
    featured: true,
    possibleDurations: [12, 24, 36],
    startDate: "2024-07-01",
    endDate: "2026-07-01",
    firstPaymentDate: "2024-08-01",
    image: "https://images.unsplash.com/photo-1569615313731-7294bb3843be?q=80&w=1000&auto=format&fit=crop"
  },
];
