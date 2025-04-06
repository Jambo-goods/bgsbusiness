
import { Link } from "react-router-dom";

interface NavLogoProps {
  logoPath: string;
}

export default function NavLogo({ logoPath }: NavLogoProps) {
  return (
    <Link to="/" className="flex items-center">
      <img
        src={logoPath}
        alt="BGS Business Club"
        className="h-16 md:h-20 w-auto"
      />
    </Link>
  );
}
