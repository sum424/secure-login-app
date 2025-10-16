const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { getUserByEmail, createUser, incrementFailedLogin, resetFailedLogin } = require('../utils/mockDB');
const { passwordMeetsPolicy } = require('../utils/passwordPolicy');
const rateLimiter = require('../middleware/rateLimiter');


// Optional route to create a demo user (only for local/testing)
router.post('/register', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isString().isLength({ min: 8 }).withMessage('Password min length 8'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (user) return res.status(409).json({ message: 'User already exists' });

  if (!passwordMeetsPolicy(password)) {
    return res.status(400).json({ message: 'Password does not meet policy' });
  }

  await createUser(email, password);
  return res.status(201).json({ message: 'User created (demo)' });
});

// LOGIN
router.post('/login', rateLimiter, [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isString().withMessage('Password required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = getUserByEmail(email);

  // outcome: user not found
  if (!user) {
    // keep time roughly similar to avoid user enumeration timing
    await new Promise(r => setTimeout(r, 300));
    return res.status(401).json({ outcome: 'invalid_credentials', message: 'Invalid email or password' });
  }

  // account lockout check
  if (user.lockedUntil && Date.now() < user.lockedUntil) {
    return res.status(423).json({ outcome: 'account_locked', retryAt: user.lockedUntil });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const { locked } = incrementFailedLogin(user.email);
    if (locked) {
      return res.status(423).json({ outcome: 'account_locked', message: 'Account temporarily locked due to failed attempts' });
    }
    return res.status(401).json({ outcome: 'invalid_credentials', message: 'Invalid email or password' });
  }

  // successful login: reset failed count
  resetFailedLogin(user.email);

  // create minimal JWT (demo). In prod set short expiry and refresh tokens.
  const token = jwt.sign({ sub: user.email, role: user.role || 'user' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });

  return res.json({ outcome: 'success', token, message: 'Login successful' });
});

module.exports = router;
