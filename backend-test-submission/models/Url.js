const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortcode: { type: String, required: true, unique: true, index: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    clicks: { type: Number, default: 0 }
});

urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Url', urlSchema);
