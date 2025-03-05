
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
        className="h-12 md:h-14 w-auto"
      />
    </Link>
  );
}
