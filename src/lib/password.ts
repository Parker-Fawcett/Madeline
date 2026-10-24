export const SECRET_NAME = "Madeline";

// iOS keyboards append non-breaking spaces and turn a double-space into ". ",
// so strip those before comparing.
export function isCorrectName(input: string): boolean {
  const normalized = input
    .replace(/ /g, " ")
    .trim()
    .replace(/\.$/, "")
    .toLowerCase();
  return normalized === SECRET_NAME.toLowerCase();
}
