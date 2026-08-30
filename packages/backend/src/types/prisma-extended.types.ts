import { Session, User } from "@prisma/client";

/**
 * Types "enrichis" hérités : jadis User + Role + Permission. L'auth étant passée
 * aux groupes (isAdmin dérivé de l'appartenance au groupe Administrateurs), il ne
 * reste que le User de base. Conservés pour ne pas casser les signatures
 * existantes (createSessionJWT, loginService).
 */
export type UserEnhanced = User | null;

export type UserEnhancedStrict = User;

export type SessionEnhancedStrict = Session & {
  user: User | null;
};
