
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

export default function ReferralCodeField() {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="referralCode"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Code de parrainage (facultatif)</FormLabel>
          <FormControl>
            <Input 
              placeholder="Entrez votre code de parrainage" 
              {...field} 
              className="bg-white border border-gray-300 focus:border-bgs-blue focus:ring-bgs-blue"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
