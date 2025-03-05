
import { Link } from "react-router-dom";

interface TermsCheckboxProps {
  agreedToTerms: boolean;
  setAgreedToTerms: (value: boolean) => void;
}

export default function TermsCheckbox({ agreedToTerms, setAgreedToTerms }: TermsCheckboxProps) {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id="terms"
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="w-4 h-4 border border-bgs-blue/30 rounded bg-white/50 focus:ring-2 focus:ring-bgs-orange"
          required
        />
      </div>
      <label htmlFor="terms" className="ml-2 text-sm text-bgs-blue/70">
        J'accepte les{" "}
        <Link to="/conditions-dutilisation" className="text-bgs-orange hover:text-bgs-orange-light">
          conditions d'utilisation
        </Link>{" "}
        et la{" "}
        <Link to="/politique-de-confidentialite" className="text-bgs-orange hover:text-bgs-orange-light">
          politique de confidentialité
        </Link>
      </label>
    </div>
  );
}
