export const passwordRequirementHint =
  "8+ characters with 1 uppercase letter, 1 number & 1 special character";

export function getPasswordStrengthError(password: string): string {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter.";
  if (!/\d/.test(password)) return "Password must include at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include at least one special character.";
  return "";
}
