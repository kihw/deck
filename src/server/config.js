require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  PIN_LENGTH: process.env.PIN_LENGTH || 4,
  MAX_CONNECTIONS: process.env.MAX_CONNECTIONS || 10,
  SESSION_TIMEOUT: process.env.SESSION_TIMEOUT || 60 * 60 * 1000, // 1 heure
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};