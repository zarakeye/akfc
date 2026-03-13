export interface UserProfile {
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  email: string | null;
  avatar: string | null;
  aboutMe: string | null;
  phone: string | null;
  birthDate: string | null;
  isFirstLogin: boolean;
}