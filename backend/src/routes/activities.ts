import { Router, Response } from 'express';
import db from '../db/database';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Helper: parse JSON fields from a raw activity row
function parseActivity(a: any) {
  return {
    ...a,
    tags: JSON.parse(a.tags),
    instructions: JSON.parse(a.instructions),
    materials: JSON.parse(a.materials),
  };
}

// Get all activities (public) - supports ?type=retro|icebreaker&search=text
// Excludes soft-deleted activities
router.get('/', (req, res: Response): void => {
  try {
    const { type, search } = req.query;
    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];

    if (type && (type === 'retro' || type === 'icebreaker')) {
      conditions.push('type = ?');
      params.push(type);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      conditions.push('(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ?)');
      params.push(term, term, term);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const activities = db.prepare(`SELECT * FROM activities ${where} ORDER BY created_at DESC`).all(...params);

    const parsed = (activities as any[]).map(parseActivity);
    res.json(parsed);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recommend activity based on quiz params (MUST be before /:id)
// Excludes soft-deleted activities
router.get('/recommend/quiz', (req, res: Response): void => {
  try {
    const { type, teamSize, duration, mood } = req.query;

    if (!type) {
      res.status(400).json({ error: 'Type is required' });
      return;
    }

    let activities = db.prepare('SELECT * FROM activities WHERE type = ? AND deleted_at IS NULL').all(type as string) as any[];

    activities = activities.map(parseActivity);

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
// Excludes soft-deleted activities
router.get('/user/recently-viewed', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const activities = db
      .prepare(
        `SELECT a.*, rv.viewed_at 
         FROM recently_viewed rv 
         JOIN activities a ON rv.activity_id = a.id 
         WHERE rv.user_id = ? AND a.deleted_at IS NULL
         ORDER BY rv.viewed_at DESC 
         LIMIT 6`
      )
      .all(req.userId!);

    const parsed = (activities as any[]).map(parseActivity);
    res.json(parsed);
  } catch (error) {
    console.error('Recently viewed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new activity (auth required)
router.post('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const {
      title,
      type,
      duration,
      duration_min,
      duration_max,
      team_size,
      team_size_min,
      team_size_max,
      tags,
      description,
      instructions,
      materials,
    } = req.body;

    // Validation
    if (!title || !type || !duration || !description) {
      res.status(400).json({ error: 'title, type, duration, and description are required' });
      return;
    }

    if (type !== 'retro' && type !== 'icebreaker') {
      res.status(400).json({ error: 'type must be "retro" or "icebreaker"' });
      return;
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO activities (id, title, type, duration, duration_min, duration_max, team_size, team_size_min, team_size_max, tags, description, instructions, materials, creator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      type,
      duration,
      duration_min || 0,
      duration_max || 0,
      team_size || '',
      team_size_min || 0,
      team_size_max || 0,
      JSON.stringify(tags || []),
      description,
      JSON.stringify(instructions || []),
      JSON.stringify(materials || []),
      req.userId!
    );

    const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(id) as any;
    res.status(201).json(parseActivity(activity));
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single activity (public) - AFTER specific routes
// Shows the activity even if soft-deleted (for people who favorited it) but marks it
router.get('/:id', (req, res: Response): void => {
  try {
    const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id) as any;
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    res.json(parseActivity(activity));
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update activity (creator only)
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const activity = db.prepare('SELECT * FROM activities WHERE id = ? AND deleted_at IS NULL').get(req.params.id) as any;
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    if (activity.creator_id !== req.userId) {
      res.status(403).json({ error: 'Only the creator can update this activity' });
      return;
    }

    const {
      title,
      type,
      duration,
      duration_min,
      duration_max,
      team_size,
      team_size_min,
      team_size_max,
      tags,
      description,
      instructions,
      materials,
    } = req.body;

    db.prepare(`
      UPDATE activities SET
        title = COALESCE(?, title),
        type = COALESCE(?, type),
        duration = COALESCE(?, duration),
        duration_min = COALESCE(?, duration_min),
        duration_max = COALESCE(?, duration_max),
        team_size = COALESCE(?, team_size),
        team_size_min = COALESCE(?, team_size_min),
        team_size_max = COALESCE(?, team_size_max),
        tags = COALESCE(?, tags),
        description = COALESCE(?, description),
        instructions = COALESCE(?, instructions),
        materials = COALESCE(?, materials)
      WHERE id = ?
    `).run(
      title || null,
      type || null,
      duration || null,
      duration_min ?? null,
      duration_max ?? null,
      team_size || null,
      team_size_min ?? null,
      team_size_max ?? null,
      tags ? JSON.stringify(tags) : null,
      description || null,
      instructions ? JSON.stringify(instructions) : null,
      materials ? JSON.stringify(materials) : null,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id) as any;
    res.json(parseActivity(updated));
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Soft-delete activity (creator only)
// The activity remains in the DB so favorites references stay valid
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const activity = db.prepare('SELECT * FROM activities WHERE id = ? AND deleted_at IS NULL').get(req.params.id) as any;
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    if (activity.creator_id !== req.userId) {
      res.status(403).json({ error: 'Only the creator can delete this activity' });
      return;
    }

    db.prepare('UPDATE activities SET deleted_at = datetime(\'now\') WHERE id = ?').run(req.params.id);

    res.json({ success: true, message: 'Activity soft-deleted' });
  } catch (error) {
    console.error('Delete activity error:', error);
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
