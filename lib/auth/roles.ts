export const USER_ROLES = [
  "super_admin",
  "merchant",
  "driver",
  "customer",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/admin";
    case "merchant":
      return "/merchant";
    default:
      return "/login";
  }
}
