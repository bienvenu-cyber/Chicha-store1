export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  VENDOR = 'vendor'
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  BANNED = 'banned'
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: UserRole;
  status: AccountStatus;
  
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };

  preferences?: {
    language: string;
    currency: string;
    newsletter: boolean;
    darkMode: boolean;
  };

  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };

  metadata?: {
    registrationDate: Date;
    lastLogin?: Date;
    loginCount: number;
  };

  permissions?: {
    canPurchase: boolean;
    canReview: boolean;
    canComment: boolean;
  };
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration extends UserCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface UserSecuritySettings {
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lastFailedLoginAttempt?: Date;
  isLocked: boolean;
  lockUntil?: Date;
}
