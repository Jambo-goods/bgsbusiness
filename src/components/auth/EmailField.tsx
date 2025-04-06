
import { Mail } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

interface EmailFieldProps {
  form?: any; // For backward compatibility
}

export default function EmailField({ form }: EmailFieldProps) {
  const formContext = useFormContext();
  const formToUse = form || formContext;
  
  if (!formToUse) {
    throw new Error("EmailField must be used within a Form component or be passed a form prop");
  }

  return (
    <FormField
      control={formToUse.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="block text-sm font-semibold text-bgs-blue mb-2 flex items-center">
            <Mail size={16} className="text-bgs-orange mr-2" />
            Email
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              id="email"
              type="email"
              className="bg-white border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full p-2.5 focus:border-bgs-orange focus:ring-2 focus:ring-bgs-orange/20"
              placeholder="votre@email.com"
            />
          </FormControl>
          <FormMessage className="text-xs mt-1" />
        </FormItem>
      )}
    />
  );
}
