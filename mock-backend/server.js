const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let visitors = [
  {
    id: 1,
    visitorId: 'VIS001',
    name: 'Thoko Banda',
    inmate: 'Peter Phiri',
    phone: '0991 234 567',
    date: '2026-10-14',
    time: '09:00',
    status: 'Approved',
  },
  {
    id: 2,
    visitorId: 'VIS002',
    name: 'Grace Chirwa',
    inmate: 'John Zulu',
    phone: '0882 345 678',
    date: '2026-10-14',
    time: '10:30',
    status: 'Pending',
  },
  {
    id: 3,
    visitorId: 'VIS003',
    name: 'Blessings Mbewe',
    inmate: 'James Gondwe',
    phone: '0999 456 789',
    date: '2026-10-14',
    time: '11:00',
    status: 'Approved',
  },
];

app.get('/', (req, res) => {
  res.json({ message: 'Mock backend is running!' });
});

app.get('/api/visitors', (req, res) => {
  res.json(visitors);
});

app.post('/api/visitors', (req, res) => {
  const { name, inmate, phone, date, time } = req.body;

  if (!name || !inmate || !phone || !date || !time) {
    return res.status(400).json({
      message: 'Please provide all visitor details.',
    });
  }

  const newVisitor = {
    id: Date.now(),
    visitorId: `VIS${String(visitors.length + 1).padStart(3, '0')}`,
    name,
    inmate,
    phone,
    date,
    time,
    status: 'Pending',
  };

  visitors.push(newVisitor);
  res.status(201).json(newVisitor);
});

app.patch('/api/visitors/:id/status', (req, res) => {
  const visitor = visitors.find(
    (v) => v.id === Number(req.params.id)
  );

  if (!visitor) {
    return res.status(404).json({ message: 'Visitor not found' });
  }

  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({
      message: 'Status must be Approved or Rejected.',
    });
  }

  visitor.status = status;
  res.json(visitor);
});

app.delete('/api/visitors/:id', (req, res) => {
  const oldLength = visitors.length;

  visitors = visitors.filter(
    (v) => v.id !== Number(req.params.id)
  );

  if (visitors.length === oldLength) {
    return res.status(404).json({ message: 'Visitor not found' });
  }

  res.json({ message: 'Visitor deleted successfully.' });
});

app.listen(PORT, () => {
  console.log(`Mock backend running at http://localhost:${PORT}`);
});