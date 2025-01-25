const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/email');

const authController = {
    register: async (req, res) => {
        try {
            const { email, password, role } = req.body;

            // Validate required fields
            if (!email || !password || !role) {
                return res.status(400).json({ 
                    message: 'Email, password, and role are required' 
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'User with this email already exists' 
                });
            }

            // Only allow client role for registration
            if (role !== 'client') {
                return res.status(403).json({ 
                    message: 'Only client registration is allowed' 
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Create new user
            const user = new User({
                email: email.toLowerCase(),
                password: hashedPassword,
                role,
                verificationToken,
                verificationTokenExpiry,
                isVerified: false
            });

            await user.save();

            // Send verification email
            await sendVerificationEmail(email, verificationToken);

            res.status(201).json({
                message: 'Registration successful. Please check your email for verification.'
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ 
                message: 'Error creating user',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    login: async (req, res) => {
      try {
          const { email, password } = req.body;

          // Find user
          const user = await User.findOne({ email: email.toLowerCase() });
          if (!user) {
              return res.status(401).json({ message: 'Invalid credentials' });
          }

          // Check password
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
              return res.status(401).json({ message: 'Invalid credentials' });
          }

          // Generate token
          const token = jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET,
              { expiresIn: '24h' }
          );

          // Send response
          res.json({
              token,
              user: {
                  id: user._id,
                  email: user.email,
                  role: user.role,
                  isVerified: user.isVerified
              }
          });

      } catch (error) {
          console.error('Login error:', error);
          res.status(500).json({ message: 'Login failed' });
      }
  },

    verifyEmail: async (req, res) => {
        try {
            const { token } = req.params;

            const user = await User.findOne({
                verificationToken: token,
                verificationTokenExpiry: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ 
                    message: 'Invalid or expired verification token' 
                });
            }

            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpiry = undefined;
            await user.save();

            res.json({ message: 'Email verified successfully' });

        } catch (error) {
            console.error('Verification error:', error);
            res.status(500).json({ message: 'Error during email verification' });
        }
    },

    getCurrentUser: async (req, res) => {
      try {
          // User should be attached by auth middleware
          if (!req.user) {
              return res.status(401).json({ message: 'User not authenticated' });
          }

          // Send user data (excluding sensitive information)
          res.json({
              id: req.user._id,
              email: req.user.email,
              role: req.user.role,
              isVerified: req.user.isVerified
          });

      } catch (error) {
          console.error('Get current user error:', error);
          res.status(500).json({ message: 'Error fetching user data' });
      }
  },

};

module.exports = authController;