const crypto = require('crypto');

class AuthService {
  constructor() {
    this.pin = this.generatePin();
    this.activeTokens = new Map();
    this.connections = new Map();
  }

  generatePin() {
    // Génère un PIN à 4 chiffres
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  getPin() {
    return this.pin;
  }

  async verifyPin(inputPin) {
    return inputPin === this.pin;
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  verifyToken(token) {
    return this.activeTokens.has(token);
  }

  removeToken(token) {
    this.activeTokens.delete(token);
  }

  getActiveConnectionsCount() {
    return this.activeTokens.size;
  }

  addConnection(token, socketId) {
    this.activeTokens.set(token, {
      socketId,
      timestamp: Date.now()
    });
  }

  removeConnection(token) {
    this.activeTokens.delete(token);
  }

  cleanupExpiredTokens(timeout = 3600000) {
    const now = Date.now();
    for (const [token, data] of this.activeTokens.entries()) {
      if (now - data.timestamp > timeout) {
        this.activeTokens.delete(token);
      }
    }
  }
}

module.exports = AuthService;