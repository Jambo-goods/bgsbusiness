export function calculateInactivityTime(lastActive: string | null, createdAt: string | null): string {
  // If the user has a last_active_at timestamp, use it
  // Otherwise, use created_at as the last activity
  const lastActiveDate = lastActive || createdAt;
  
  if (!lastActiveDate) return "Inconnue";
  
  const lastActiveTime = new Date(lastActiveDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastActiveTime.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} jour${diffDays > 1 ? 's' : ''} ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else {
    return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  }
}
