const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuración de rate limiting
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Rate limits específicos por endpoint
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  5, // 5 intentos
  'Too many authentication attempts, please try again later'
);

const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  100, // 100 requests
  'Too many API requests, please try again later'
);

const strictLimiter = createRateLimit(
  5 * 60 * 1000, // 5 minutos
  10, // 10 requests
  'Rate limit exceeded for sensitive operations'
);

// Configuración de Helmet para headers de seguridad
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Middleware para validar input y prevenir XSS
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remover scripts y HTML peligroso
        obj[key] = obj[key]
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

// Middleware para logging de seguridad
const securityLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /(<script|javascript:|on\w+\s*=)/i,
    /(union|select|insert|update|delete|drop|create|alter)\s+/i,
    /(\.\.\/|\.\.\\\\ )/,
    /(eval\(|Function\(|setTimeout\(|setInterval\()/i
  ];

  const checkForSuspiciousActivity = (data) => {
    const dataStr = JSON.stringify(data).toLowerCase();
    return suspiciousPatterns.some(pattern => pattern.test(dataStr));
  };

  const isSuspicious = 
    checkForSuspiciousActivity(req.body) ||
    checkForSuspiciousActivity(req.query) ||
    checkForSuspiciousActivity(req.params);

  if (isSuspicious) {
    console.warn('🚨 SECURITY ALERT:', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
      params: req.params
    });
  }

  next();
};

// Middleware para verificar autenticación en rutas protegidas
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please login to access this resource'
    });
  }
  next();
};

// Middleware para verificar roles/permisos
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.userRole) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please login to access this resource'
      });
    }

    const userRoles = Array.isArray(req.session.userRole) 
      ? req.session.userRole 
      : [req.session.userRole];
    
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

module.exports = {
  helmetConfig,
  authLimiter,
  apiLimiter,
  strictLimiter,
  sanitizeInput,
  securityLogger,
  requireAuth,
  requireRole
};