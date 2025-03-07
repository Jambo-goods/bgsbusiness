
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto pt-6 pb-4 text-sm text-gray-500">
      <div className="container mx-auto px-4">
        <p className="text-center">&copy; {new Date().getFullYear()} BGS Invest. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
