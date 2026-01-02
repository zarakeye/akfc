import { Session } from "@prisma/client";
import { UserEnhancedStrict } from "@/types";

// 🧩 2. Type de retour de l’action


export interface AuthState {
  success: boolean;
  error?: string;
  session?: Session;
  user: UserEnhancedStrict | null;
}








export interface CreateActivityTypeState {
  success: boolean;
  error?: string;
}

export interface CreateActivityState {
  success: boolean;
  error?: string;
}