import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserService } from '../services/UserService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const userService = new UserService();

/**
 * GET /users/search
 * Search users by query
 */
router.get('/search', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.query as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const users = await userService.searchUsers(query, req.userId!, limit);

    return res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: {
        code: 'SEARCH_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * GET /users/me
 * Get current user profile
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.getUserById(req.userId!);

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        username: user.username,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
});

/**
 * PUT /users/me/update
 * Update user profile
 */
router.put(
  '/me/update',
  authMiddleware,
  [
    body('displayName')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Display name must be 1-100 characters'),
    body('username')
      .optional()
      .matches(/^[a-zA-Z][a-zA-Z0-9_]{2,49}$/)
      .withMessage('Username must be 3-50 characters, start with letter'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be max 500 characters'),
  ],
  async (req: AuthRequest, res: Response) => {
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

      const { displayName, username, bio } = req.body;
      const user = await userService.updateProfile(req.userId!, {
        displayName,
        username,
        bio,
      });

      return res.json({
        success: true,
        data: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          username: user.username,
          displayName: user.displayName,
          profilePicture: user.profilePicture,
          bio: user.bio,
        },
      });
    } catch (error: any) {
      return res.status(400).json({
        error: {
          code: 'UPDATE_ERROR',
          message: error.message,
        },
      });
    }
  }
);

/**
 * PUT /users/me/photo
 * Update profile picture (base64 or URL)
 */
router.put(
  '/me/photo',
  authMiddleware,
  [
    body('photo')
      .notEmpty()
      .withMessage('Photo is required'),
  ],
  async (req: AuthRequest, res: Response) => {
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

      const { photo } = req.body;
      const user = await userService.updateProfilePicture(req.userId!, photo);

      return res.json({
        success: true,
        data: {
          id: user.id,
          profilePicture: user.profilePicture,
        },
      });
    } catch (error: any) {
      return res.status(400).json({
        error: {
          code: 'UPDATE_ERROR',
          message: error.message,
        },
      });
    }
  }
);

/**
 * DELETE /users/me/photo
 * Remove profile picture
 */
router.delete('/me/photo', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await userService.removeProfilePicture(req.userId!);

    return res.json({
      success: true,
      message: 'Profile picture removed',
    });
  } catch (error: any) {
    return res.status(400).json({
      error: {
        code: 'DELETE_ERROR',
        message: error.message,
      },
    });
  }
});

export default router;
