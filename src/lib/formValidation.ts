// Password regex: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const passwordRequirements = [
  {
    label: 'At least 8 characters',
    test: (pw: string) => pw.length >= 8,
  },
  {
    label: 'At least one uppercase letter',
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: 'At least one lowercase letter',
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    label: 'At least one digit',
    test: (pw: string) => /\d/.test(pw),
  },
  {
    label: 'At least one special character',
    test: (pw: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
  },
];

export function getPasswordRequirementsStatus(password: string) {
  return passwordRequirements.map((req) => req.test(password));
}

export function getPasswordStrength(password: string) {
  // Strength: 0-5 (how many requirements are met)
  return passwordRequirements.reduce((acc, req) => acc + (req.test(password) ? 1 : 0), 0);
}
