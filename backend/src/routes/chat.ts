import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ChatService } from '../services/ChatService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const chatService = new ChatService();

/**
 * POST /chats/create
 * Create a new chat or get existing one
 */
router.post(
  '/create',
  authMiddleware,
  [body('participantId').notEmpty().withMessage('Participant ID is required')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', details: errors.array() },
        });
      }

      const { participantId } = req.body;

      if (participantId === req.userId) {
        return res.status(400).json({
          error: { code: 'INVALID_REQUEST', message: 'Cannot create chat with yourself' },
        });
      }

      const chat = await chatService.createChat(req.userId!, participantId);

      return res.status(201).json({ success: true, data: chat });
    } catch (error: any) {
      return res.status(400).json({
        error: { code: 'CREATE_ERROR', message: error.message },
      });
    }
  }
);

/**
 * GET /chats/my
 * Get all chats for current user
 */
router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const chats = await chatService.getMyChats(req.userId!);
    return res.json({ success: true, data: chats });
  } catch (error: any) {
    return res.status(500).json({
      error: { code: 'FETCH_ERROR', message: error.message },
    });
  }
});

/**
 * GET /chats/:chatId
 * Get single chat by ID
 */
router.get('/:chatId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const chat = await chatService.getChatById(chatId, req.userId!);

    if (!chat) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Chat not found' },
      });
    }

    return res.json({ success: true, data: chat });
  } catch (error: any) {
    return res.status(500).json({
      error: { code: 'FETCH_ERROR', message: error.message },
    });
  }
});

/**
 * GET /chats/user/:userId
 * Get chat with specific user
 */
router.get('/user/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const chat = await chatService.getChatByParticipant(req.userId!, userId);

    return res.json({ success: true, data: chat });
  } catch (error: any) {
    return res.status(500).json({
      error: { code: 'FETCH_ERROR', message: error.message },
    });
  }
});

/**
 * DELETE /chats/:chatId
 * Delete a chat
 */
router.delete('/:chatId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    await chatService.deleteChat(chatId, req.userId!);

    return res.json({ success: true, message: 'Chat deleted' });
  } catch (error: any) {
    return res.status(400).json({
      error: { code: 'DELETE_ERROR', message: error.message },
    });
  }
});

export default router;
