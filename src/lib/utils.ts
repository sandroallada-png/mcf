import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUserIdentifier(email: string | null | undefined): string {
  if (!email) return '';
  // Check for shadow email pattern: foyer[phone]@cook.flex
  if (email.startsWith('foyer') && email.endsWith('@cook.flex')) {
    const phonePart = email.substring(5, email.indexOf('@'));
    return `+${phonePart}`;
  }
  return email;
}
