
import { Link } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import { Check } from "lucide-react";

interface TermsCheckboxProps {
  form?: any; // For backward compatibility
}

export default function TermsCheckbox({ form }: TermsCheckboxProps) {
  const formContext = useFormContext();
  const formToUse = form || formContext;
  
  if (!formToUse) {
    throw new Error("TermsCheckbox must be used within a Form component or be passed a form prop");
  }

  return (
    <FormField
      control={formToUse.control}
      name="terms"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4 p-3 rounded-lg border border-bgs-blue/10 bg-white/80 hover:bg-white/90 transition-colors">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              id="terms"
              className="w-5 h-5 border-2 border-bgs-orange rounded bg-white data-[state=checked]:bg-bgs-orange data-[state=checked]:text-white"
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none text-bgs-blue/80 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              J'accepte les{" "}
              <Link to="/conditions-dutilisation" className="text-bgs-orange font-semibold hover:text-bgs-orange-light underline">
                conditions d'utilisation
              </Link>{" "}
              et la{" "}
              <Link to="/politique-de-confidentialite" className="text-bgs-orange font-semibold hover:text-bgs-orange-light underline">
                politique de confidentialité
              </Link>
            </label>
            <FormMessage className="text-xs mt-1" />
          </div>
        </FormItem>
      )}
    />
  );
}
