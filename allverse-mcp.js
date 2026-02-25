#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════╗
 * ║   ALLVERSE MCP — Orb OS Hypercore v3    ║
 * ║   Model Context Protocol Server         ║
 * ║   Unifying: DB · Telemetry · Map ·      ║
 * ║   Auth · 3D · Network · Terminal        ║
 * ╚══════════════════════════════════════════╝
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import mysql from 'mysql2/promise';
import { execSync } from 'child_process';
import os from 'os';

// ─── Database Pool ───
let pool;
try {
    pool = mysql.createPool({
        host: 'localhost',
        user: 'orb_user',
        password: 'orb_pass',
        database: 'orb_db',
        waitForConnections: true,
        connectionLimit: 5,
    });
} catch (e) {
    // DB optional — tools will fallback
}

// ─── MCP Server ───
const server = new McpServer({
    name: 'allverse',
    version: '1.0.0',
});

// ══════════════════════════════════════════
//  RESOURCES — Read-only data streams
// ══════════════════════════════════════════

server.resource(
    'system-info',
    'allverse://system/info',
    async (uri) => ({
        contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
                hostname: os.hostname(),
                platform: os.platform(),
                arch: os.arch(),
                cpus: os.cpus().length,
                totalMemory: `${(os.totalmem() / 1e9).toFixed(2)} GB`,
                freeMemory: `${(os.freemem() / 1e9).toFixed(2)} GB`,
                uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
                loadAverage: os.loadavg(),
                networkInterfaces: Object.keys(os.networkInterfaces()),
            }, null, 2),
        }],
    })
);

server.resource(
    'orb-config',
    'allverse://orb/config',
    async (uri) => ({
        contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
                identity: 'ubuntu2.orb.local',
                user: 'stevejohn',
                hypercore_version: '3.0',
                mode: 'GOD_MODE',
                frontend_port: 3000,
                database: { host: 'localhost', name: 'orb_db', user: 'orb_user' },
                stack: ['React', 'Three.js', 'MUI', 'Leaflet', 'Framer Motion', 'Lucide', 'Express', 'MariaDB'],
                features: ['biometric_auth', '3d_hypercore', 'live_map', 'quantum_logs', 'security_matrix'],
            }, null, 2),
        }],
    })
);

// ══════════════════════════════════════════
//  TOOLS — Actions the AI can invoke
// ══════════════════════════════════════════

// 1. Get Live System Stats
server.tool(
    'get_stats',
    'Get real-time system telemetry (CPU load, RAM, disk) from the Orb OS machine',
    {},
    async () => {
        const cpuLoad = os.loadavg()[0];
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        let dbStats = null;
        if (pool) {
            try {
                const [rows] = await pool.query('SELECT cpu_load, ram_usage, timestamp FROM system_stats ORDER BY timestamp DESC LIMIT 5');
                dbStats = rows;
            } catch (e) { /* skip */ }
        }

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    live: {
                        cpu_load_1m: cpuLoad.toFixed(2),
                        cpu_load_5m: os.loadavg()[1].toFixed(2),
                        cpu_load_15m: os.loadavg()[2].toFixed(2),
                        memory_used: `${(usedMem / 1e9).toFixed(2)} GB`,
                        memory_total: `${(totalMem / 1e9).toFixed(2)} GB`,
                        memory_percent: `${((usedMem / totalMem) * 100).toFixed(1)}%`,
                    },
                    database_history: dbStats,
                }, null, 2),
            }],
        };
    }
);

// 2. Query the Database
server.tool(
    'query_db',
    'Execute a read-only SQL query against the Orb OS MariaDB (orb_db)',
    { query: z.string().describe('SQL query to execute (SELECT only)') },
    async ({ query }) => {
        if (!pool) {
            return { content: [{ type: 'text', text: 'Error: Database not connected.' }] };
        }
        const normalized = query.trim().toUpperCase();
        if (!normalized.startsWith('SELECT') && !normalized.startsWith('SHOW') && !normalized.startsWith('DESCRIBE')) {
            return { content: [{ type: 'text', text: 'Error: Only SELECT, SHOW, and DESCRIBE queries are allowed.' }] };
        }
        try {
            const [rows] = await pool.query(query);
            return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
        } catch (e) {
            return { content: [{ type: 'text', text: `Query Error: ${e.message}` }] };
        }
    }
);

// 3. Insert Stats (Write telemetry)
server.tool(
    'insert_stats',
    'Insert a new telemetry data point into the Orb OS database',
    {
        cpu: z.number().describe('CPU load percentage (0-100)'),
        ram: z.number().describe('RAM usage in GB'),
    },
    async ({ cpu, ram }) => {
        if (!pool) {
            return { content: [{ type: 'text', text: 'Error: Database not connected.' }] };
        }
        try {
            await pool.query('INSERT INTO system_stats (cpu_load, ram_usage) VALUES (?, ?)', [cpu, ram]);
            return { content: [{ type: 'text', text: `✓ Telemetry recorded: CPU=${cpu}%, RAM=${ram}GB` }] };
        } catch (e) {
            return { content: [{ type: 'text', text: `Insert Error: ${e.message}` }] };
        }
    }
);

