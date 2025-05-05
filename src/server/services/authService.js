class AuthService {
  constructor(securityManager) {
    this.securityManager = securityManager;
    this.pin = this.securityManager.generateSecurePin();
    this.activeTokens = new Map();
    this.connections = new Map();
    this.sessionTimeout = securityManager.sessionExpiry;
  }

  getPin() {
    return this.pin;
  }

  async verifyPin(inputPin, clientIP) {
    // Check if IP is blocked
    if (this.securityManager.isIPBlocked(clientIP)) {
      return { success: false, error: 'IP blocked due to too many failed attempts' };
    }

    const isValid = inputPin === this.pin;
    
    if (!isValid) {
      const blocked = this.securityManager.trackFailedAuthAttempt(clientIP);
      if (blocked) {
        return { success: false, error: 'Too many failed attempts. IP blocked.' };
      }
      return { success: false, error: 'Invalid PIN' };
    }

    // Clear failed attempts for this IP on successful login
    this.securityManager.clearFailedAttempts(clientIP);
    return { success: true };
  }

  generateToken() {
    return this.securityManager.generateSecureToken();
  }

  verifyToken(token) {
    if (!this.activeTokens.has(token)) return false;
    
    const tokenData = this.activeTokens.get(token);
    const now = Date.now();
    
    // Check if token has expired
    if (now - tokenData.timestamp > this.sessionTimeout) {
      this.activeTokens.delete(token);
      return false;
    }
    
    // Update timestamp for active session
    tokenData.lastActivity = now;
    return true;
  }

  removeToken(token) {
    this.activeTokens.delete(token);
  }

  getActiveConnectionsCount() {
    return this.activeTokens.size;
  }

  addConnection(token, socketId, clientIP) {
    this.activeTokens.set(token, {
      socketId,
      timestamp: Date.now(),
      lastActivity: Date.now(),
      clientIP,
      userAgent: null // Will be set later if needed
    });
  }

  removeConnection(token) {
    this.activeTokens.delete(token);
  }

  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [token, data] of this.activeTokens.entries()) {
      if (now - data.lastActivity > this.sessionTimeout) {
        this.activeTokens.delete(token);
      }
    }
  }

  getSessionInfo() {
    const sessions = [];
    for (const [token, data] of this.activeTokens.entries()) {
      sessions.push({
        started: new Date(data.timestamp).toISOString(),
        lastActivity: new Date(data.lastActivity).toISOString(),
        clientIP: data.clientIP,
        timeRemaining: Math.max(0, this.sessionTimeout - (Date.now() - data.lastActivity))
      });
    }
    return sessions;
  }

  // Rotate PIN periodically for enhanced security
  scheduleRotation(intervalHours = 24) {
    setInterval(() => {
      this.pin = this.securityManager.generateSecurePin();
      console.log('🔄 PIN rotated for security');
    }, intervalHours * 60 * 60 * 1000);
  }
}

module.exports = AuthService;