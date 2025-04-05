
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
          <FormLabel className="block text-sm font-medium text-bgs-blue mb-1" htmlFor="new-password">
            Nouveau mot de passe
          </FormLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-bgs-blue/50" />
            </div>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword && setPassword(e.target.value)}
              className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div>
          <FormLabel className="block text-sm font-medium text-bgs-blue mb-1" htmlFor="confirm-password">
            Confirmer le mot de passe
          </FormLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-bgs-blue/50" />
            </div>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword && setConfirmPassword(e.target.value)}
              className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
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
