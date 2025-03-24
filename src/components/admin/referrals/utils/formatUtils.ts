
interface User {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export const formatName = (user: User | undefined): string => {
  if (!user) return 'Inconnu';
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.email || 'Inconnu';
};
