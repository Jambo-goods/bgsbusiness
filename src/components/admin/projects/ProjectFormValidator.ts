
export interface FormDataType {
  name: string;
  company_name: string;
  description: string;
  investment_model?: string; // Ajout du champ modèle d'investissement
  location: string;
  image: string;
  price: string;
  yield: string;
  min_investment: string;
  duration: string;
  category: string;
  status: string;
  funding_progress: string;
  possible_durations: string;
  profitability: string;
  // Champs pour le partenaire local
  partner_description?: string;
  partner_experience?: string;
  partner_employees?: string;
  partner_projects?: string;
  partner_satisfaction?: string;
}

export const validateProjectForm = (formData: FormDataType) => {
  const errors: Record<string, string> = {};

  if (!formData.name.trim()) {
    errors.name = "Le nom du projet est requis";
  }

  if (!formData.company_name.trim()) {
    errors.company_name = "Le nom de la société est requis";
  }

  if (!formData.description.trim()) {
    errors.description = "La description est requise";
  }

  if (!formData.location.trim()) {
    errors.location = "La localisation est requise";
  }

  if (!formData.category.trim()) {
    errors.category = "La catégorie est requise";
  }

  if (!formData.image.trim()) {
    errors.image = "L'URL de l'image est requise";
  }

  if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
    errors.price = "Le prix doit être un nombre positif";
  }

  if (!formData.yield.trim() || isNaN(Number(formData.yield)) || Number(formData.yield) <= 0) {
    errors.yield = "Le rendement doit être un nombre positif";
  }

  if (!formData.min_investment.trim() || isNaN(Number(formData.min_investment)) || Number(formData.min_investment) <= 0) {
    errors.min_investment = "L'investissement minimum doit être un nombre positif";
  }

  if (!formData.duration.trim()) {
    errors.duration = "La durée est requise";
  }

  if (!formData.profitability.trim() || isNaN(Number(formData.profitability)) || Number(formData.profitability) <= 0) {
    errors.profitability = "La rentabilité doit être un nombre positif";
  }

  return errors;
};
