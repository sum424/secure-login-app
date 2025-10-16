require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000' //for frontend
}));
app.use(express.json());

// base route
app.get('/', (req, res) => res.json({ ok: true }));

// auth routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
