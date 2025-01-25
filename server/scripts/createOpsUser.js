require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createInitialOpsUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Check if ops user exists
        const existingOps = await User.findOne({ role: 'ops' });
        if (existingOps) {
            console.log('Ops user already exists');
            process.exit(0);
        }

        // Create ops user
        const hashedPassword = await bcrypt.hash('ops123', 12);
        const opsUser = new User({
            email: 'ops@system.com',
            password: hashedPassword,
            role: 'ops',
            isVerified: true
        });

        await opsUser.save();
        console.log('Ops user created successfully');
        console.log('Email: ops@system.com');
        console.log('Password: ops123');
        
    } catch (error) {
        console.error('Error creating ops user:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createInitialOpsUser();