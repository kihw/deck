# Changelog

All notable changes to the Deck project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-05-05

### Added
- Initial release of Deck - Virtual Stream Deck
- Remote Stream Deck interface accessible via web browser
- Multi-device support (PC, smartphone, tablet)
- PIN-based authentication system
- Real-time WebSocket communication
- Default actions: Volume control, Screenshot, Open Browser
- QR code for easy connection sharing
- Responsive web interface for all screen sizes
- CLI command support (`deck start`)
- Easy installation with install.sh script
- Comprehensive documentation and user guide
- Unit tests for core functionality
- Environment configuration via .env file

### Security
- Random 4-digit PIN generation on startup
- Token-based session management
- Connection timeouts and limits
- Local network only access

### Technical Implementation
- Node.js + Express + Socket.IO backend
- HTML5 + CSS3 + JavaScript frontend  
- Modular architecture with services pattern
- Extensible action system
- Error handling and logging

[1.0.0]: https://github.com/kihw/deck/releases/tag/v1.0.0