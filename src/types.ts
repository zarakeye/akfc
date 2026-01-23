import { Permission, Role, Session, User } from "@prisma/client";

export type UserEnhanced = (User  & {
  role: (Role & {
    permissions: Permission[]; 
  }) | null
}) | null;

export type UserEnhancedStrict = (User  & {
  role: (Role & {
    permissions: Permission[]; 
  }) | null
});

export type SessionEnhancedStrict = (Session & {
  user: (User & {
    role:( Role & {
      permissions: (
        Permission[]
      )
    }) | null
  }) | null
});