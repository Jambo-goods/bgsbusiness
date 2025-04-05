
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
            <FormLabel className="block text-sm font-medium text-bgs-blue mb-1">
              Prénom
            </FormLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-bgs-blue/50" />
              </div>
              <FormControl>
                <Input
                  {...field}
                  id="firstName"
                  type="text"
                  className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                  placeholder="Jean"
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={formToUse.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block text-sm font-medium text-bgs-blue mb-1">
              Nom
            </FormLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-bgs-blue/50" />
              </div>
              <FormControl>
                <Input
                  {...field}
                  id="lastName"
                  type="text"
                  className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                  placeholder="Dupont"
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
