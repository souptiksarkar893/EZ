const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    downloadToken: {
        type: String,
        required: true,
        unique: true
    },
    downloadTokenExpiry: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('File', fileSchema);