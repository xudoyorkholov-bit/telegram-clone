import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/AuthService';

const router = Router();
const authService = new AuthService();

/**
 * POST /auth/register
 * Initiate registration with phone number
 * Requirements: 1.1, 1.3
 */
router.post(
  '/register',
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+[1-9]\d{6,14}$/)
      .withMessage('Invalid phone number format. Use: +[country code][number]'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: errors.array(),
          },
        });
      }

      const { phoneNumber } = req.body;
      const result = await authService.registerUser(phoneNumber);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: {
          code: 'REGISTRATION_ERROR',
          message: error.message,
        },
      });
    }
  }
);

/**
 * POST /auth/verify
 * Verify code and create account
 * Requirements: 1.2, 1.4
 */
router.post(
  '/verify',
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('code')
      .notEmpty()
      .withMessage('Verification code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('Code must be 6 digits'),
    body('displayName')
      .notEmpty()
      .withMessage('Display name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Display name must be 1-100 characters'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: errors.array(),
          },
        });
      }

      const { sessionId, code, displayName, password } = req.body;
      const tokens = await authService.verifyCode(
        sessionId,
        code,
        displayName,
        password
      );

      return res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: {
          code: 'VERIFICATION_ERROR',
          message: error.message,
        },
      });
    }
  }
);

/**
 * POST /auth/login
 * Login with phone and password
 */
router.post(
  '/login',
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+[1-9]\d{6,14}$/)
      .withMessage('Invalid phone number format'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: errors.array(),
          },
        });
      }

      const { phoneNumber, password } = req.body;
      const tokens = await authService.login(phoneNumber, password);

      return res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error: any) {
      return res.status(401).json({
        error: {
          code: 'LOGIN_ERROR',
          message: error.message,
        },
      });
    }
  }
);

/**
 * POST /auth/login-phone
 * Login with phone number only (creates user if not exists)
 */
router.post(
  '/login-phone',
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+[1-9]\d{6,14}$/)
      .withMessage('Invalid phone number format'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: errors.array(),
          },
        });
      }

      const { phoneNumber } = req.body;
      const { tokens, user, isNewUser } = await authService.loginByPhone(phoneNumber);

      return res.status(200).json({
        success: true,
        data: {
          ...tokens,
          user: {
            id: user._id.toString(),
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            username: user.username,
            bio: user.bio,
            profilePicture: user.profilePicture,
          },
          isNewUser,
        },
      });
    } catch (error: any) {
      return res.status(401).json({
        error: {
          code: 'LOGIN_ERROR',
          message: error.message,
        },
      });
    }
  }
);

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: errors.array(),
          },
        });
      }

      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);

      return res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error: any) {
      return res.status(401).json({
        error: {
          code: 'REFRESH_ERROR',
          message: error.message,
        },
      });
    }
  }
);

export default router;
