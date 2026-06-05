const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Test database route
app.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS solution', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Database connected!', solution: results[0].solution });
    });
});

// Test route
app.get('/', (req, res) => {
    res.send('Task Manager API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Register API: http://localhost:${PORT}/api/auth/register`);
});