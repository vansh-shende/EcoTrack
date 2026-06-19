/**
 * ─────────────────────────────────────────────────────────────
 * EcoTrack — Express Application Setup
 * ─────────────────────────────────────────────────────────────
 * Assembles the Express app with:
 *   1. Security middleware (Helmet, CORS, rate-limiter)
 *   2. Request parsing (JSON, URL-encoded)
 *   3. Logging (Morgan → Winston)
 *   4. API routes (versioned under /api/v1)
 *   5. Error handling (404 + global error handler)
 *
 * Exported separately from server.js so it can be imported
 * by test suites (supertest) without starting an HTTP server.
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const config = require('./config');

// ── Middleware Imports ───────────────────────────────────────
const { helmetMiddleware, corsMiddleware, rateLimiter } = require('./middleware/security');
const requestLogger = require('./middleware/requestLogger');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

// ── Route Imports ───────────────────────────────────────────
const apiRouter = require('./routes');

// ── Create Express App ──────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────────────────────
// 1. SECURITY MIDDLEWARE
//    Applied first to protect every downstream handler.
// ─────────────────────────────────────────────────────────────

app.use(helmetMiddleware);   // Sets security-related HTTP headers
app.use(corsMiddleware);     // Cross-Origin Resource Sharing policy
app.use(rateLimiter);        // Prevent brute-force / DDoS abuse

// ─────────────────────────────────────────────────────────────
// 2. REQUEST PARSING
//    Parse incoming request bodies before route handlers.
// ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));             // Parse JSON payloads
app.use(express.urlencoded({ extended: true }));       // Parse form data

// ─────────────────────────────────────────────────────────────
// 3. LOGGING
//    Log every HTTP request (method, URL, status, duration).
// ─────────────────────────────────────────────────────────────

app.use(requestLogger);

// ─────────────────────────────────────────────────────────────
// 4. HEALTH CHECK (outside versioned prefix — for load balancers)
// ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ecotrack-api',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: config.env,
  });
});

// ─────────────────────────────────────────────────────────────
// 5. API ROUTES (versioned)
//    All feature routes are mounted under /api/v1.
//    Future versions (v2) can be added alongside v1.
// ─────────────────────────────────────────────────────────────

app.use(config.apiPrefix, apiRouter);

// ─────────────────────────────────────────────────────────────
// 6. ERROR HANDLING
//    Must be registered LAST — catches anything that falls through.
// ─────────────────────────────────────────────────────────────

app.use(notFoundHandler);       // 404 for unmatched routes
app.use(globalErrorHandler);    // Catch-all error handler

module.exports = app;
