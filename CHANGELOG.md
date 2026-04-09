
# Changelog

All notable changes to the HelixSmash project will be documented in this file.

## [1.3.1] - 2026-04-14
### Fixed
- **Turbopack Compatibility**: Removed `--turbopack` from the `dev` script to resolve "turbo.createProject is not supported by the wasm bindings" error in certain environments.

## [1.3.0] - 2026-04-13
### Added
- **Yandex Leaderboards**: Integrated leaderboard score submission. Final scores are now sent to the "TopScores" leaderboard automatically.

## [1.2.3] - 2026-04-12
### Fixed
- **Installation**: Added `esbuild` override to resolve command failures in paths with special characters (e.g., non-ASCII characters in folder names).

## [1.2.2] - 2026-04-11
### Fixed
- **Compatibility**: Forced `glob` v10 and `rimraf` v5 via `package.json` overrides to resolve "Glob versions prior to v9 are no longer supported" errors in modern Node.js environments.

## [1.2.1] - 2026-04-10
### Fixed
- **Compatibility**: Removed `patch-package` to resolve "inflight module is not supported" error in modern Node.js environments.

## [1.2.0] - 2026-04-09
### Added
- **Insane Difficulty**: A new extreme mode with 50 levels, single-gap platforms, and high danger density.
- **Localization**: Full support for English and Russian languages with a UI toggle.
- **Yandex Games SDK**: Integrated SDK initialization and `gameready` signaling for platform compatibility.

## [1.1.0] - 2024-05-18
### Added
- **Audio System**: Synthesized sound effects for bouncing, smashing, game over, and victory using Web Audio API.
- **Background Music**: Procedural rhythmic background track with a mute toggle in the HUD.
- **Keyboard Controls**: Added support for Arrow keys and A/D keys for desktop rotation.

## [1.0.0] - 2024-05-15
### Added
- Initial release of HelixSmash 3D.
- Procedural tower generation.
- Physics-based ball movement.
- Mobile touch/swipe controls.
- Easy and Hard difficulty modes.
- Static export configuration for Next.js.
