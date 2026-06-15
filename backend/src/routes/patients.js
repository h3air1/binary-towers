const express = require('express')
const router = express.Router()
const db = require('../db')
const { adminMiddleware } = require('../middleware/auth')

router.get('/', adminMiddleware, async (req, res) => {
  try {
    const r = await db.query(
      "SELECT id,email,full_name,phone,role,created_at FROM users WHERE role='patient' ORDER BY created_at DESC"
    )
    res.json(r.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
