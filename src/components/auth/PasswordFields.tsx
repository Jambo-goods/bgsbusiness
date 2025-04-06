
import { Lock } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Dispatch, SetStateAction } from "react";

interface PasswordFieldsProps {
  form?: any; // For backward compatibility
  // Add the new props with optional markers
  password?: string;
  confirmPassword?: string;
  setPassword?: Dispatch<SetStateAction<string>>;
  setConfirmPassword?: Dispatch<SetStateAction<string>>;
}

export default function PasswordFields({ 
  form, 
  password, 
  confirmPassword, 
  setPassword, 
  setConfirmPassword 
}: PasswordFieldsProps) {
  const formContext = useFormContext();
  const formToUse = form || formContext;
  
  // If we have direct state management props, use those instead of form
  const isDirectStateMode = password !== undefined && setPassword !== undefined;
  
  if (!formToUse && !isDirectStateMode) {
    throw new Error("PasswordFields must be used within a Form component or be passed a form prop or state management props");
  }

  // If using direct state management
  if (isDirectStateMode) {
    return (
      <>
        <div>
          <FormLabel className="block text-sm font-semibold text-bgs-blue mb-2 flex items-center" htmlFor="new-password">
            <Lock size={16} className="text-bgs-orange mr-2" />
            Nouveau mot de passe
          </FormLabel>
          <div className="relative">
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword && setPassword(e.target.value)}
              className="bg-white border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full p-2.5 focus:border-bgs-orange focus:ring-2 focus:ring-bgs-orange/20"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div>
          <FormLabel className="block text-sm font-semibold text-bgs-blue mb-2 flex items-center" htmlFor="confirm-password">
            <Lock size={16} className="text-bgs-orange mr-2" />
            Confirmer le mot de passe
          </FormLabel>
          <div className="relative">
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword && setConfirmPassword(e.target.value)}
              className="bg-white border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full p-2.5 focus:border-bgs-orange focus:ring-2 focus:ring-bgs-orange/20"
              placeholder="••••••••"
            />
          </div>
        </div>
      </>
    );
  }

  // If using form context
  return (
    <>
      <FormField
        control={formToUse.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block text-sm font-semibold text-bgs-blue mb-2 flex items-center">
              <Lock size={16} className="text-bgs-orange mr-2" />
              Mot de passe
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                id="password"
                type="password"
                className="bg-white border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full p-2.5 focus:border-bgs-orange focus:ring-2 focus:ring-bgs-orange/20"
                placeholder="••••••••"
              />
            </FormControl>
            <FormMessage className="text-xs mt-1" />
          </FormItem>
        )}
      />
      
      <FormField
        control={formToUse.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block text-sm font-semibold text-bgs-blue mb-2 flex items-center">
              <Lock size={16} className="text-bgs-orange mr-2" />
              Confirmer le mot de passe
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                id="confirmPassword"
                type="password"
                className="bg-white border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full p-2.5 focus:border-bgs-orange focus:ring-2 focus:ring-bgs-orange/20"
                placeholder="••••••••"
              />
            </FormControl>
            <FormMessage className="text-xs mt-1" />
          </FormItem>
        )}
      />
    </>
  );
}
