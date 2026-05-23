export const ADMIN_EMAIL = "salamasalamaislam@gmail.com";

export function isAdminEmail(email: string | undefined | null): boolean {
  return email === ADMIN_EMAIL;
}

/** Where to send the user immediately after a successful login or signup. */
export function getPostAuthRedirectPath(
  email: string | undefined | null
): "/admin" | "/dashboard" {
  return isAdminEmail(email) ? "/admin" : "/dashboard";
}
