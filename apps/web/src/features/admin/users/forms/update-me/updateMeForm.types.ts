import type { FormActionState } from "@workspace/contracts/src/forms/form-action.types";

export type UpdateMeField =
  | "firstName"
  | "lastName"
  | "pseudo"
  | "aboutMe"
  | "phone"
  | "birthDate"
  | "avatar";

export type UpdateMeFormState = FormActionState<undefined, UpdateMeField>;

export type UpdateMeFormValues = {
  firstName: string;
  lastName: string;
  pseudo?: string;
  aboutMe?: string;
  phone?: string;
  birthDate?: string;
  avatar?: string;
};