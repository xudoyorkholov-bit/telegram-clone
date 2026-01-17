import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { VerificationSession } from '../models/VerificationSession';
import { isValidPhoneNumber, generateVerificationCode } from '../utils/validators';

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface VerificationResponse {
  sessionId: string;
  phoneNumber: string;
  expiresAt: Date;
  message: string;
}

export class AuthService {
  /**
   * Initiate registration by creating a verification session
   */
  async registerUser(phoneNumber: string): Promise<VerificationResponse> {
    if (!isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format. Use international format: +[country code][number]');
    }

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      throw new Error('Phone number already registered');
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const session = await VerificationSession.create({
      phoneNumber,
      code,
      expiresAt,
      attempts: 0,
      isVerified: false,
    });

    console.log(`[DEV] Verification code for ${phoneNumber}: ${code}`);

    return {
      sessionId: session._id.toString(),
      phoneNumber: session.phoneNumber,
      expiresAt: session.expiresAt,
      message: 'Verification code sent successfully',
    };
  }

  /**
   * Verify code and create account
   */
  async verifyCode(
    sessionId: string,
    code: string,
    displayName: string,
    password?: string
  ): Promise<AuthToken> {
    const session = await VerificationSession.findById(sessionId);

    if (!session) {
      throw new Error('Verification session not found');
    }

    if (new Date() > session.expiresAt) {
      throw new Error('Verification session expired');
    }

    if (session.isVerified) {
      throw new Error('Session already verified');
    }

    if (session.attempts >= 3) {
      throw new Error('Maximum verification attempts exceeded');
    }

    if (session.code !== code) {
      session.attempts += 1;
      await session.save();
      throw new Error('Invalid verification code');
    }

    session.isVerified = true;
    await session.save();

    const user = await User.create({
      phoneNumber: session.phoneNumber,
      displayName: displayName.trim(),
      passwordHash: password ? await bcrypt.hash(password, 10) : undefined,
      isOnline: true,
    });

    return this.generateTokens(user);
  }

  /**
   * Login with phone number and password
   */
  async login(phoneNumber: string, password: string): Promise<AuthToken> {
    if (!isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new Error('Password not set. Please use verification code to login.');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    user.isOnline = true;
    await user.save();

    return this.generateTokens(user);
  }

  /**
   * Login with phone number only (no password) - creates user if not exists
   */
  async loginByPhone(phoneNumber: string): Promise<{ tokens: AuthToken; user: IUser; isNewUser: boolean }> {
    if (!isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    let user = await User.findOne({ phoneNumber });
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = await User.create({
        phoneNumber,
        displayName: 'Foydalanuvchi',
        isOnline: true,
      });
      isNewUser = true;
    } else {
      user.isOnline = true;
      await user.save();
    }

    const tokens = this.generateTokens(user);

    return { tokens, user, isNewUser };
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<IUser> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      ) as { userId: string };

      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthToken> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh-secret'
      ) as { userId: string };

      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: IUser): AuthToken {
    const accessToken = jwt.sign(
      { userId: user._id.toString(), phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' } // 24 hours
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' } // 7 days
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 hours in seconds
    };
  }
}
