
interface DashboardHeaderProps {
  userData: {
    firstName: string;
    lastName: string;
  };
}

export default function DashboardHeader({ userData }: DashboardHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-bold text-bgs-blue">
        Bonjour, {userData.firstName} {userData.lastName}
      </h1>
      <p className="text-bgs-blue/70">
        Bienvenue sur votre tableau de bord BGS Business Club
      </p>
    </header>
  );
}
