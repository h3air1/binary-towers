const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { authMiddleware } = require('../middleware/auth')

const SECRET = process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET must be set') })()
const sign = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' })

router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body
    if (!email || !password || !full_name) return res.status(400).json({ error: 'email, password и full_name обязательны' })
    if (password.length < 6) return res.status(400).json({ error: 'Пароль минимум 6 символов' })

    const exists = await db.query('SELECT id FROM users WHERE email=$1', [email])
    if (exists.rows.length) return res.status(409).json({ error: 'Email уже зарегистрирован' })

    const hash = await bcrypt.hash(password, 10)
    const r = await db.query(
      'INSERT INTO users (email,password_hash,full_name,phone) VALUES ($1,$2,$3,$4) RETURNING id,email,full_name,phone,role',
      [email, hash, full_name, phone || null]
    )
    const user = r.rows[0]
    res.status(201).json({ token: sign(user), user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email и password обязательны' })

    const r = await db.query('SELECT * FROM users WHERE email=$1', [email])
    if (!r.rows.length) return res.status(401).json({ error: 'Неверный email или пароль' })

    const user = r.rows[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Неверный email или пароль' })

    const { password_hash, ...safe } = user
    res.json({ token: sign(safe), user: safe })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const r = await db.query('SELECT id,email,full_name,phone,role,created_at FROM users WHERE id=$1', [req.user.id])
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' })
    res.json(r.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
