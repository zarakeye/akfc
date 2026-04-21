export type FormActionIdle = {
  status: "idle";
};

export type FormActionSuccess<T = undefined> = {
  status: "success";
  data?: T;
  message?: string;
};

export type FormActionError<F extends string = string> = {
  status: "error";
  error: string;
  fieldErrors?: Partial<Record<F, string>>;
};

export type FormActionState<T = undefined, F extends string = string> =
  | FormActionIdle
  | FormActionSuccess<T>
  | FormActionError<F>;