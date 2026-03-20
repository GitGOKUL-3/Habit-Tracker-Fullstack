const pool = require('../config/db');

const isAdmin = async (req, res, next) => {
    try {
        const userId = req.userId; // Set by auth.middleware

        const [users] = await pool.execute('SELECT role FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (users[0].role !== 'admin') {
            return res.status(403).json({ message: 'Require Admin Role!' });
        }

        next();
    } catch (error) {
        console.error("Admin Check Error:", error);
        return res.status(500).json({ message: 'Unable to validate User role!' });
    }
};

module.exports = isAdmin;
