const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 5000;

// Connect to a local database file.
const db = new Database(path.join(__dirname, 'visitors.db'));

app.use(cors());
app.use(express.json());

// Create the visitors table if it doesn't exist.
db.exec(`
  CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitorId TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    inmate TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending'
  )
`);

// Add the original sample visitors only when the database is empty.
const count = db.prepare('SELECT COUNT(*) AS total FROM visitors').get();

if (count.total === 0) {
  const insertVisitor = db.prepare(`
    INSERT INTO visitors
      (visitorId, name, inmate, phone, date, time, status)
    VALUES
      (@visitorId, @name, @inmate, @phone, @date, @time, @status)
  `);

  const seedVisitors = db.transaction((visitors) => {
    for (const visitor of visitors) {
      insertVisitor.run(visitor);
    }
  });

  seedVisitors([
    {
      visitorId: 'VIS001',
      name: 'Thoko Banda',
      inmate: 'Peter Phiri',
      phone: '0991 234 567',
      date: '2026-10-14',
      time: '09:00',
      status: 'Approved',
    },
    {
      visitorId: 'VIS002',
      name: 'Grace Chirwa',
      inmate: 'John Zulu',
      phone: '0882 345 678',
      date: '2026-10-14',
      time: '10:30',
      status: 'Pending',
    },
    {
      visitorId: 'VIS003',
      name: 'Blessings Mbewe',
      inmate: 'James Gondwe',
      phone: '0999 456 789',
      date: '2026-10-14',
      time: '11:00',
      status: 'Approved',
    },
    {
      visitorId: 'VIS004',
      name: 'mark doss',
      inmate: 'Jonson made',
      phone: '0998877661',
      date: '2026-10-14',
      time: '09:00',
      status: 'Approved',
    },
  ]);
}

app.get('/', (req, res) => {
  res.json({ message: 'SQLite mock backend is running!' });
});

app.get('/api/visitors', (req, res) => {
  const visitors = db.prepare(`
    SELECT * FROM visitors ORDER BY id ASC
  `).all();

  res.json(visitors);
});

app.post('/api/visitors', (req, res) => {
  const { name, inmate, phone, date, time } = req.body;

  if (!name || !inmate || !phone || !date || !time) {
    return res.status(400).json({
      message: 'Please provide all visitor details.',
    });
  }

  const nextNumber = db.prepare(`
    SELECT COUNT(*) AS total FROM visitors
  `).get().total + 1;

  const visitorId = `VIS${String(nextNumber).padStart(3, '0')}`;

  try {
    const result = db.prepare(`
      INSERT INTO visitors
        (visitorId, name, inmate, phone, date, time, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending')
    `).run(visitorId, name, inmate, phone, date, time);

    const newVisitor = db.prepare(`
      SELECT * FROM visitors WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newVisitor);
  } catch (error) {
    console.error('Error registering visitor:', error.message);
    res.status(500).json({
      message: 'Could not register visitor.',
    });
  }
});

app.patch('/api/visitors/:id/status', (req, res) => {
  const { status } = req.body;
  const id = Number(req.params.id);

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({
      message: 'Status must be Approved or Rejected.',
    });
  }

  const result = db.prepare(`
    UPDATE visitors SET status = ? WHERE id = ?
  `).run(status, id);

  if (result.changes === 0) {
    return res.status(404).json({
      message: 'Visitor not found.',
    });
  }

  const visitor = db.prepare(`
    SELECT * FROM visitors WHERE id = ?
  `).get(id);

  res.json(visitor);
});

app.delete('/api/visitors/:id', (req, res) => {
  const result = db.prepare(`
    DELETE FROM visitors WHERE id = ?
  `).run(Number(req.params.id));

  if (result.changes === 0) {
    return res.status(404).json({
      message: 'Visitor not found.',
    });
  }

  res.json({ message: 'Visitor deleted successfully.' });
});

app.listen(PORT, () => {
  console.log(`SQLite mock backend running at http://localhost:${PORT}`);
});