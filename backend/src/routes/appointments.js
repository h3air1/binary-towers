const express = require('express')
const router = express.Router()
const db = require('../db')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')

router.get('/', adminMiddleware, async (req, res) => {
  try {
    const r = await db.query(`
      SELECT a.*,
             u.full_name AS patient_name, u.email AS patient_email, u.phone AS patient_phone,
             d.first_name || ' ' || d.last_name AS doctor_name,
             d.specialization,
             s.starts_at, s.ends_at
      FROM appointments a
      LEFT JOIN users u ON u.id = a.patient_id
      LEFT JOIN doctors d ON d.id = a.doctor_id
      LEFT JOIN slots s ON s.id = a.slot_id
      ORDER BY s.starts_at DESC
    `)
    res.json(r.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const r = await db.query(`
      SELECT a.*,
             d.first_name || ' ' || d.last_name AS doctor_name,
             d.specialization, d.photo_url,
             s.starts_at, s.ends_at
      FROM appointments a
      LEFT JOIN doctors d ON d.id = a.doctor_id
      LEFT JOIN slots s ON s.id = a.slot_id
      WHERE a.patient_id = $1
      ORDER BY s.starts_at DESC
    `, [req.user.id])
    res.json(r.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  const client = await db.connect()
  try {
    await client.query('BEGIN')
    const { doctor_id, slot_id, notes } = req.body
    if (!doctor_id || !slot_id) return res.status(400).json({ error: 'doctor_id и slot_id обязательны' })

    const slot = await client.query('SELECT * FROM slots WHERE id=$1 FOR UPDATE', [slot_id])
    if (!slot.rows.length) return res.status(404).json({ error: 'Слот не найден' })
    if (slot.rows[0].is_booked) return res.status(409).json({ error: 'Слот уже занят' })

    await client.query('UPDATE slots SET is_booked=true WHERE id=$1', [slot_id])
    const r = await client.query(
      'INSERT INTO appointments (patient_id,doctor_id,slot_id,notes) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.id, doctor_id, slot_id, notes || null]
    )
    await client.query('COMMIT')

    const full = await db.query(`
      SELECT a.*,
             d.first_name || ' ' || d.last_name AS doctor_name,
             d.specialization, s.starts_at, s.ends_at
      FROM appointments a
      LEFT JOIN doctors d ON d.id=a.doctor_id
      LEFT JOIN slots s ON s.id=a.slot_id
      WHERE a.id=$1
    `, [r.rows[0].id])

    res.status(201).json(full.rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    client.release()
  }
})

router.patch('/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['confirmed', 'completed', 'cancelled']
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Недопустимый статус' })
    const r = await db.query('UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id])
    if (!r.rows.length) return res.status(404).json({ error: 'Appointment not found' })
    res.json(r.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', adminMiddleware, async (req, res) => {
  const client = await db.connect()
  try {
    await client.query('BEGIN')
    const appt = await client.query('SELECT slot_id FROM appointments WHERE id=$1', [req.params.id])
    if (!appt.rows.length) return res.status(404).json({ error: 'Not found' })
    if (appt.rows[0].slot_id) {
      await client.query('UPDATE slots SET is_booked=false WHERE id=$1', [appt.rows[0].slot_id])
    }
    await client.query('DELETE FROM appointments WHERE id=$1', [req.params.id])
    await client.query('COMMIT')
    res.json({ deleted: parseInt(req.params.id) })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    client.release()
  }
})

module.exports = router
