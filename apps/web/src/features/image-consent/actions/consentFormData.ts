import { IMAGE_USAGE_VALUES, type ImageUsageValue } from "@akfc/contracts/legal/imageConsent.ts";

/**
 * Les choix d'autorisation, relus dans le FormData : un bouton « Oui » ou « Non » par usage
 * (`usage-PUBLIC_SITE` = "yes"), et le choix « après le départ » (`keepAfterLeave` = "true").
 * Partagé par les server actions du membre majeur, du mineur et du parent.
 */
export function choicesFromFormData(formData: FormData): { usages: ImageUsageValue[]; keepAfterLeave: boolean } {
  return {
    usages: IMAGE_USAGE_VALUES.filter((u) => formData.get(`usage-${u}`) === "yes"),
    keepAfterLeave: formData.get("keepAfterLeave") === "true",
  };
}

/** Une case cochée vaut "on" ; décochée, elle est absente. */
export const isChecked = (formData: FormData, name: string): boolean => formData.get(name) === "on";
