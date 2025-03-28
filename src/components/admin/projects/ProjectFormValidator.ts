
export interface FormDataType {
  name: string;
  company_name: string;
  description: string;
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

export const validateProjectForm = (formData: FormDataType): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validation des champs obligatoires
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
  
  if (!formData.image.trim()) {
    errors.image = "L'URL de l'image est requise";
  }
  
  if (!formData.price.trim()) {
    errors.price = "Le prix est requis";
  } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
    errors.price = "Le prix doit être un nombre positif";
  }
  
  if (!formData.yield.trim()) {
    errors.yield = "Le rendement est requis";
  } else if (isNaN(Number(formData.yield)) || Number(formData.yield) <= 0) {
    errors.yield = "Le rendement doit être un nombre positif";
  }
  
  if (!formData.min_investment.trim()) {
    errors.min_investment = "L'investissement minimum est requis";
  } else if (isNaN(Number(formData.min_investment)) || Number(formData.min_investment) <= 0) {
    errors.min_investment = "L'investissement minimum doit être un nombre positif";
  }
  
  if (!formData.duration.trim()) {
    errors.duration = "La durée est requise";
  }
  
  if (!formData.category.trim()) {
    errors.category = "La catégorie est requise";
  }
  
  if (!formData.profitability.trim()) {
    errors.profitability = "La rentabilité est requise";
  } else if (isNaN(Number(formData.profitability)) || Number(formData.profitability) <= 0) {
    errors.profitability = "La rentabilité doit être un nombre positif";
  }
  
  // Validation des durées possibles si elles sont fournies
  if (formData.possible_durations.trim()) {
    const durations = formData.possible_durations.split(',');
    for (const duration of durations) {
      const trimmedDuration = duration.trim();
      if (isNaN(Number(trimmedDuration)) || Number(trimmedDuration) <= 0) {
        errors.possible_durations = "Les durées doivent être des nombres positifs séparés par des virgules";
        break;
      }
    }
  }
  
  // Validation des champs du partenaire si renseignés
  if (formData.partner_employees && (isNaN(Number(formData.partner_employees)) || Number(formData.partner_employees) < 0)) {
    errors.partner_employees = "Le nombre d'employés doit être un nombre positif";
  }
  
  if (formData.partner_projects && (isNaN(Number(formData.partner_projects)) || Number(formData.partner_projects) < 0)) {
    errors.partner_projects = "Le nombre de projets doit être un nombre positif";
  }
  
  if (formData.partner_satisfaction && (isNaN(Number(formData.partner_satisfaction)) || 
      Number(formData.partner_satisfaction) < 0 || Number(formData.partner_satisfaction) > 100)) {
    errors.partner_satisfaction = "Le taux de satisfaction doit être un pourcentage entre 0 et 100";
  }

  return errors;
};
