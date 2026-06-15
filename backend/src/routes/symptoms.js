const express = require('express')
const router = express.Router()
const db = require('../db')
const { adminMiddleware } = require('../middleware/auth')

router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM symptoms ORDER BY name')
    res.json(r.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { name, icon } = req.body
    if (!name) return res.status(400).json({ error: 'name обязателен' })
    const r = await db.query('INSERT INTO symptoms (name,icon) VALUES ($1,$2) RETURNING *', [name, icon || '🩺'])
    res.status(201).json(r.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
