const express = require('express')
const router = express.Router()
const db = require('../db')
const { adminMiddleware } = require('../middleware/auth')

router.get('/', adminMiddleware, async (req, res) => {
  try {
    const [patients, doctors, appts, revenue] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users WHERE role='patient'"),
      db.query('SELECT COUNT(*) FROM doctors'),
      db.query('SELECT COUNT(*) FROM appointments'),
      db.query(`
        SELECT COALESCE(SUM(d.price),0) AS total
        FROM appointments a
        JOIN doctors d ON d.id=a.doctor_id
        WHERE a.status='completed'
      `),
    ])

    const byStatus = await db.query(`
      SELECT status, COUNT(*) FROM appointments GROUP BY status
    `)

    const topDoctors = await db.query(`
      SELECT d.first_name || ' ' || d.last_name AS name, d.specialization, COUNT(a.id) AS appts
      FROM doctors d
      LEFT JOIN appointments a ON a.doctor_id=d.id
      GROUP BY d.id ORDER BY appts DESC LIMIT 5
    `)

    res.json({
      patients: parseInt(patients.rows[0].count),
      doctors: parseInt(doctors.rows[0].count),
      appointments: parseInt(appts.rows[0].count),
      revenue: parseInt(revenue.rows[0].total),
      by_status: byStatus.rows,
      top_doctors: topDoctors.rows,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
