
import { User } from "lucide-react";

interface NameFieldsProps {
  firstName: string;
  lastName: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
}

export default function NameFields({ firstName, lastName, setFirstName, setLastName }: NameFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-bgs-blue mb-1">
          Prénom
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User size={18} className="text-bgs-blue/50" />
          </div>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
            placeholder="Jean"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-bgs-blue mb-1">
          Nom
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User size={18} className="text-bgs-blue/50" />
          </div>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
            placeholder="Dupont"
            required
          />
        </div>
      </div>
    </div>
  );
}
