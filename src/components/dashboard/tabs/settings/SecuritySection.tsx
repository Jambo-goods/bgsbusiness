import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import PasswordFields from "@/components/auth/PasswordFields";

interface SecuritySectionProps {
  twoFactorEnabled: boolean;
  onTwoFactorToggle: () => void;
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

export default function SecuritySection({ 
  onPasswordChange,
  isLoading
}: SecuritySectionProps) {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordSubmit = () => {
    setPasswordError("");
    
    // Validation
    if (!currentPassword) {
      setPasswordError("Le mot de passe actuel est requis");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    // Submit password change
    onPasswordChange(currentPassword, newPassword)
      .then(() => {
        setShowPasswordChange(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch(error => {
        setPasswordError(error.message || "Une erreur est survenue");
      });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="text-bgs-blue" size={20} />
        <h3 className="text-lg font-medium text-bgs-blue">Sécurité</h3>
      </div>
      <div className="space-y-6">
        {/* Changement de mot de passe */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-0.5">
              <p className="text-sm text-bgs-gray-medium">Modifier votre mot de passe actuel</p>
            </div>
            {!showPasswordChange ? (
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordChange(true)}
                className="border-bgs-blue text-bgs-blue hover:bg-bgs-blue hover:text-white"
              >
                Changer
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordError("");
                }}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                Annuler
              </Button>
            )}
          </div>
          
          {showPasswordChange && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              {passwordError && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {passwordError}
                </div>
              )}
              
              <div>
                <Label htmlFor="current-password" className="text-bgs-blue mb-1 block">
                  Mot de passe actuel
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-bgs-blue/50" />
                  </div>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-white/50 border border-bgs-blue/20 text-bgs-blue rounded-lg block w-full pl-10 p-2.5"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <PasswordFields
                password={newPassword}
                confirmPassword={confirmPassword}
                setPassword={setNewPassword}
                setConfirmPassword={setConfirmPassword}
              />
              
              <Button 
                onClick={handlePasswordSubmit}
                disabled={isLoading}
                className="w-full bg-bgs-blue hover:bg-bgs-blue-light text-white"
              >
                {isLoading ? "Traitement en cours..." : "Mettre à jour le mot de passe"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
