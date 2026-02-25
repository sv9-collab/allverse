#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════╗
 * ║   ALLVERSE MCP — Cloudflare Bridge       ║
 * ║   (Translates local stdio -> HTTP POST)  ║
 * ╚══════════════════════════════════════════╝
 */

const EDGE_URL = "https://orb-mcp.aekbuffalo.workers.dev/mcp";

// Read all JSON-RPC commands coming from the AI client's standard input
process.stdin.on('data', async (chunk) => {
    try {
        const dataString = chunk.toString();

        // Send it exactly as-is to the Cloudflare Worker running on the Edge
        const response = await fetch(EDGE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: dataString
        });

        // Get the result back from the Edge database
        const result = await response.text();

        // Write it back to the AI client exactly as-is
        process.stdout.write(result + '\n');

    } catch (error) {
        // If something goes wrong, report the error via MCP protocol
        const errMsg = JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32603, message: `Bridge Error: ${error.message}` }
        });
        process.stdout.write(errMsg + '\n');
    }
});
