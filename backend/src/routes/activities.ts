import { Router, Response } from 'express';
import db from '../db/database';
import { AuthRequest, authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router: Router = Router();

// Helper: parse JSON fields from a raw activity row
function parseActivity(a: any) {
  return {
    ...a,
    tags: JSON.parse(a.tags),
    instructions: JSON.parse(a.instructions),
    materials: JSON.parse(a.materials),
    is_global: !!a.is_global,
  };
}

// Build visibility WHERE clause:
// User sees: global activities (is_global=1 OR creator_id IS NULL) + their own
function visibilityCondition(userId?: string): { clause: string; params: any[] } {
  if (userId) {
    return {
      clause: '(is_global = 1 OR creator_id IS NULL OR creator_id = ?)',
      params: [userId],
    };
  }
  // Unauthenticated: only global/seed activities
  return {
    clause: '(is_global = 1 OR creator_id IS NULL)',
    params: [],
  };
}

// Get all activities - supports ?type=retro|icebreaker&search=text
// Visibility: global + user's own. Excludes soft-deleted.
router.get('/', optionalAuthMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { type, search } = req.query;
    const vis = visibilityCondition(req.userId);
    const conditions: string[] = ['deleted_at IS NULL', vis.clause];
    const params: any[] = [...vis.params];

    if (type && (type === 'retro' || type === 'icebreaker')) {
      conditions.push('type = ?');
      params.push(type);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      conditions.push('(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ?)');
      params.push(term, term, term);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const activities = db.prepare(`SELECT * FROM activities ${where} ORDER BY created_at DESC`).all(...params);

    const parsed = (activities as any[]).map(parseActivity);
    res.json(parsed);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recommend activity based on quiz params (MUST be before /:id)
// Same visibility rules
router.get('/recommend/quiz', optionalAuthMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const { type, teamSize, duration, mood } = req.query;

    if (!type) {
      res.status(400).json({ error: 'Type is required' });
      return;
    }

    const vis = visibilityCondition(req.userId);
    const conditions = ['type = ?', 'deleted_at IS NULL', vis.clause];
    const params = [type as string, ...vis.params];

    let activities = db
      .prepare(`SELECT * FROM activities WHERE ${conditions.join(' AND ')}`)
      .all(...params) as any[];

    activities = activities.map(parseActivity);

    // Score each activity
    const scored = activities.map((activity) => {
      let score = 0;

      if (teamSize) {
        const [minStr, maxStr] = (teamSize as string).split('-');
        const userMin = parseInt(minStr);
        const userMax = maxStr ? parseInt(maxStr) : 999;
        if (activity.team_size_min <= userMax && activity.team_size_max >= userMin) {
          score += 3;
        }
      }

      if (duration) {
        const [minStr, maxStr] = (duration as string).split('-');
        const userMin = parseInt(minStr);
        const userMax = maxStr ? parseInt(maxStr) : 999;
        if (activity.duration_min <= userMax && activity.duration_max >= userMin) {
          score += 2;
        }
      }

      if (mood) {
        const moodTagMap: Record<string, string[]> = {
          fun: ['Fun', 'Amusant', 'Creatif', 'Rapide'],
          serious: ['Reflexion', 'Structure', 'Apprentissage'],
          creative: ['Creatif', 'Metaphore', 'Communication'],
        };
        const targetTags = moodTagMap[mood as string] || [];
        const matchCount = activity.tags.filter((t: string) =>
          targetTags.some((mt: string) => t.toLowerCase().includes(mt.toLowerCase()))
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
// Admin -> is_global=1, regular user -> is_global=0 (user-scoped)
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
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    if (title.length > 200) {
      res.status(400).json({ error: 'title must be 200 characters or less' });
      return;
    }
    if (!type || (type !== 'retro' && type !== 'icebreaker')) {
      res.status(400).json({ error: 'type must be "retro" or "icebreaker"' });
      return;
    }
    if (!duration || typeof duration !== 'string') {
      res.status(400).json({ error: 'duration is required' });
      return;
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({ error: 'description is required' });
      return;
    }
    if (description.length > 5000) {
      res.status(400).json({ error: 'description must be 5000 characters or less' });
      return;
    }
    if (tags && !Array.isArray(tags)) {
      res.status(400).json({ error: 'tags must be an array' });
      return;
    }
    if (instructions && !Array.isArray(instructions)) {
      res.status(400).json({ error: 'instructions must be an array' });
      return;
    }
    if (materials && !Array.isArray(materials)) {
      res.status(400).json({ error: 'materials must be an array' });
      return;
    }

    const id = uuidv4();
    const isGlobal = req.isAdmin ? 1 : 0;

    db.prepare(`
      INSERT INTO activities (id, title, type, duration, duration_min, duration_max, team_size, team_size_min, team_size_max, tags, description, instructions, materials, creator_id, is_global)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title.trim(),
      type,
      duration,
      Number(duration_min) || 0,
      Number(duration_max) || 0,
      team_size || '',
      Number(team_size_min) || 0,
      Number(team_size_max) || 0,
      JSON.stringify(tags || []),
      description.trim(),
      JSON.stringify(instructions || []),
      JSON.stringify(materials || []),
      req.userId!,
      isGlobal
    );

    const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(id) as any;
    res.status(201).json(parseActivity(activity));
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clone an activity (auth required) -- creates a user-scoped copy
router.post('/:id/clone', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const source = db.prepare('SELECT * FROM activities WHERE id = ? AND deleted_at IS NULL').get(req.params.id) as any;
    if (!source) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    const newId = uuidv4();
    db.prepare(`
      INSERT INTO activities (id, title, type, duration, duration_min, duration_max, team_size, team_size_min, team_size_max, tags, description, instructions, materials, creator_id, is_global)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      newId,
      source.title + ' (copie)',
      source.type,
      source.duration,
      source.duration_min,
      source.duration_max,
      source.team_size,
      source.team_size_min,
      source.team_size_max,
      source.tags,
      source.description,
      source.instructions,
      source.materials,
      req.userId!
    );

    const cloned = db.prepare('SELECT * FROM activities WHERE id = ?').get(newId) as any;
    res.status(201).json(parseActivity(cloned));
  } catch (error) {
    console.error('Clone activity error:', error);
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

    if (type && type !== 'retro' && type !== 'icebreaker') {
      res.status(400).json({ error: 'type must be "retro" or "icebreaker"' });
      return;
    }
    if (title && (typeof title !== 'string' || title.length > 200)) {
      res.status(400).json({ error: 'title must be a string of 200 characters or less' });
      return;
    }
    if (description && (typeof description !== 'string' || description.length > 5000)) {
      res.status(400).json({ error: 'description must be a string of 5000 characters or less' });
      return;
    }
    if (tags && !Array.isArray(tags)) {
      res.status(400).json({ error: 'tags must be an array' });
      return;
    }
    if (instructions && !Array.isArray(instructions)) {
      res.status(400).json({ error: 'instructions must be an array' });
      return;
    }
    if (materials && !Array.isArray(materials)) {
      res.status(400).json({ error: 'materials must be an array' });
      return;
    }

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

    db.prepare('DELETE FROM recently_viewed WHERE user_id = ? AND activity_id = ?').run(userId, activityId);

    db.prepare('INSERT INTO recently_viewed (id, user_id, activity_id) VALUES (?, ?, ?)').run(
      uuidv4(),
      userId,
      activityId
    );

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
