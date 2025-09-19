//importing all required dependancies/libraries
require('dotenv').config();
const express = require('express');
const Log = require('./middleware/logger');
const app = express();

app.use(express.json());

// Request logger middleware (placed before routes)
app.use((req, res, next) => {
    Log('backend', 'info', 'handler', `Incoming ${req.method} ${req.originalUrl} from ${req.ip}`);
    // log when response is finished (status code)
    res.on('finish', () => {
        Log('backend', 'info', 'handler', `Completed ${req.method} ${req.originalUrl} ${res.statusCode}`);
    });
    next();
});

// Example route — successful
app.get('/ok', (req, res) => {
    Log('backend', 'debug', 'handler', 'ok route hit');
    res.json({ ok: true });
});

// Example route — simulate DB error and demonstrate logging in service layer
app.get('/simulate-db-error', async (req, res, next) => {
    try {
        // Example: a DB operation fails
        throw new Error('Simulated DB connection failure');
    } catch (err) {
        // Domain-level logging for DB failures
        Log('backend', 'fatal', 'db', err.message, { route: req.originalUrl });
        // forward to error handler
        next(err);
    }
});

// Error-handling middleware (must be after routes)
app.use((err, req, res, next) => {
    const level = (err.status && err.status < 500) ? 'error' : 'fatal';
    Log('backend', level, 'handler', `${err.message} - ${req.method} ${req.originalUrl}`, { stack: err.stack });
    res.status(err.status || 500).json({ error: err.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on ${port}`);
    Log('backend', 'info', 'handler', `Server started on port ${port}`);
});
