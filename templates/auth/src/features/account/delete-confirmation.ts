/** Shared by the dialog and the API: the user must retype their account email. */
export function isAccountDeleteConfirmed(confirmEmail: string, email?: string | null): boolean {
  return !!email && confirmEmail.trim().toLowerCase() === email.trim().toLowerCase();
}
