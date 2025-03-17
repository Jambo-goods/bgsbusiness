
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
}

export const validateProjectForm = (formData: FormDataType) => {
  const errors: Record<string, string> = {};
  const requiredFields = [
    'name', 'company_name', 'description', 'location', 'image', 
    'price', 'yield', 'min_investment', 'duration', 'category', 'profitability'
  ];
  
  requiredFields.forEach(field => {
    if (!formData[field as keyof typeof formData] || formData[field as keyof typeof formData].trim() === '') {
      errors[field] = 'Ce champ est obligatoire';
    }
  });
  
  // Validate numeric fields
  if (formData.price && isNaN(Number(formData.price))) {
    errors.price = 'Doit être un nombre';
  }
  
  if (formData.yield && isNaN(Number(formData.yield))) {
    errors.yield = 'Doit être un nombre';
  }
  
  if (formData.min_investment && isNaN(Number(formData.min_investment))) {
    errors.min_investment = 'Doit être un nombre';
  }
  
  if (formData.profitability && isNaN(Number(formData.profitability))) {
    errors.profitability = 'Doit être un nombre';
  }
  
  // Validate possible_durations format if provided
  if (formData.possible_durations) {
    const durationItems = formData.possible_durations.split(',').map(item => item.trim());
    for (const item of durationItems) {
      if (isNaN(Number(item))) {
        errors.possible_durations = 'Doit être une liste de nombres séparés par des virgules';
        break;
      }
    }
  }
  
  return errors;
};
