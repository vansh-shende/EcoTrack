/**
 * ─────────────────────────────────────────────────────────────
 * Security Middleware
 * ─────────────────────────────────────────────────────────────
 * Three layers of defense applied to every incoming request:
 *
 *   1. Helmet   → Sets security HTTP headers (XSS, clickjacking,
 *                  MIME sniffing, CSP, HSTS, etc.)
 *   2. CORS     → Restricts which origins can call the API
 *   3. Rate Limiter → Prevents brute-force and DDoS abuse
 * ─────────────────────────────────────────────────────────────
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config');

// ── Helmet ──────────────────────────────────────────────────
// Sets ~15 security headers in one call.

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding if needed
});

// ── CORS ────────────────────────────────────────────────────
// Only configured local origins can access the API.

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://client-eight-kohl.vercel.app',
  config.cors.origin,
];

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow any local port on localhost or 127.0.0.1
    if (
      allowedOrigins.includes(origin) || 
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,        // Allow cookies/auth headers
  maxAge: 86400,             // Cache preflight for 24 hours
});

// ── Rate Limiter (Global) ───────────────────────────────────
// Limits each IP to N requests per time window.

const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,     // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,      // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests — please try again later.',
  },
});

// ── Rate Limiter (Auth) ─────────────────────────────────────
// Stricter limit for authentication endpoints to prevent
// brute-force credential attacks.
// Applied per-route on /auth/login and /auth/refresh-token.

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15-minute window
  max: 5,                      // 5 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts — please wait 15 minutes or reset your password.',
  },
});

module.exports = {
  helmetMiddleware,
  corsMiddleware,
  rateLimiter,
  authRateLimiter,
};
