-- CLINIC CRM — Database Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialization VARCHAR(150) NOT NULL,
  bio TEXT,
  photo_url TEXT,
  experience_years INT DEFAULT 0,
  price INT DEFAULT 3000,
  rating NUMERIC(3,1) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS symptoms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  icon VARCHAR(50) DEFAULT '🩺'
);

CREATE TABLE IF NOT EXISTS doctor_symptoms (
  doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
  symptom_id INT REFERENCES symptoms(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, symptom_id)
);

CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES users(id) ON DELETE SET NULL,
  doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
  slot_id INT UNIQUE REFERENCES slots(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES users(id) ON DELETE SET NULL,
  doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id INT REFERENCES appointments(id) ON DELETE SET NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed: admin user (password: Admin1234!)
INSERT INTO users (email, password_hash, full_name, role)
VALUES ('admin@clinic.kz', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Главный администратор', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed: symptoms
INSERT INTO symptoms (name, icon) VALUES
  ('Головная боль', '🤕'),
  ('Боль в горле', '😤'),
  ('Температура', '🌡️'),
  ('Кашель', '😷'),
  ('Боль в животе', '🫃'),
  ('Боль в спине', '🦴'),
  ('Проблемы со зрением', '👁️'),
  ('Проблемы с кожей', '🧴'),
  ('Боль в суставах', '🦵'),
  ('Усталость', '😴'),
  ('Тошнота', '🤢'),
  ('Сердцебиение', '❤️')
ON CONFLICT DO NOTHING;

-- Seed: doctors
INSERT INTO doctors (first_name, last_name, specialization, bio, experience_years, price, rating, reviews_count, email, phone) VALUES
  ('Алия', 'Сейткали', 'Терапевт', 'Врач общей практики с 12-летним опытом. Специализируется на диагностике и лечении острых и хронических заболеваний.', 12, 5000, 4.9, 124, 'seitkali@clinic.kz', '+7 701 000 0001'),
  ('Дмитрий', 'Волков', 'Невролог', 'Кандидат медицинских наук. Специалист по головным болям, остеохондрозу и нейропатиям. Автор 15 научных работ.', 18, 7000, 4.8, 89, 'volkov@clinic.kz', '+7 701 000 0002'),
  ('Айгерим', 'Нурланова', 'Кардиолог', 'Эксперт в диагностике и лечении сердечно-сосудистых заболеваний. Прошла стажировку в Германии.', 15, 8000, 4.9, 201, 'nurlanova@clinic.kz', '+7 701 000 0003'),
  ('Сергей', 'Петров', 'Хирург', 'Врач высшей категории. Специализируется на абдоминальной хирургии. Более 3000 успешных операций.', 22, 9000, 4.7, 156, 'petrov@clinic.kz', '+7 701 000 0004'),
  ('Жанна', 'Ахметова', 'Дерматолог', 'Специалист по кожным заболеваниям, косметологии и трихологии. Работает с современными методами лечения.', 9, 6000, 4.8, 78, 'akhmetova@clinic.kz', '+7 701 000 0005'),
  ('Руслан', 'Кожамберлинов', 'Офтальмолог', 'Хирург-офтальмолог. Проводит лазерную коррекцию зрения и операции катаракты.', 14, 7500, 4.9, 167, 'kozhamberlinov@clinic.kz', '+7 701 000 0006')
ON CONFLICT DO NOTHING;

-- Seed: doctor_symptoms
INSERT INTO doctor_symptoms (doctor_id, symptom_id) VALUES
  (1, 1),(1, 2),(1, 3),(1, 4),(1, 10),(1, 11),
  (2, 1),(2, 6),(2, 9),(2, 10),
  (3, 12),(3, 10),(3, 3),
  (4, 5),(4, 6),(4, 11),
  (5, 8),(5, 3),
  (6, 7)
ON CONFLICT DO NOTHING;

-- Seed: slots (next 10 days, 12:00–18:00 Moscow time / Europe/Moscow = UTC+3)
-- Each slot is 60 min. Last slot starts 18:00 MSK, ends 19:00 MSK.
-- Stored as UTC: AT TIME ZONE 'Europe/Moscow' → AT TIME ZONE 'UTC' makes it timezone-safe.
DO $$
DECLARE
  d          INT;
  day_offset INT;
  hour_msk   INT;
  slot_start TIMESTAMP;
BEGIN
  FOR d IN 1..6 LOOP
    FOR day_offset IN 1..10 LOOP
      FOREACH hour_msk IN ARRAY ARRAY[12,13,14,15,16,17,18] LOOP
        slot_start := (
          DATE_TRUNC('day', NOW() AT TIME ZONE 'Europe/Moscow')
          + (day_offset || ' days')::INTERVAL
          + (hour_msk   || ' hours')::INTERVAL
        ) AT TIME ZONE 'Europe/Moscow' AT TIME ZONE 'UTC';
        INSERT INTO slots (doctor_id, starts_at, ends_at)
        VALUES (d, slot_start, slot_start + INTERVAL '60 minutes')
        ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
