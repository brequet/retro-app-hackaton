import { Router, Response } from 'express';
import db from '../db/database';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all activities (public)
router.get('/', (req, res: Response): void => {
  try {
    const { type } = req.query;
    let activities;
    if (type && (type === 'retro' || type === 'icebreaker')) {
      activities = db.prepare('SELECT * FROM activities WHERE type = ? ORDER BY created_at DESC').all(type);
    } else {
      activities = db.prepare('SELECT * FROM activities ORDER BY created_at DESC').all();
    }

    // Parse JSON fields
    const parsed = (activities as any[]).map((a) => ({
      ...a,
      tags: JSON.parse(a.tags),
      instructions: JSON.parse(a.instructions),
      materials: JSON.parse(a.materials),
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recommend activity based on quiz params (MUST be before /:id)
router.get('/recommend/quiz', (req, res: Response): void => {
  try {
    const { type, teamSize, duration, mood } = req.query;

    if (!type) {
      res.status(400).json({ error: 'Type is required' });
      return;
    }

    let activities = db.prepare('SELECT * FROM activities WHERE type = ?').all(type as string) as any[];

    // Parse JSON fields
    activities = activities.map((a) => ({
      ...a,
      tags: JSON.parse(a.tags),
      instructions: JSON.parse(a.instructions),
      materials: JSON.parse(a.materials),
    }));

    // Score each activity
    const scored = activities.map((activity) => {
      let score = 0;

      // Team size match
      if (teamSize) {
        const [minStr, maxStr] = (teamSize as string).split('-');
        const userMin = parseInt(minStr);
        const userMax = maxStr ? parseInt(maxStr) : 999;
        if (activity.team_size_min <= userMax && activity.team_size_max >= userMin) {
          score += 3;
        }
      }

      // Duration match
      if (duration) {
        const [minStr, maxStr] = (duration as string).split('-');
        const userMin = parseInt(minStr);
        const userMax = maxStr ? parseInt(maxStr) : 999;
        if (activity.duration_min <= userMax && activity.duration_max >= userMin) {
          score += 2;
        }
      }

      // Mood/tag match
      if (mood) {
        const moodTagMap: Record<string, string[]> = {
          fun: ['Fun', 'Amusant', 'Créatif', 'Rapide'],
          serious: ['Réflexion', 'Structure', 'Apprentissage'],
          creative: ['Créatif', 'Métaphore', 'Communication'],
        };
        const targetTags = moodTagMap[mood as string] || [];
        const matchCount = activity.tags.filter((t: string) =>
          targetTags.some((mt) => t.toLowerCase().includes(mt.toLowerCase()))
        ).length;
        score += matchCount * 2;
      }

      return { ...activity, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      res.status(404).json({ error: 'No matching activities found' });
      return;
    }

    res.json(scored[0]);
  } catch (error) {
    console.error('Recommend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recently viewed (protected) - MUST be before /:id
router.get('/user/recently-viewed', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const activities = db
      .prepare(
        `SELECT a.*, rv.viewed_at 
         FROM recently_viewed rv 
         JOIN activities a ON rv.activity_id = a.id 
         WHERE rv.user_id = ? 
         ORDER BY rv.viewed_at DESC 
         LIMIT 6`
      )
      .all(req.userId!);

    const parsed = (activities as any[]).map((a) => ({
      ...a,
      tags: JSON.parse(a.tags),
      instructions: JSON.parse(a.instructions),
      materials: JSON.parse(a.materials),
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Recently viewed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single activity (public) - AFTER specific routes
router.get('/:id', (req, res: Response): void => {
  try {
    const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id) as any;
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    res.json({
      ...activity,
      tags: JSON.parse(activity.tags),
      instructions: JSON.parse(activity.instructions),
      materials: JSON.parse(activity.materials),
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark activity as viewed (protected)
router.post('/:id/view', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const activityId = req.params.id;
    const userId = req.userId!;

    // Remove old entry if exists
    db.prepare('DELETE FROM recently_viewed WHERE user_id = ? AND activity_id = ?').run(userId, activityId);

    // Insert new entry
    db.prepare('INSERT INTO recently_viewed (id, user_id, activity_id) VALUES (?, ?, ?)').run(
      uuidv4(),
      userId,
      activityId
    );

    // Keep only last 20 entries
    db.prepare(
      `DELETE FROM recently_viewed WHERE user_id = ? AND id NOT IN (
        SELECT id FROM recently_viewed WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 20
      )`
    ).run(userId, userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Mark viewed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
