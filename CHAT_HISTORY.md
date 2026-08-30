
# HelixSmash Development History

This document serves as a record of the changes, bug fixes, and feature implementations requested during the current development session for **HelixSmash**.

## 🚀 Key Improvements & Features

### 📡 Platform Integration Refinement
- **Standalone Version**: Removed all Yandex Games SDK logic. The game is now a purely standalone web app.
- **Global Types**: Fixed a TypeScript declaration error for the global `Window` object to improve build stability.

### 🛠 Core Gameplay & Physics
- **Expanded Platforms**: Platforms are now significantly wider (up to 9 units) and are placed randomly across a much wider lane (16 units).
- **Collision Robustness**: Refactored the physics engine to prioritize hazard detection and handle the expanded lane dimensions.
- **Size-Aware Collision**: Updated collision logic to use the ball's effective radius, ensuring all skins have accurate hitboxes.
- **Gentle Starting Flow**: Initial platforms are even wider at the start to allow players to adjust to the new lateral speed requirements.

### 🦊 Visuals & Aesthetics
- **Predator Hazards**: Spikes are replaced with stylized low-poly **Fox** and **Wolf** models with glowing hazard rings.
- **Camera Adjustments**: Updated the camera to provide a wider field of view, accommodating the increased platform spread.

### 📱 User Experience (UX)
- **Swipeable Onboarding**: Refactored the tutorial into a mobile-friendly carousel that supports touch swipes.
- **Responsive UI**: Optimized onboarding and game overlays for mobile portrait orientation.
- **Instructions**: Updated movement labels to reflect both touch and keyboard controls.

## 📄 File Modifications Log
- `src/components/game/GameManager.ts`: Increased platform width, expanded lane width to 16, refined lateral placement randomness.
- `src/components/game/HelixGame.tsx`: Onboarding carousel implementation, mobile responsiveness.
- `src/app/lib/translations.ts`: Localization for predators and tutorial slides.
- `package.json`: Refined export scripts and dependency management.
