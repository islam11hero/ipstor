export const ADMIN_EMAIL = "salamasalamaislam@gmail.com";

export function isAdminEmail(email: string | undefined | null): boolean {
  return email === ADMIN_EMAIL;
}
