
# HelixSmash Development History

This document serves as a record of the changes, bug fixes, and feature implementations requested during the current development session for **HelixSmash**.

## 🚀 Key Improvements & Features

### 📡 Platform Integration Refinement
- **Standalone Version**: Removed all Yandex Games SDK logic. The game is now a purely standalone web app.
- **Global Types**: Fixed a TypeScript declaration error for the global `Window` interface declaration.
- **Static Export**: Verified `next.config.ts` for `output: 'export'` and implemented a dedicated `scripts/build-export.sh` shell script for robust packaging.
- **Localization**: Set Russian ('ru') as the default language for the application.
- **Export Automation**: Refined the export script to include the current date in the ZIP filename (e.g., `game-2025-05-28.zip`) and store generated archives in a dedicated `archives/` directory for better organization.
- **Executable Export Script**: Ensured the build export script is executable by using the `bash` prefix in `package.json`, bypassing potential permission issues on various operating systems.

### 🛠 Core Gameplay & Physics
- **Precision Bouncing**: Refactored the physics engine to dynamically calculate ball landing positions based on skin scale.
- **Expanded Platforms**: Platforms are now significantly wider and placed across a wider lane (16 units).
- **Collision Robustness**: Refactored the physics engine to prioritize hazard detection and handle the expanded lane dimensions.
- **Three-Lives System**: Implemented a lives system where players have 3 attempts per run.
- **Bulletproof Respawn**: Developed a "snap and bounce" respawn mechanism that ensures the ball always resets to the exact center of the last safe platform, preventing void falls after losing a life.
- **Dynamic Predators**: Refactored jumping predators (foxes, wolves, bears) to perform low, fast pounces across the player's path.
- **Predator Patrols**: Static hazards on platforms now patrol back and forth across their surface.

### 🦊 Visuals & Aesthetics
- **Grass Color Uniformity**: All platforms (main path and side decorations) are now a consistent green grass color (0x66bb6a).
- **Environment Decoration**: Added non-interactive side platforms with low-poly trees on both the left and right sides of the main track.
- **Fox Toy Ball**: Updated the default ball appearance to an orange-red "toy" style with a smoother, high-visibility material finish.
- **Camera Adjustments**: Updated the camera to provide a wider field of view, accommodating the increased platform spread.
- **Lives HUD**: Added a heart-based lives indicator to the game's header.
- **Respawn Effects**: Added a visual blinking effect during invulnerability after losing a life.

### 📱 User Experience (UX)
- **Swipeable Onboarding**: Refactored the tutorial into a mobile-friendly carousel that supports touch swipes.
- **Responsive Start Menu**: Refined the main start menu for portrait mobile devices.
- **Instructions**: Updated movement labels for both touch and keyboard controls.
- **Skin Selection Refinement**: Moved skin selection to a high-fidelity modal dialog with a preview button in the main menu.

### 🐛 Bug Fixes
- **Respawn Trajectory**: Fixed an issue where high forward velocity caused the ball to overshoot platforms on respawn by implementing the snap-to-center logic.
- **TypeScript Interface Fix**: Added the missing `hex` property to the `SkinConfig` interface.
- **Translation Indexing Fix**: Resolved a TypeScript error related to translation object indexing.
- **Export Script**: Automated the build and cleanup process for static web exports.
