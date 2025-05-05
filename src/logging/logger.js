const winston = require('winston');
const path = require('path');

class Logger {
    constructor(logDir) {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({
                    filename: path.join(logDir, 'error.log'),
                    level: 'error'
                }),
                new winston.transports.File({
                    filename: path.join(logDir, 'combined.log')
                })
            ]
        });

        // Console logging en développement
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.simple()
            }));
        }
    }

    log(level, message, meta = {}) {
        this.logger.log(level, message, meta);
    }

    error(message, error) {
        this.logger.error(message, { error });
    }

    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    debug(message, meta = {}) {
        this.logger.debug(message, meta);
    }

    warn(message, meta = {}) {
        this.logger.warn(message, meta);
    }
}

module.exports = Logger;