import { createThrottle } from "@backend/lib/security/throttle";

/**
 * Garde-fou contre l'envoi en rafale du formulaire de contact (robots, double clic insistant) :
 * 5 envois par heure et par clé (adresse IP, adresse e-mail).
 */
export const submitThrottle = createThrottle({ limit: 5, windowMs: 60 * 60 * 1000 });
