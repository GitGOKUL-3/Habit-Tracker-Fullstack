const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const db = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve test HTML for Android Emulator testing
app.use(express.static(__dirname));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Habit Tracker API' });
});

// Import Routes
const authRoutes = require('./routes/auth.routes');
const habitRoutes = require('./routes/habit.routes');
const adminRoutes = require('./routes/admin.routes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/admin', adminRoutes);

// Database Connection Check
db.getConnection()
    .then(connection => {
        console.log('Successfully connected to the database.');
        connection.release();

        // Run Migrations
        const runMigrations = require('./utils/migrator');
        runMigrations();
    })
    .catch(err => {
        console.error('Could not connect to the database:', err);
    });

const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
    console.log(`✓ Server is running on port ${PORT}`);
    console.log(`  - Local:            http://localhost:${PORT}`);
    console.log(`  - Network:          http://<your-ip>:${PORT}`);
    console.log(`  - Android Emulator: http://10.0.2.2:${PORT}`);
});
