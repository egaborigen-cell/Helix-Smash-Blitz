
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
- **Precision Bouncing**: Refactored the physics engine to dynamically calculate ball landing positions based on skin scale. This ensures all ball types (Toxic, Neon, Aqua) touch the platforms perfectly without clipping or floating.
- **Expanded Platforms**: Platforms are now significantly wider (up to 11 units base width) and are placed randomly across a much wider lane (16 units).
- **Collision Robustness**: Refactored the physics engine to prioritize hazard detection and handle the expanded lane dimensions.
- **Size-Aware Collision**: Updated collision logic to use the ball's effective radius, ensuring all skins have accurate hitboxes.
- **Gentle Starting Flow**: Initial platforms are 2.5x wider at the start to allow players to adjust to the new lateral speed requirements.
- **Lives System & Respawn**: Implemented a three-lives system with refined respawn logic. 
- **Bulletproof Respawn Management**: Refactored the respawn system to use a "snap and bounce" mechanism. Instead of dropping the ball from a height (which risked missing platforms at high speeds), the ball now resets precisely to its last successful landing point and triggers an immediate bounce, guaranteed to be on the platform.

### 🦊 Visuals & Aesthetics
- **Predator Hazards**: Spikes are replaced with stylized low-poly **Fox** and **Wolf** models with glowing hazard rings.
- **Environment Decoration**: Added non-interactive side platforms with low-poly trees on both the left and right sides of the main track, enhancing the visual depth of the forest environment.
- **Camera Adjustments**: Updated the camera to provide a wider field of view, accommodating the increased platform spread.
- **Font Optimization**: Switched from `next/font` to native system fonts for better performance and simplicity.
- **Lives HUD**: Added a heart-based lives indicator to the game's header.
- **Respawn Effects**: Added a visual blinking effect during invulnerability after losing a life.

### 📱 User Experience (UX)
- **Swipeable Onboarding**: Refactored the tutorial into a mobile-friendly carousel that supports touch swipes.
- **Responsive UI**: Optimized onboarding and game overlays for mobile portrait orientation.
- **Responsive Start Menu**: Refined the main start menu to be more responsive on small screens, adjusting padding, gaps, and font sizes for portrait mobile devices.
- **Instructions**: Updated movement labels to reflect both touch and keyboard controls.
- **Skin Selection Refinement**: Moved the skin selection grid from the main start menu to a dedicated, high-fidelity dialog. The start menu now features a clean preview button that displays the currently active skin and triggers the selection modal.

### 🐛 Bug Fixes
- **TypeScript Interface Fix**: Added the missing `hex` property to the `SkinConfig` interface in `GameManager.ts` to resolve a property literal error in the skin selection UI.
- **Translation Indexing Fix**: Resolved a TypeScript error where indexing the translation object with broad keys caused a ReactNode mismatch.
- **Export Script**: Created `scripts/build-export.sh` to handle cleaning and zipping in a single automated step. Updated to support dated filenames and an `archives/` output folder.
- **Context Menu**: Disabled the global browser context menu to prevent gameplay interruptions.
