
import { Mail } from "lucide-react";

interface EmailFieldProps {
  email: string;
  setEmail: (value: string) => void;
}

export default function EmailField({ email, setEmail }: EmailFieldProps) {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-bgs-blue mb-1">
        Email
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail size={18} className="text-bgs-blue/50" />
        </div>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
          placeholder="votre@email.com"
          required
        />
      </div>
    </div>
  );
}
