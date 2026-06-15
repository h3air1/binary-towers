const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { stage, client_id } = req.query;
    let query = `
      SELECT d.*, c.name AS client_name, u.name AS assigned_name
      FROM deals d
      LEFT JOIN clients c ON d.client_id = c.id
      LEFT JOIN users u ON d.assigned_to = u.id
    `;
    const params = [];
    const conditions = [];

    if (stage) {
      params.push(stage);
      conditions.push(`d.stage = $${params.length}`);
    }
    if (client_id) {
      params.push(client_id);
      conditions.push(`d.client_id = $${params.length}`);
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY d.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        stage,
        COUNT(*) AS count,
        COALESCE(SUM(amount), 0) AS total_amount
      FROM deals
      GROUP BY stage
      ORDER BY stage
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT d.*, c.name AS client_name, u.name AS assigned_name
       FROM deals d
       LEFT JOIN clients c ON d.client_id = c.id
       LEFT JOIN users u ON d.assigned_to = u.id
       WHERE d.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Deal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, client_id, amount, stage, assigned_to, notes } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const result = await db.query(
      `INSERT INTO deals (title, client_id, amount, stage, assigned_to, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, client_id || null, amount || 0, stage || 'new', assigned_to || null, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, client_id, amount, stage, assigned_to, notes } = req.body;
    const result = await db.query(
      `UPDATE deals
       SET title = COALESCE($1, title),
           client_id = COALESCE($2, client_id),
           amount = COALESCE($3, amount),
           stage = COALESCE($4, stage),
           assigned_to = COALESCE($5, assigned_to),
           notes = COALESCE($6, notes),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, client_id, amount, stage, assigned_to, notes, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Deal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM deals WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Deal not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
