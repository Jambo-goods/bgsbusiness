
import { Link } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Checkbox } from "../ui/checkbox";

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
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              id="terms"
              className="w-4 h-4 border border-bgs-blue/30 rounded bg-white/50 focus:ring-2 focus:ring-bgs-orange"
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <label
              htmlFor="terms"
              className="text-sm text-bgs-blue/70 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              J'accepte les{" "}
              <Link to="/conditions-dutilisation" className="text-bgs-orange hover:text-bgs-orange-light">
                conditions d'utilisation
              </Link>{" "}
              et la{" "}
              <Link to="/politique-de-confidentialite" className="text-bgs-orange hover:text-bgs-orange-light">
                politique de confidentialité
              </Link>
            </label>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
