
# HelixSmash Development History

This document serves as a record of the changes, bug fixes, and feature implementations requested during the current development session for **HelixSmash**.

## 🚀 Key Improvements & Features

### 📡 Platform Integration Refinement
- **Standalone Version**: Removed all Yandex Games SDK logic. The game is now a purely standalone web app.
- **Global Types**: Fixed a TypeScript declaration error for the global `Window` interface declaration.
- **Static Export**: Verified `next.config.ts` for `output: 'export'` and implemented a dedicated `scripts/build-export.sh` shell script for robust packaging.
- **Localization**: Set Russian ('ru') as the default language for the application.
- **Export Automation**: Refined the export script to include the current date in the ZIP filename (e.g., `game-2025-05-28.zip`) for better version tracking.

### 🛠 Core Gameplay & Physics
- **Precision Bouncing**: Refactored the physics engine to dynamically calculate ball landing positions based on skin scale. This ensures all ball types (Toxic, Neon, Aqua) touch the platforms perfectly without clipping or floating.
- **Expanded Platforms**: Platforms are now significantly wider (up to 9 units) and are placed randomly across a much wider lane (16 units).
- **Collision Robustness**: Refactored the physics engine to prioritize hazard detection and handle the expanded lane dimensions.
- **Size-Aware Collision**: Updated collision logic to use the ball's effective radius, ensuring all skins have accurate hitboxes.
- **Gentle Starting Flow**: Initial platforms are 3x wider at the start to allow players to adjust to the new lateral speed requirements.

### 🦊 Visuals & Aesthetics
- **Predator Hazards**: Spikes are replaced with stylized low-poly **Fox** and **Wolf** models with glowing hazard rings.
- **Camera Adjustments**: Updated the camera to provide a wider field of view, accommodating the increased platform spread.
- **Font Optimization**: Switched from `next/font` to native system fonts for better performance and simplicity.

### 📱 User Experience (UX)
- **Swipeable Onboarding**: Refactored the tutorial into a mobile-friendly carousel that supports touch swipes.
- **Responsive UI**: Optimized onboarding and game overlays for mobile portrait orientation.
- **Instructions**: Updated movement labels to reflect both touch and keyboard controls.

### 🐛 Bug Fixes
- **TypeScript Interface Fix**: Added the missing `hex` property to the `SkinConfig` interface in `GameManager.ts` to resolve a property literal error in the skin selection UI.
- **Translation Indexing Fix**: Resolved a TypeScript error where indexing the translation object with broad keys caused a ReactNode mismatch.
- **Export Script**: Created `scripts/build-export.sh` to handle cleaning and zipping in a single automated step.

## 📄 File Modifications Log
- `scripts/build-export.sh`: Updated to include dynamic dating in the output filename.
- `src/components/game/GameManager.ts`: Refined bounce physics for precision landing, increased platform width, expanded lane width to 16, refined lateral placement randomness, implemented predator models, and fixed `SkinConfig` interface.
- `src/components/game/HelixGame.tsx`: Onboarding carousel implementation, mobile responsiveness, removal of Yandex SDK hooks, and set default language to Russian. Fixed translation indexing types.
- `src/app/lib/translations.ts`: Localization for predators and tutorial slides.
- `package.json`: Updated `export-zip` script to call the new shell script.
- `next.config.ts`: Configured for static web export.
