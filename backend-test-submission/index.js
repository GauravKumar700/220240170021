require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Url = require('./models/Url');
const { randomShortcode } = require('./utils/shortcode');
// import logger
const { requestLogger } = require('../loggingmiddleware/middleware');
const Log = require('../loggingmiddleware');
const cors = require('cors')

const app = express();
app.use(express.json());
app.use(requestLogger);
app.use(cors())

const {
    MONGO_URI,
    BASE_URL,
    DEFAULT_VALIDITY_MINUTES,
    PORT = 3000
} = process.env;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => { console.error(err); process.exit(1); });

function validateURL(u) {
    try {
        const url = new URL(u);
        return ['http:', 'https:'].includes(url.protocol);
    } catch { return false; }
}

app.post('/shorten', async (req, res) => {
    const { url: originalUrl, shortcode: custom, validityInMinutes } = req.body;

    if (!validateURL(originalUrl)) {
        return res.status(400).json({ message: 'Invalid URL' });
    }

    let validity = parseInt(validityInMinutes, 10);
    if (isNaN(validity) || validity <= 0) {
        validity = parseInt(DEFAULT_VALIDITY_MINUTES, 10) || 30;
    }
    const expiresAt = new Date(Date.now() + validity * 60 * 1000);

    let finalShortcode = null;
    if (custom) {
        const exists = await Url.findOne({ shortcode: custom });
        if (!exists) {
            finalShortcode = custom;
        }
    }
    if (!finalShortcode) {
        let candidate;
        do {
            candidate = randomShortcode();
        } while (await Url.findOne({ shortcode: candidate }));
        finalShortcode = candidate;
    }

    const doc = new Url({ originalUrl, shortcode: finalShortcode, expiresAt });
    await doc.save();

    const shortUrl = `${BASE_URL}/${finalShortcode}`;
    Log('backend', 'info', 'shortener', 'Short URL created', { shortUrl });

    res.status(201).json({ shortUrl, expiresAt });
});

app.listen(PORT, () => console.log(`Backend running on ${PORT}`));