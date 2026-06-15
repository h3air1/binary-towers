const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { completed, client_id, deal_id, assigned_to } = req.query;
    let query = `
      SELECT t.*,
             c.name AS client_name,
             d.title AS deal_title,
             u.name AS assigned_name
      FROM tasks t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN deals d ON t.deal_id = d.id
      LEFT JOIN users u ON t.assigned_to = u.id
    `;
    const params = [];
    const conditions = [];

    if (completed !== undefined) {
      params.push(completed === 'true');
      conditions.push(`t.completed = $${params.length}`);
    }
    if (client_id) {
      params.push(client_id);
      conditions.push(`t.client_id = $${params.length}`);
    }
    if (deal_id) {
      params.push(deal_id);
      conditions.push(`t.deal_id = $${params.length}`);
    }
    if (assigned_to) {
      params.push(assigned_to);
      conditions.push(`t.assigned_to = $${params.length}`);
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*,
              c.name AS client_name,
              d.title AS deal_title,
              u.name AS assigned_name
       FROM tasks t
       LEFT JOIN clients c ON t.client_id = c.id
       LEFT JOIN deals d ON t.deal_id = d.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, client_id, deal_id, assigned_to, due_date } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const result = await db.query(
      `INSERT INTO tasks (title, description, client_id, deal_id, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, client_id || null, deal_id || null, assigned_to || null, due_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, client_id, deal_id, assigned_to, due_date, completed } = req.body;
    const result = await db.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           client_id = COALESCE($3, client_id),
           deal_id = COALESCE($4, deal_id),
           assigned_to = COALESCE($5, assigned_to),
           due_date = COALESCE($6, due_date),
           completed = COALESCE($7, completed),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, description, client_id, deal_id, assigned_to, due_date, completed, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/complete', async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE tasks SET completed = NOT completed, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
