export type SessionClient = {
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    pseudo: string | null;
    avatar: string | null;
    isFirstLogin: boolean;
    role: {
      id: number;
      name: string;
      permissions: string[];
    } | null;
  } | null;
};
