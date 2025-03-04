
interface SettingsProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function Settings({ userData }: SettingsProps) {
  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold text-bgs-blue mb-6">
        Paramètres du compte
      </h2>
      
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-bgs-blue mb-1">
              Prénom
            </label>
            <input
              id="firstName"
              type="text"
              value={userData.firstName}
              onChange={() => {}}
              className="bg-white border border-gray-200 text-bgs-blue rounded-lg block w-full p-2.5"
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-bgs-blue mb-1">
              Nom
            </label>
            <input
              id="lastName"
              type="text"
              value={userData.lastName}
              onChange={() => {}}
              className="bg-white border border-gray-200 text-bgs-blue rounded-lg block w-full p-2.5"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-bgs-blue mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={userData.email}
            onChange={() => {}}
            className="bg-white border border-gray-200 text-bgs-blue rounded-lg block w-full p-2.5"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-bgs-blue mb-1">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="bg-white border border-gray-200 text-bgs-blue rounded-lg block w-full p-2.5"
          />
          <p className="mt-1 text-xs text-bgs-blue/70">
            Laissez vide si vous ne souhaitez pas changer de mot de passe
          </p>
        </div>
        
        <button
          type="submit"
          className="btn-primary"
        >
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}
