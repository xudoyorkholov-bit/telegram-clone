import { Router, Response } from 'express';
import { upload } from '../config/multer';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Media } from '../models/Media';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * POST /media/upload
 * Upload an image or video file
 */
router.post(
  '/upload',
  authMiddleware,
  upload.single('media'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: { code: 'NO_FILE', message: 'No file uploaded' },
        });
      }

      // Determine media type
      const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

      // Save media info to database
      const media = await Media.create({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        uploadedBy: req.userId,
      });

      return res.status(201).json({
        success: true,
        data: {
          id: media._id.toString(),
          filename: media.filename,
          originalName: media.originalName,
          mimetype: media.mimetype,
          size: media.size,
          mediaType: mediaType,
          url: `/api/media/${media._id}`,
        },
      });
    } catch (error: any) {
      // Clean up uploaded file if database save fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({
        error: { code: 'UPLOAD_ERROR', message: error.message },
      });
    }
  }
);

/**
 * GET /media/:mediaId
 * Serve an uploaded image
 */
router.get('/:mediaId', async (req, res: Response) => {
  try {
    const { mediaId } = req.params;
    
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Media not found' },
      });
    }

    // Check if file exists
    if (!fs.existsSync(media.path)) {
      return res.status(404).json({
        error: { code: 'FILE_NOT_FOUND', message: 'File not found on disk' },
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', media.mimetype);
    res.setHeader('Content-Length', media.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the file
    const fileStream = fs.createReadStream(media.path);
    fileStream.pipe(res);
  } catch (error: any) {
    return res.status(500).json({
      error: { code: 'SERVE_ERROR', message: error.message },
    });
  }
});

/**
 * DELETE /media/:mediaId
 * Delete an uploaded image (only by uploader)
 */
router.delete('/:mediaId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { mediaId } = req.params;
    
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Media not found' },
      });
    }

    // Check if user is the uploader
    if (media.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You can only delete your own uploads' },
      });
    }

    // Delete file from disk
    if (fs.existsSync(media.path)) {
      fs.unlinkSync(media.path);
    }

    // Delete from database
    await Media.findByIdAndDelete(mediaId);

    return res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({
      error: { code: 'DELETE_ERROR', message: error.message },
    });
  }
});

export default router;