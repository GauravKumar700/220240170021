// src/logger/index.js
const axios = require('axios');
const os = require('os');

const LOG_API_URL = process.env.LOG_API_URL;
const LOG_API_TOKEN = process.env.LOG_API_TOKEN;

const ALLOWED_STACKS = ['backend', 'frontend'];
const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const ALLOWED_PACKAGES = ['handler', 'db', 'auth', 'service', 'api'];

async function postToServer(payload) {
    try {
        await axios.post(LOG_API_URL, payload, {
            timeout: 3000,
            headers: {
                'Content-Type': 'application/json',
                ...(LOG_API_TOKEN ? { Authorization: `Bearer ${LOG_API_TOKEN}` } : {})
            }
        });
    } catch (err) {
        console.error('Failed to send log to server:', err.message);
    }
}

function validate(stack, level, package) {
    if (typeof stack !== 'string' || typeof level !== 'string') {
        throw new Error('stack and level must be strings');
    }
    const s = stack.toLowerCase();
    const l = level.toLowerCase();
    if (!ALLOWED_STACKS.includes(s)) throw new Error(`Invalid stack. Choose From: ${ALLOWED_STACKS.join(', ')}`);
    if (!ALLOWED_LEVELS.includes(l)) throw new Error(`Invalid level. Choose From: ${ALLOWED_LEVELS.join(', ')}`);
    if (!ALLOWED_PACKAGES.includes(l)) throw new Error(`Invalid Packages. Chhose From: ${ALLOWED_PACKAGES.join(', ')}`);
    return { s, l };
}

function Log(stack, level, pkg, message, meta = {}) {
    try {
        const { s, l } = validate(stack, level);
        const payload = {
            stack: s,
            level: l,
            package: pkg || 'unknown',
            message: String(message || ''),
            timestamp: new Date().toISOString(),
            host: os.hostname(),
            meta
        };
        // Fire-and-forget; postToServer handles errors internally
        postToServer(payload);
    } catch (err) {
        // Invalid log call — we print locally but don't throw
        console.error('Invalid log call:', err.message);
    }
}

module.exports = Log;