import * as bcrypt from 'bcryptjs';
import * as CryptoJS from 'crypto-js';

/**
 * Password utility class containing methods for password hashing and encryption/decryption
 */
export class PasswordUtil {
  private static readonly SALT_ROUNDS = 12;
  private static readonly ENCRYPTION_KEY =
    process.env.ENCRYPTION_KEY ||
    'your-secret-encryption-key-change-this-in-production';

  /**
   * Hash a password using bcrypt (one-way hashing)
   * @param password - Plain text password to hash
   * @returns Promise<string> - Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Password hashing failed: ${errorMessage}`);
    }
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password - Plain text password
   * @param hashedPassword - Hashed password to compare against
   * @returns Promise<boolean> - True if passwords match, false otherwise
   */
  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Password comparison failed: ${errorMessage}`);
    }
  }

  /**
   * Encrypt a password using AES encryption (reversible)
   * @param password - Plain text password to encrypt
   * @returns string - Encrypted password
   */
  static encryptPassword(password: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        password,
        this.ENCRYPTION_KEY,
      ).toString();
      return encrypted;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Password encryption failed: ${errorMessage}`);
    }
  }

  /**
   * Decrypt an encrypted password back to original state
   * @param encryptedPassword - Encrypted password
   * @returns string - Decrypted password
   */
  static decryptPassword(encryptedPassword: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedPassword,
        this.ENCRYPTION_KEY,
      );
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Password decryption failed: ${errorMessage}`);
    }
  }

  /**
   * Generate a random encryption key (for initial setup)
   * @returns string - Random encryption key
   */
  static generateEncryptionKey(): string {
    return CryptoJS.lib.WordArray.random(256 / 8).toString();
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns object - Validation result with score and suggestions
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      suggestions.push('Password should be at least 8 characters long');
    } else {
      score += 1;
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      suggestions.push('Password should contain at least one uppercase letter');
    } else {
      score += 1;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      suggestions.push('Password should contain at least one lowercase letter');
    } else {
      score += 1;
    }

    // Number check
    if (!/\d/.test(password)) {
      suggestions.push('Password should contain at least one number');
    } else {
      score += 1;
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      suggestions.push(
        'Password should contain at least one special character',
      );
    } else {
      score += 1;
    }

    return {
      isValid: score >= 4,
      score,
      suggestions,
    };
  }
}
