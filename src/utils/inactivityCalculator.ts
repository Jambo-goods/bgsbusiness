
export const calculateInactivityTime = (
  lastActiveAt: string | null, 
  createdAt: string | null
): string => {
  if (!lastActiveAt) {
    return 'Jamais connecté';
  }

  const lastActive = new Date(lastActiveAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastActive.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Check if it's hours or minutes
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
    return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
  } else if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} mois`;
  } else {
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} an${diffYears > 1 ? 's' : ''}`;
  }
};
