
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
          <FormLabel className="block text-sm font-medium text-bgs-blue mb-1">
            Email
          </FormLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-bgs-blue/50" />
            </div>
            <FormControl>
              <Input
                {...field}
                id="email"
                type="email"
                className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                placeholder="votre@email.com"
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
