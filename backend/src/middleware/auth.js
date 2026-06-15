const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET
if (!SECRET) throw new Error('JWT_SECRET must be set in environment')

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    req.user = jwt.verify(header.slice(7), SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    next()
  })
}

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    try { req.user = jwt.verify(header.slice(7), SECRET) } catch {}
  }
  next()
}

module.exports = { authMiddleware, adminMiddleware, optionalAuth }
