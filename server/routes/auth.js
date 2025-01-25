const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const auth = require('../middleware/auth');

// Validation middleware
const validateRegistration = [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['client', 'ops']).withMessage('Invalid role')
];

// Define routes
router.post('/register', validateRegistration, authController.register);  // Note: it's POST not GET
router.post('/login', authController.login);
router.get('/verify/:token', authController.verifyEmail);
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;