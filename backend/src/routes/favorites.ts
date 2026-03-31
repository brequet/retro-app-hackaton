import { Router, Response } from 'express';
import db from '../db/database';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// All routes require auth
router.use(authMiddleware);

// Get user's favorites
router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const favorites = db
      .prepare(
        `SELECT a.*, f.created_at as favorited_at 
         FROM favorites f 
         JOIN activities a ON f.activity_id = a.id 
         WHERE f.user_id = ? 
         ORDER BY f.created_at DESC`
      )
      .all(req.userId!);

    const parsed = (favorites as any[]).map((a) => ({
      ...a,
      tags: JSON.parse(a.tags),
      instructions: JSON.parse(a.instructions),
      materials: JSON.parse(a.materials),
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get favorite IDs only (for quick checks)
router.get('/ids', (req: AuthRequest, res: Response): void => {
  try {
    const favorites = db
      .prepare('SELECT activity_id FROM favorites WHERE user_id = ?')
      .all(req.userId!) as any[];

    res.json(favorites.map((f) => f.activity_id));
  } catch (error) {
    console.error('Get favorite IDs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add to favorites
router.post('/:activityId', (req: AuthRequest, res: Response): void => {
  try {
    const { activityId } = req.params;
    const userId = req.userId!;

    // Check activity exists
    const activity = db.prepare('SELECT id FROM activities WHERE id = ?').get(activityId);
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    // Check if already favorited
    const existing = db
      .prepare('SELECT id FROM favorites WHERE user_id = ? AND activity_id = ?')
      .get(userId, activityId);
    if (existing) {
      res.status(409).json({ error: 'Already in favorites' });
      return;
    }

    db.prepare('INSERT INTO favorites (id, user_id, activity_id) VALUES (?, ?, ?)').run(
      uuidv4(),
      userId,
      activityId
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove from favorites
router.delete('/:activityId', (req: AuthRequest, res: Response): void => {
  try {
    const { activityId } = req.params;
    const userId = req.userId!;

    const result = db
      .prepare('DELETE FROM favorites WHERE user_id = ? AND activity_id = ?')
      .run(userId, activityId);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Favorite not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
