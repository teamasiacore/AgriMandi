// ==============================================================================
// AgriMandi (कृषीसेतू) — Reliability Foundation & Error Handling
// Task: AG-005
// Standard: Canonical Implementation Instruction (Section 9 & 11)
// ==============================================================================

/**
 * Request ID Middleware
 * Assigns or propagates a unique correlation ID for every inbound API request.
 */
export const requestIdMiddleware = (req, res, next) => {
  const incomingId = req.headers['x-request-id'] || req.headers['request-id'];
  const requestId = (incomingId && typeof incomingId === 'string' && incomingId.length <= 64)
    ? incomingId
    : `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  req.id = requestId;
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

/**
 * Structured Safe Server Logger
 * Logs requests with timing and correlation ID, preventing sensitive token leakage.
 */
export const structuredLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = req.id || 'req_unknown';
  const method = req.method;
  const path = req.originalUrl || req.url;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const symbol = statusCode < 300 ? '✅' : statusCode < 400 ? '🔀' : statusCode < 500 ? '⚠️' : '❌';
    console.log(`${symbol} [${new Date().toISOString()}] [${requestId}] ${method} ${path} ${statusCode} (${duration}ms)`);
  });

  next();
};

/**
 * Standard Operational API Error
 */
export class ApiError extends Error {
  constructor(code, message, statusCode = 400, details = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Canonical Global Error Handler
 * Returns consistent, safe JSON errors (Section 9) without leaking server internals.
 */
export const errorHandler = (err, req, res, next) => {
  const requestId = req.id || req.requestId || `req_${Date.now()}`;

  // Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || undefined,
        requestId
      }
    });
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    const primaryMsg = err.errors && err.errors.length > 0 ? err.errors[0].message : 'Request payload validation failed';
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: primaryMsg,
        details: err.errors ? err.errors.map(e => ({ path: e.path.join('.'), message: e.message })) : undefined,
        requestId
      }
    });
  }

  // Malformed JSON Payload
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload in request body',
        requestId
      }
    });
  }

  // Unhandled / Internal Server Error (Never leak stack traces in production)
  console.error(`💥 [${requestId}] Uncaught Server Exception:`, err.message);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected system error occurred. Please try again or reference the requestId.',
      requestId
    }
  });
};
