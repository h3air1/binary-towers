const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }))
app.use(express.json({ limit: '10kb' }))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/doctors', require('./routes/doctors'))
app.use('/api/symptoms', require('./routes/symptoms'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/patients', require('./routes/patients'))
app.use('/api/stats', require('./routes/stats'))

app.get('/api/health', async (req, res) => {
  const db = require('./db')
  try {
    await db.query('SELECT 1')
    res.json({ status: 'alive', database: 'connected' })
  } catch {
    res.status(503).json({ status: 'alive', database: 'disconnected' })
  }
})

app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
