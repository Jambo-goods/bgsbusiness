
import { User } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

interface NameFieldsProps {
  form?: any; // For backward compatibility
}

export default function NameFields({ form }: NameFieldsProps) {
  const formContext = useFormContext();
  const formToUse = form || formContext;
  
  if (!formToUse) {
    throw new Error("NameFields must be used within a Form component or be passed a form prop");
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={formToUse.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block text-sm font-semibold text-bgs-blue mb-2 flex items-center">
              <User size={16} className="text-bgs-orange mr-2" />
              Prénom
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                id="firstName"
                type="text"
                className="bg-white border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full p-2.5 focus:border-bgs-orange focus:ring-2 focus:ring-bgs-orange/20"
                placeholder="Jean"
              />
            </FormControl>
            <FormMessage className="text-xs mt-1" />
          </FormItem>
        )}
      />
      
      <FormField
        control={formToUse.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block text-sm font-semibold text-bgs-blue mb-2 flex items-center">
              <User size={16} className="text-bgs-orange mr-2" />
              Nom
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                id="lastName"
                type="text"
                className="bg-white border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full p-2.5 focus:border-bgs-orange focus:ring-2 focus:ring-bgs-orange/20"
                placeholder="Dupont"
              />
            </FormControl>
            <FormMessage className="text-xs mt-1" />
          </FormItem>
        )}
      />
    </div>
  );
}
