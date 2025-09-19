// src/logger/index.js
const axios = require('axios');
const os = require('os');
require('dotenv').config();

const LOG_API_URL = process.env.LOG_API_URL || "http://20.244.56.144/evaluation-service/logs";
const TOKEN_API_URL = process.env.TOKEN_API_URL || "http://20.244.56.144/evaluation-service/auth";
const LOG_API_TOKEN = process.env.LOG_API_TOKEN

const ALLOWED_STACKS = ['backend', 'frontend'];
const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const FRONTEND_ALLOWED_PACKAGES = ["auth", "config", "middleware", "utils", "api", "component", "hook", "page", "state", "style"]
const BACKEND_ALLOWED_PACKAGES = ["auth", "config", "middleware", "utils", "cache", "controller", "cron_job", "db", "domain", "handler", "repositry", "route", "service"];


// const getAuthToken = async (body) => {
//     try {
//         const response = await axios.post(`${TOKEN_API_URL}`, body, {
//             timeout: 3000,
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//         if (response.data && response.data.access_token) {
//             return response.data.access_token; // Assuming the response contains the token
//         } else {
//             throw new Error('No token found in response');
//         }
//     } catch (err) {
//         const payload = {
//             stack: "backend",
//             level: "error",
//             package: 'service',
//             message: String(err.message),
//         };
//         // Fire-and-forget; postToServer handles errors internally
//         postToServer(payload);
//     }
// };

// const initialize = async () => {
//     try {
//         const body =
//         {
//             email: process.env.EMAIL,
//             name: process.env.NAME,
//             rollNo: process.env.ROLL_NO,
//             accessCode: process.env.ACCESS_CODE,
//             clientID: process.env.CLIENT_ID,
//             clientSecret: process.env.CLIENT_SECRET
//         }
//         const LOG_API_TOKEN = await getAuthToken(body);
//     } catch (err) {
//         const payload = {
//             stack: "backend",
//             level: "error",
//             package: 'service',
//             message: String(err.message),
//         };
//         // Fire-and-forget; postToServer handles errors internally
//         postToServer(payload);
//     }
// };

// initialize();

const postToServer = async (payload) => {
    try {
        await axios.post(LOG_API_URL, payload, {
            timeout: 3000,
            headers: {
                'Content-Type': 'application/json',
                ...(LOG_API_TOKEN ? { Authorization: `Bearer ${LOG_API_TOKEN}` } : {})
            }
        });
    } catch (err) {
        // const payload = {
        //     stack: "backend",
        //     level: "error",
        //     package: 'service',
        //     message: String(err.message),
        // };
        // // Fire-and-forget; postToServer handles errors internally
        // postToServer(payload);
        console.log(err.message)
    }
};

const validate = (stack, level, package) => {
    if (typeof stack !== 'string' || typeof level !== 'string') {
        throw new Error('stack and level must be strings');
    }
    const s = stack.toLowerCase();
    const l = level.toLowerCase();
    const p = package.toLowerCase();
    if (!ALLOWED_STACKS.includes(s)) throw new Error(`Invalid stack. Choose From: ${ALLOWED_STACKS.join(', ')}`);
    if (!ALLOWED_LEVELS.includes(l)) throw new Error(`Invalid level. Choose From: ${ALLOWED_LEVELS.join(', ')}`);
    if (s == 'backend') {
        if (!BACKEND_ALLOWED_PACKAGES.includes(l)) throw new Error(`Invalid level. Choose From: ${ALLOWED_LEVELS.join(', ')}`);

    } else if (s == 'frontend') {
        if (!FRONTEND_ALLOWED_PACKAGES.includes(l)) throw new Error(`Invalid level. Choose From: ${ALLOWED_LEVELS.join(', ')}`);
    }
    return { s, l };
};

const Log = (stack, level, package, message, meta) => {
    try {
        const { s, l } = validate(stack, level, package);
        const payload = {
            stack: s,
            level: l,
            package: package || 'unknown',
            message: String(message || ''),
        };
        // Fire-and-forget; postToServer handles errors internally
        postToServer(payload);
    } catch (err) {
        const payload = {
            stack: "backend",
            level: "error",
            package: 'service',
            message: String(err.message),
        };
        // Fire-and-forget; postToServer handles errors internally
        postToServer(payload);
    }
};

module.exports = Log;