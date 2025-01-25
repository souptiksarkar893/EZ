const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ops', 'client'],
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpiry: Date
}, {
    timestamps: true
});

// Remove any existing indexes
const User = mongoose.model('User', userSchema);
User.collection.dropIndexes().then(() => {
    console.log('Indexes dropped successfully');
}).catch(err => {
    console.error('Error dropping indexes:', err);
});

module.exports = User;