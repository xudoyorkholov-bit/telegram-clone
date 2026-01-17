import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { MessageService } from '../services/MessageService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const messageService = new MessageService();

/**
 * POST /messages
 * Send a message
 */
router.post(
  '/',
  authMiddleware,
  [
    body('recipientId').notEmpty().withMessage('Recipient ID is required'),
    body('text').optional().isString(),
    body('mediaId').optional().isString(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', details: errors.array() },
        });
      }

      const { recipientId, text, mediaId, mediaType } = req.body;

      const message = await messageService.sendMessage({
        senderId: req.userId!,
        recipientId,
        text,
        mediaId,
        mediaType,
      });

      return res.status(201).json({ success: true, data: message });
    } catch (error: any) {
      return res.status(400).json({
        error: { code: 'SEND_ERROR', message: error.message },
      });
    }
  }
);

/**
 * GET /messages/:userId
 * Get messages with a specific user
 */
router.get('/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before as string;

    const messages = await messageService.getMessages(
      req.userId!,
      userId,
      limit,
      before
    );

    return res.json({ success: true, data: messages });
  } catch (error: any) {
    return res.status(500).json({
      error: { code: 'FETCH_ERROR', message: error.message },
    });
  }
});

/**
 * GET /messages/chats/list
 * Get user's chat list
 */
router.get('/chats/list', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const chats = await messageService.getChats(req.userId!);
    return res.json({ success: true, data: chats });
  } catch (error: any) {
    return res.status(500).json({
      error: { code: 'FETCH_ERROR', message: error.message },
    });
  }
});

/**
 * PUT /messages/:messageId
 * Edit a message
 */
router.put(
  '/:messageId',
  authMiddleware,
  [body('text').notEmpty().withMessage('Text is required')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', details: errors.array() },
        });
      }

      const { messageId } = req.params;
      const { text } = req.body;

      const message = await messageService.editMessage(messageId, req.userId!, text);

      return res.json({ success: true, data: message });
    } catch (error: any) {
      return res.status(400).json({
        error: { code: 'EDIT_ERROR', message: error.message },
      });
    }
  }
);

/**
 * DELETE /messages/:messageId
 * Delete a message
 */
router.delete('/:messageId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const forEveryone = req.query.forEveryone === 'true';

    await messageService.deleteMessage(messageId, req.userId!, forEveryone);

    return res.json({ success: true, message: 'Message deleted' });
  } catch (error: any) {
    return res.status(400).json({
      error: { code: 'DELETE_ERROR', message: error.message },
    });
  }
});

/**
 * POST /messages/:userId/read
 * Mark messages as read
 */
router.post('/:userId/read', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    await messageService.markAsRead(req.userId!, userId);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({
      error: { code: 'UPDATE_ERROR', message: error.message },
    });
  }
});

/**
 * GET /messages/search
 * Search messages
 */
router.get(
  '/search/query',
  authMiddleware,
  [query('q').notEmpty().withMessage('Search query is required')],
  async (req: AuthRequest, res: Response) => {
    try {
      const q = req.query.q as string;
      const chatUserId = req.query.chatUserId as string;

      const messages = await messageService.searchMessages(req.userId!, q, chatUserId);

      return res.json({ success: true, data: messages });
    } catch (error: any) {
      return res.status(500).json({
        error: { code: 'SEARCH_ERROR', message: error.message },
      });
    }
  }
);

export default router;
