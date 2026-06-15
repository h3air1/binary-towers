const express = require('express')
const router = express.Router()
const db = require('../db')
const { adminMiddleware } = require('../middleware/auth')
const { getSpecsForSymptoms } = require('../config/symptomMap')

router.get('/', async (req, res) => {
  try {
    const { symptoms } = req.query
    let query = `
      SELECT d.*,
             COALESCE(json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name, 'icon', s.icon))
               FILTER (WHERE s.id IS NOT NULL), '[]') AS symptoms
      FROM doctors d
      LEFT JOIN doctor_symptoms ds ON ds.doctor_id = d.id
      LEFT JOIN symptoms s ON s.id = ds.symptom_id
    `
    const params = []

    if (symptoms) {
      const ids = symptoms.split(',').map(Number).filter(Boolean)
      if (ids.length) {
        // Resolve symptom names from DB
        const nameRes = await db.query('SELECT name FROM symptoms WHERE id = ANY($1)', [ids])
        const names = nameRes.rows.map(r => r.name)

        // Map symptom names → specializations via config
        const specs = getSpecsForSymptoms(names)

        if (specs.length === 0) {
          // No mapping found for these symptoms → return empty with a hint
          return res.json({ doctors: [], message: 'no_mapping' })
        }

        params.push(specs)
        query += ' WHERE d.specialization = ANY($1)'
      }
    }

    query += ' GROUP BY d.id ORDER BY d.rating DESC'
    const r = await db.query(query, params)
    res.json({ doctors: r.rows, message: r.rows.length === 0 ? 'no_results' : 'ok' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const r = await db.query(`
      SELECT d.*,
             COALESCE(json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name, 'icon', s.icon))
               FILTER (WHERE s.id IS NOT NULL), '[]') AS symptoms
      FROM doctors d
      LEFT JOIN doctor_symptoms ds ON ds.doctor_id = d.id
      LEFT JOIN symptoms s ON s.id = ds.symptom_id
      WHERE d.id = $1
      GROUP BY d.id
    `, [req.params.id])
    if (!r.rows.length) return res.status(404).json({ error: 'Doctor not found' })
    res.json(r.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id/slots', async (req, res) => {
  try {
    const r = await db.query(`
      SELECT * FROM slots
      WHERE doctor_id = $1
        AND is_booked = false
        AND starts_at > NOW()
      ORDER BY starts_at ASC
      LIMIT 30
    `, [req.params.id])
    res.json(r.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { first_name, last_name, specialization, bio, photo_url, experience_years, price, email, phone } = req.body
    if (!first_name || !last_name || !specialization) return res.status(400).json({ error: 'first_name, last_name, specialization обязательны' })
    const r = await db.query(
      `INSERT INTO doctors (first_name,last_name,specialization,bio,photo_url,experience_years,price,email,phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [first_name, last_name, specialization, bio, photo_url, experience_years || 0, price || 3000, email, phone]
    )
    res.status(201).json(r.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { first_name, last_name, specialization, bio, photo_url, experience_years, price, email, phone } = req.body
    const r = await db.query(
      `UPDATE doctors SET
         first_name=COALESCE($1,first_name), last_name=COALESCE($2,last_name),
         specialization=COALESCE($3,specialization), bio=COALESCE($4,bio),
         photo_url=COALESCE($5,photo_url), experience_years=COALESCE($6,experience_years),
         price=COALESCE($7,price), email=COALESCE($8,email), phone=COALESCE($9,phone)
       WHERE id=$10 RETURNING *`,
      [first_name, last_name, specialization, bio, photo_url, experience_years, price, email, phone, req.params.id]
    )
    if (!r.rows.length) return res.status(404).json({ error: 'Doctor not found' })
    res.json(r.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const r = await db.query('DELETE FROM doctors WHERE id=$1 RETURNING id', [req.params.id])
    if (!r.rows.length) return res.status(404).json({ error: 'Doctor not found' })
    res.json({ deleted: r.rows[0].id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
