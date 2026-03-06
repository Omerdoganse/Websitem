const express = require('express');
const cors = require('cors');
const path = require('path');

// Import Database
const pool = require('./db');

// Import Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mount Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// General fallback for frontend routing, although mostly serving static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
