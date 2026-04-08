import { Router, Response } from 'express';
import db from '../db/database';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all articles (public)
router.get('/', (_req, res: Response): void => {
  try {
    const articles = db
      .prepare(
        `SELECT a.*, u.name as author_name 
         FROM articles a 
         JOIN users u ON a.author_id = u.id 
         ORDER BY a.created_at DESC`
      )
      .all();
    res.json(articles);
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single article
router.get('/:id', (_req, res: Response): void => {
  try {
    const article = db
      .prepare(
        `SELECT a.*, u.name as author_name 
         FROM articles a 
         JOIN users u ON a.author_id = u.id 
         WHERE a.id = ?`
      )
      .get(_req.params.id);
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create article (admin only)
router.post('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { title, content } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ error: 'content is required' });
      return;
    }

    const id = uuidv4();
    db.prepare('INSERT INTO articles (id, title, content, author_id) VALUES (?, ?, ?, ?)').run(
      id,
      title.trim(),
      content.trim(),
      req.userId!
    );

    const article = db
      .prepare(
        `SELECT a.*, u.name as author_name 
         FROM articles a 
         JOIN users u ON a.author_id = u.id 
         WHERE a.id = ?`
      )
      .get(id);
    res.status(201).json(article);
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update article (admin only)
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    const { title, content } = req.body;

    db.prepare(
      `UPDATE articles SET 
        title = COALESCE(?, title), 
        content = COALESCE(?, content),
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(title || null, content || null, req.params.id);

    const article = db
      .prepare(
        `SELECT a.*, u.name as author_name 
         FROM articles a 
         JOIN users u ON a.author_id = u.id 
         WHERE a.id = ?`
      )
      .get(req.params.id);
    res.json(article);
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete article (admin only)
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
