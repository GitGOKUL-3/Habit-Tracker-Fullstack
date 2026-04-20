// Uses the shared db pool (includes TiDB SSL config)
const pool = require('../config/db');
require('dotenv').config();

async function makeAdmin(email) {
    if (!email) {
        console.error("❌ Please provide an email address. Example: node utils/makeAdmin.js you@example.com");
        process.exit(1);
    }

    try {
        console.log(`🔌 Connecting to database at ${process.env.DB_HOST}...`);

        // Update user to admin role
        const [result] = await pool.execute(
            "UPDATE users SET role = 'admin' WHERE email = ?",
            [email]
        );

        if (result.affectedRows > 0) {
            console.log(`\n✅ Success: ${email} has been promoted to Admin!`);
        } else {
            console.log(`\n❌ Error: No user found with email "${email}". Register the account first, then run this script.`);
        }

    } catch (err) {
        console.error("❌ Database error:", err.message);
    } finally {
        process.exit();
    }
}

// Get the email from: node utils/makeAdmin.js <email>
const emailToUpdate = process.argv[2];
makeAdmin(emailToUpdate);

