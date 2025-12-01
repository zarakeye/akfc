// types/permission.ts
export interface PermissionPayload {
  name: string;
}

export type CreatePermissionResult =
  | {
    success: true;
    permission: { id: number; name: string };
  }
  | {
    success: false;
    errors: Record<string, string>;
  };
