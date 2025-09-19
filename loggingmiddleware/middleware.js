const Log = require('./index');

/**
 * Express middleware to log requests
 */
function requestLogger(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        Log(
            'backend',
            'info',
            'http',
            `${req.method} ${req.originalUrl} ${res.statusCode}`,
            {
                ip: req.ip,
                userAgent: req.get('user-agent'),
                duration
            }
        );
    });

    next();
}

module.exports = { requestLogger };
