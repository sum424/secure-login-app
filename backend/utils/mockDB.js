/**
 * A simple in-memory mock DB for demo purposes.
 * Structure:
 * users = {
 *   "user@example.com": {
 *     email, passwordHash, failedAttempts, lastFailedAt, lockedUntil, role
 *   }
 * }
 */
const bcrypt = require('bcrypt');

const users = {};

// create demo user
async function createUser(email, password) {
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  users[email.toLowerCase()] = {
    email: email.toLowerCase(),
    passwordHash: hash,
    failedAttempts: 0,
    lastFailedAt: null,
    lockedUntil: null,
    role: 'user'
  };
  return users[email.toLowerCase()];
}

function getUserByEmail(email) {
  if (!email) return null;
  return users[email.toLowerCase()] || null;
}

// increment failed attempts, possibly lock account
function incrementFailedLogin(email) {
  const user = getUserByEmail(email);
  if (!user) return { locked: false };

  user.failedAttempts = (user.failedAttempts || 0) + 1;
  user.lastFailedAt = Date.now();

  // lockout policy: lock after 5 failed attempts for 15 minutes
  if (user.failedAttempts >= 5) {
    user.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
    user.failedAttempts = 0; // reset counter after lock
    return { locked: true };
  }
  return { locked: false };
}

function resetFailedLogin(email) {
  const user = getUserByEmail(email);
  if (!user) return;
  user.failedAttempts = 0;
  user.lastFailedAt = null;
  user.lockedUntil = null;
}

module.exports = { createUser, getUserByEmail, incrementFailedLogin, resetFailedLogin };
