const pool = require('../config/db');

async function migrate() {
    try {
        console.log('Checking for role column...');
        const [roleColumn] = await pool.query("SHOW COLUMNS FROM users LIKE 'role'");
        if (roleColumn.length === 0) {
            console.log('Adding role column to users table...');
            await pool.query("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user'");
            console.log('Role column added.');
        } else {
            console.log('Role column already exists.');
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
