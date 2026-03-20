const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    try {
        const email = 'admin@habittracker.com';
        const password = 'admin123';
        const username = 'AdminUser';

        // Check if admin exists
        const [existingAdmin] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (existingAdmin.length > 0) {
            console.log('Admin user already exists.');

            // Optional: Ensure capability is set to admin if it exists but acts as user
            if (existingAdmin[0].role !== 'admin') {
                console.log('Updating existing user to admin role...');
                await pool.execute('UPDATE users SET role = "admin" WHERE email = ?', [email]);
            }
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        await pool.execute(
            'INSERT INTO users (username, email, password, role, level, current_xp) VALUES (?, ?, ?, "admin", 99, 99999)',
            [username, email, hashedPassword]
        );

        console.log('Admin user created successfully.');
        console.log('Email:', email);
        console.log('Password:', password);

    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        process.exit();
    }
}

seedAdmin();
