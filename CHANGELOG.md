
# Changelog

All notable changes to the Step Smash project will be documented in this file.

## [1.29.0] - 2025-06-17
### Added
- **AI Awareness**: Implemented a "vision" system for enemies. Predators now turn to track the ball's position when it enters their proximity, making the game world feel more reactive and alive.

## [1.28.0] - 2025-06-16
### Added
- **Multi-Platform Config**: Implemented `src/lib/config.ts` for environment-based builds.
- **GamePush Integration**: Added `docs/GAMEPUSH_GUIDE.md` and a `GamePushService` wrapper to support cross-portal publishing (Yandex, VK, CrazyGames).
- **Publishing Quality Report**: Created `docs/PUBLISHING_REPORT.md` assessing the game's market readiness.

## [1.27.0] - 2025-06-15
### Fixed
- **Zero-Gap Stability**: Increased platform depth to 10.0 and synchronized step spacing with the ball's flight time. This ensures a continuous landing surface with safe overlap, permanently preventing the ball from falling through the track.
