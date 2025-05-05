const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

class SecurityManager {
  constructor(config) {
    this.config = config;
    this.suspiciousActivity = new Map();
    this.blockedIPs = new Set();
    this.sessionExpiry = config.SESSION_TIMEOUT || 3600000; // 1 hour default
    this.maxFailedAttempts = 5;
    this.blockDuration = 15 * 60 * 1000; // 15 minutes
  }

  createRateLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limite chaque IP à 100 requêtes par windowMs
      message: {
        status: 429,
        error: 'Too many requests, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  createAuthRateLimiter() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour window
      max: 5, // limite à 5 tentatives d'authentification par IP
      message: {
        status: 429,
        error: 'Too many authentication attempts, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  isIPBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  blockIP(ip) {
    this.blockedIPs.add(ip);
    setTimeout(() => {
      this.blockedIPs.delete(ip);
    }, this.blockDuration);
  }

  trackFailedAuthAttempt(ip) {
    if (!this.suspiciousActivity.has(ip)) {
      this.suspiciousActivity.set(ip, { failedAttempts: 0, lastAttempt: Date.now() });
    }

    const activity = this.suspiciousActivity.get(ip);
    activity.failedAttempts++;
    activity.lastAttempt = Date.now();

    if (activity.failedAttempts >= this.maxFailedAttempts) {
      this.blockIP(ip);
      this.suspiciousActivity.delete(ip);
      return true; // IP blocked
    }

    return false;
  }

  clearFailedAttempts(ip) {
    this.suspiciousActivity.delete(ip);
  }

  generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateSecurePin() {
    // Generate a random 4-digit PIN that doesn't contain easily guessable patterns
    let pin;
    do {
      pin = Math.floor(1000 + Math.random() * 9000).toString();
    } while (this.isWeakPin(pin));
    return pin;
  }

  isWeakPin(pin) {
    // Check for weak patterns
    const weakPatterns = [
      '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
      '1234', '2345', '3456', '4567', '5678', '6789', '0123', '9876', '8765', '7654',
      '6543', '5432', '4321', '3210', '0987', '1357', '2468'
    ];
    return weakPatterns.includes(pin);
  }

  securityHeaders(req, res, next) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  }

  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/[^\w\s-_./]/g, '') // Keep only alphanumeric, spaces, and safe chars
      .trim();
  }

  validateButtonConfig(config) {
    if (!config || typeof config !== 'object') return false;
    
    const requiredFields = ['id', 'label', 'type', 'action'];
    for (const field of requiredFields) {
      if (!config[field]) return false;
    }
    
    // Validate field types
    if (typeof config.id !== 'string' || 
        typeof config.label !== 'string' || 
        typeof config.type !== 'string' || 
        typeof config.action !== 'string') {
      return false;
    }
    
    // Validate allowed values
    const allowedTypes = ['system', 'app', 'keyboard', 'media'];
    if (!allowedTypes.includes(config.type)) return false;
    
    return true;
  }

  encryptData(data, key) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(12);
    const salt = crypto.randomBytes(64);
    const skey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');
    
    const cipher = crypto.createCipheriv(algorithm, skey, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();
    
    return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
  }

  decryptData(encryptedData, key) {
    const buffer = Buffer.from(encryptedData, 'hex');
    
    const salt = buffer.slice(0, 64);
    const iv = buffer.slice(64, 76);
    const tag = buffer.slice(76, 92);
    const encrypted = buffer.slice(92);
    
    const skey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', skey, iv);
    decipher.setAuthTag(tag);
    
    try {
      return decipher.update(encrypted, '', 'utf8') + decipher.final('utf8');
    } catch (error) {
      return null;
    }
  }

  securityReport() {
    const report = {
      blockedIPs: Array.from(this.blockedIPs),
      suspiciousActivity: Object.fromEntries(this.suspiciousActivity),
      timestamp: new Date().toISOString()
    };
    return report;
  }
}

module.exports = SecurityManager;