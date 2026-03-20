const pool = require('../config/db');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, email, created_at, level, current_xp, bio, avatar, role FROM users WHERE role != "admin"'
        );
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users.' });
    }
};

exports.getUserActivity = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Verify user exists
        const [user] = await pool.execute('SELECT id, username FROM users WHERE id = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get habits
        const [habits] = await pool.execute('SELECT * FROM habits WHERE user_id = ?', [userId]);

        // Get recent logs (last 30 days for example, or all)
        // For simplicity, let's get all logs for now or filter if needed.
        // We'll join with habits to make it clear which habit the log belongs to.
        const [logs] = await pool.execute(`
            SELECT hl.*, h.name as habit_name 
            FROM habit_logs hl 
            JOIN habits h ON hl.habit_id = h.id 
            WHERE h.user_id = ? 
            ORDER BY hl.completion_date DESC
        `, [userId]);

        res.status(200).json({
            user: user[0],
            habits: habits,
            logs: logs
        });

    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ message: 'Error fetching user activity.' });
    }
};
