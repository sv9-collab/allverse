import express from 'express';
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Create Database Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'orb_user',
    password: 'orb_pass',
    database: 'orb_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Error establishing a database connection:', err.stack);
        return;
    }
    console.log('Connected to orb_db as id ' + connection.threadId);
});

// Middleware
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.get('/api/stats', (req, res) => {
    connection.query('SELECT cpu_load as cpu, ram_usage as ram FROM system_stats ORDER BY timestamp DESC LIMIT 1', (err, results) => {
        if (err || !results || results.length === 0) {
            // High-Performance Simulation Fallback
            return res.json({
                cpu: (Math.random() * 15 + 30).toFixed(2),
                ram: (Math.random() * 2 + 6).toFixed(1),
                uptime: process.uptime(),
                status: 'simulation'
            });
        }
        res.json({
            cpu: results[0].cpu,
            ram: results[0].ram,
            uptime: process.uptime(),
            status: 'live'
        });
    });
});

// Fallback to SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(port, () => {
    console.log(`Orb OS Backend running at http://localhost:${port}`);

    // Stats Heartbeat: Populate DB with fresh simulated telemetry every 30s
    setInterval(() => {
        const cpu = (Math.random() * 20 + 30).toFixed(2);
        const ram = (Math.random() * 2 + 6).toFixed(1);
        connection.query('INSERT INTO system_stats (cpu_load, ram_usage) VALUES (?, ?)', [cpu, ram], (err) => {
            if (err) console.error('Heartbeat Error:', err.message);
        });
    }, 30000);
});
