/**
 * Authentication utility functions
 */

/**
 * Generates a random password with specified length and character sets
 * @param length Password length (default: 10)
 * @returns Random password string
 */
export function generateRandomPassword(length = 10): string {
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';  // Excluding I and O to avoid confusion
  const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz';  // Excluding l to avoid confusion
  const numberChars = '23456789';  // Excluding 0 and 1 to avoid confusion
  const specialChars = '!@#$%^&*';
  
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  
  // Ensure at least one character from each set
  let password = 
    uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)) +
    lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)) +
    numberChars.charAt(Math.floor(Math.random() * numberChars.length)) +
    specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}