// 4. Run Shell Command
server.tool(
    'run_shell',
    'Execute a shell command on the Orb OS machine and return stdout',
    { command: z.string().describe('The shell command to execute') },
    async ({ command }) => {
        try {
            const output = execSync(command, { timeout: 10000, encoding: 'utf-8', maxBuffer: 1024 * 1024 });
            return { content: [{ type: 'text', text: output || '(no output)' }] };
        } catch (e) {
            return { content: [{ type: 'text', text: `Shell Error: ${e.message}\n${e.stderr || ''}` }] };
        }
    }
);

// 5. Get Network Info
server.tool(
    'get_network',
    'Get detailed network interface information from the Orb OS machine',
    {},
    async () => {
        const ifaces = os.networkInterfaces();
        const result = {};
        for (const [name, addrs] of Object.entries(ifaces)) {
            result[name] = addrs.map(a => ({
                address: a.address,
                family: a.family,
                internal: a.internal,
                mac: a.mac,
            }));
        }
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
);

// 6. Get Running Services
server.tool(
    'get_services',
    'List running services and processes on the Orb OS machine',
    {},
    async () => {
        try {
            const output = execSync("systemctl list-units --type=service --state=running --no-pager --no-legend | head -20", {
                encoding: 'utf-8', timeout: 5000,
            });
            return { content: [{ type: 'text', text: output }] };
        } catch (e) {
            return { content: [{ type: 'text', text: `Error: ${e.message}` }] };
        }
    }
);

// 7. Get Map / Location Data
server.tool(
    'get_topology',
    'Get the network topology and map configuration for the Orb OS dashboard',
    {},
    async () => {
        let connections = [];
        try {
            const output = execSync("ss -tunp | head -15", { encoding: 'utf-8', timeout: 5000 });
            connections = output.split('\n').filter(l => l.trim());
        } catch (e) { /* skip */ }

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    map_center: [51.505, -0.09],
                    map_zoom: 13,
                    orb_nodes: [
                        { id: 'ubuntu2', lat: 51.505, lng: -0.09, status: 'LINKED' },
                    ],
                    active_connections: connections,
                }, null, 2),
            }],
        };
    }
);

// 8. Manage Frontend
server.tool(
    'manage_frontend',
    'Build, start, or restart the Orb OS frontend/backend',
    { action: z.enum(['build', 'restart', 'status']).describe('Action to perform') },
    async ({ action }) => {
        try {
            let output;
            switch (action) {
                case 'build':
                    output = execSync('npm run build', { cwd: '/home/stevejohn/.gemini/antigravity/scratch/ubuntu2-orb-local', encoding: 'utf-8', timeout: 300000 });
                    break;
                case 'restart':
                    execSync('fuser -k 3000/tcp 2>/dev/null || true', { encoding: 'utf-8' });
                    output = 'Port 3000 cleared. Run `node server.js` to restart.';
                    break;
                case 'status':
                    try {
                        execSync('fuser 3000/tcp', { encoding: 'utf-8' });
                        output = 'Server is RUNNING on port 3000.';
                    } catch {
                        output = 'Server is NOT running.';
                    }
                    break;
            }
            return { content: [{ type: 'text', text: output }] };
        } catch (e) {
            return { content: [{ type: 'text', text: `Error: ${e.message}` }] };
        }
    }
);

// 9. Hypercore 3D Config
server.tool(
    'get_hypercore_config',
    'Get the Three.js Hypercore 3D engine configuration',
    {},
    async () => ({
        content: [{
            type: 'text',
            text: JSON.stringify({
                engine: 'React Three Fiber',
                objects: {
                    outer_orb: { geometry: 'IcosahedronGeometry(2, 2)', material: 'MeshPhong', wireframe: true, color: '#00f2ff', emissive: '#00f2ff' },
                    inner_core: { geometry: 'SphereGeometry(1.2, 32, 32)', material: 'MeshPhong', color: '#7000ff', emissive: '#7000ff' },
                    starfield: { count: 3000, radius: 100, depth: 50 },
                },
                effects: ['Float', 'ErrorBoundary', 'Suspense', 'CPU-reactive scaling'],
                camera: { type: 'PerspectiveCamera', position: [0, 0, 10] },
            }, null, 2),
        }],
    })
);

// ─── Start Transport ───
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('🌌 ALLVERSE MCP Server running — Orb OS Hypercore v3.0');
}

main().catch(console.error);
