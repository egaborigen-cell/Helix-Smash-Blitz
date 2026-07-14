
# Changelog

All notable changes to the HelixSmash project will be documented in this file.

## [1.5.0] - 2024-05-21
### Improved
- **User Experience**: The game now starts immediately upon selecting a difficulty mode, removing a redundant step from the start screen.
- **UI Feedback**: Added visual play indicators to difficulty buttons to signal they are interactive start triggers.

## [1.4.0] - 2024-05-20
### Added
- **Skin Selection**: Players can now choose between Toxic, Neon, and Aqua skins in the start menu.
- **Particle System**: High-performance 3D particle effects for bounces, smashed platforms, and level completions.
- **New Difficulty Modes**: Added 'PRACTICE' (no danger) and 'BEGINNER' (low risk) modes to improve accessibility for new players.
- **GitHub Workflow**: Added comprehensive instructions to README for staging, committing, and pushing code.

### Improved
- **Yandex SDK Robustness**: Implemented a retry mechanism for SDK initialization and added player authorization support.
- **Visual Feedback**: Platform colors and particle effects now sync with the selected ball skin.

## [1.3.4] - 2026-04-17
### Fixed
- **Yandex 404 Resolution**: Updated `README.md` with critical instructions for correct ZIP archiving (zipping contents vs zipping the folder).
- **Deployment Optimization**: Explicitly set `distDir: 'out'` in `next.config.ts` to ensure consistency across different build environments.

## [1.3.3] - 2026-04-16
### Fixed
- **SWC Binary Loading**: Added documentation regarding "next/swc" loading errors. These are typically caused by non-standard characters in the project path (e.g., "ƒ"). Moving the project to a standard alphanumeric path resolves this.

## [1.3.2] - 2026-04-15
### Fixed
- **Next/Font Compatibility**: Removed relative `assetPrefix` to resolve the "assetPrefix must start with a leading slash" error triggered by the Google Fonts loader.

## [1.3.1] - 2026-04-14
### Fixed
- **Turbopack Compatibility**: Removed `--turbopack` from the `dev` script to resolve "turbo.createProject is not supported by the wasm bindings" error in certain environments.

## [1.2.0] - 2024-04-09
### Added
- **Insane Difficulty**: A new extreme mode with 50 levels, single-gap platforms, and high danger density.
- **Localization**: Full support for English and Russian languages with a UI toggle.
- **Yandex Games SDK**: Integrated SDK initialization, leaderboard submission, and `gameready` signaling.
