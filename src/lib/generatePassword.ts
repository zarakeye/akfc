import * as generatePassword from 'generate-password';

export default function generateStrongPassword(): string {
  return generatePassword.generate({
    length: 12,
    numbers: true,
    symbols: true,
    uppercase: true,
    excludeSimilarCharacters: true,
    strict: true
  });
}