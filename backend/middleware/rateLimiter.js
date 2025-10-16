const rateLimit = require('express-rate-limit');

// apply to login route: limit repeated requests to /login per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10, // max 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try later.' }
});

module.exports = limiter;
