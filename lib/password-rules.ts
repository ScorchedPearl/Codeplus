// Shared by the browser forms and the server, so no Node imports here.
export const MIN_PASSWORD_LENGTH = 10;

export function passwordProblem(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}
