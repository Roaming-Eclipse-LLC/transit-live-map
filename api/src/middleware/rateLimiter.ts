import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 25, // max 25 requests per window
  standardHeaders: true, // return rate limit info in headers
  legacyHeaders: false, // disable the X-RateLimit headers
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
});
