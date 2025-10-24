import { PasswordUtil } from './password.util';

/**
 * Example usage of PasswordUtil functions
 * This file demonstrates how to use the password utility functions
 */
export class PasswordExample {
  /**
   * Example of password hashing (one-way, for storing in database)
   */
  static async hashPasswordExample() {
    const plainPassword = 'mySecurePassword123!';
    
    try {
      // Hash the password (one-way)
      const hashedPassword = await PasswordUtil.hashPassword(plainPassword);
      console.log('Hashed password:', hashedPassword);
      
      // Verify the password
      const isValid = await PasswordUtil.comparePassword(plainPassword, hashedPassword);
      console.log('Password is valid:', isValid);
      
      return { hashedPassword, isValid };
    } catch (error) {
      console.error('Hashing error:', error.message);
      throw error;
    }
  }

  /**
   * Example of password encryption/decryption (reversible, for temporary storage)
   */
  static encryptDecryptExample() {
    const plainPassword = 'mySecurePassword123!';
    
    try {
      // Encrypt the password (reversible)
      const encryptedPassword = PasswordUtil.encryptPassword(plainPassword);
      console.log('Encrypted password:', encryptedPassword);
      
      // Decrypt the password back to original
      const decryptedPassword = PasswordUtil.decryptPassword(encryptedPassword);
      console.log('Decrypted password:', decryptedPassword);
      console.log('Passwords match:', plainPassword === decryptedPassword);
      
      return { encryptedPassword, decryptedPassword };
    } catch (error) {
      console.error('Encryption/Decryption error:', error.message);
      throw error;
    }
  }

  /**
   * Example of password strength validation
   */
  static validatePasswordExample() {
    const weakPassword = '123';
    const strongPassword = 'MySecurePassword123!';
    
    const weakValidation = PasswordUtil.validatePasswordStrength(weakPassword);
    const strongValidation = PasswordUtil.validatePasswordStrength(strongPassword);
    
    console.log('Weak password validation:', weakValidation);
    console.log('Strong password validation:', strongValidation);
    
    return { weakValidation, strongValidation };
  }

  /**
   * Example of generating encryption key
   */
  static generateKeyExample() {
    const encryptionKey = PasswordUtil.generateEncryptionKey();
    console.log('Generated encryption key:', encryptionKey);
    console.log('Note: Store this key securely in your environment variables');
    
    return { encryptionKey };
  }
}

// Usage examples (uncomment to test):
// PasswordExample.hashPasswordExample();
// PasswordExample.encryptDecryptExample();
// PasswordExample.validatePasswordExample();
// PasswordExample.generateKeyExample();
