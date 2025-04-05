
import { Lock } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

interface PasswordFieldsProps {
  form?: any; // For backward compatibility
}

export default function PasswordFields({ form }: PasswordFieldsProps) {
  const formContext = useFormContext();
  const formToUse = form || formContext;
  
  if (!formToUse) {
    throw new Error("PasswordFields must be used within a Form component or be passed a form prop");
  }

  return (
    <>
      <FormField
        control={formToUse.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block text-sm font-medium text-bgs-blue mb-1">
              Mot de passe
            </FormLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-bgs-blue/50" />
              </div>
              <FormControl>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                  placeholder="••••••••"
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={formToUse.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block text-sm font-medium text-bgs-blue mb-1">
              Confirmer le mot de passe
            </FormLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-bgs-blue/50" />
              </div>
              <FormControl>
                <Input
                  {...field}
                  id="confirmPassword"
                  type="password"
                  className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                  placeholder="••••••••"
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
