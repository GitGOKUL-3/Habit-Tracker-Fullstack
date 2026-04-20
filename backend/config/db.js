const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// ─── TiDB Cloud requires SSL with TLSv1.2 minimum ──────────────────────────
const sslConfig = process.env.DB_SSL === 'true'
    ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true   // Verify TiDB's CA cert (recommended for production)
      }
    : {
        // Local MySQL: allow self-signed / no CA verification
        rejectUnauthorized: false
      };

const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     parseInt(process.env.DB_PORT, 10) || 4000, // TiDB default port is 4000

    // ── Connection pool settings ────────────────────────────────────────────
    waitForConnections: true,
    connectionLimit:    10,    // max simultaneous connections
    queueLimit:         50,    // max queued connection requests (0 = unlimited)
    connectTimeout:     30000, // 30 s connection timeout
    idleTimeout:        60000, // release idle connections after 60 s (mysql2 >= 3)
    maxIdle:            5,     // keep at most 5 idle connections alive

    // ── TiDB / MySQL compatibility ──────────────────────────────────────────
    ssl:            sslConfig,
    charset:        'utf8mb4',
    timezone:       '+00:00',  // store all timestamps in UTC
    decimalNumbers: true,      // return DECIMAL columns as JS numbers

    // ── Reconnect on stale connections ─────────────────────────────────────
    enableKeepAlive:       true,
    keepAliveInitialDelay: 0,
});

// Wrap with promise API so every caller can use async/await
const promisePool = pool.promise();

module.exports = promisePool;
