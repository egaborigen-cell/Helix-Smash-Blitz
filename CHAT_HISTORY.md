
# HelixSmash Development History

This document serves as a record of the changes, bug fixes, and feature implementations requested during the current development session for **HelixSmash**.

## 🚀 Key Improvements & Features

### 🛠 Core Gameplay & Physics
- **Collision Robustness**: Refactored the physics engine to prioritize hazard detection. The ball now reliably registers hits with spikes (and predators) even at high velocities.
- **Size-Aware Collision**: Updated collision logic to use the ball's effective radius, ensuring the large "Toxic" skin has accurate hitboxes.
- **Starting Flow**: Platforms now spawn **3x wider** at the start of a run, tapering down to normal width over the first 60 units of distance to allow players to adjust to the speed.
- **Toxic Skin Scale**: Increased the scale of the "Toxic" skin ball to 2x for a unique gameplay feel.

### 🦊 Visuals & Aesthetics
- **Predator Hazards**: Replaced generic spikes with stylized low-poly **Fox** and **Wolf** models, complete with glowing hazard rings.
- **Danger Scaling**: Significantly increased the size of hazards and their visual danger zones for better readability.
- **UI Transitions**: Added a 1.5s delay before the Game Over screen appears, allowing for a clearer view of the ball's explosion particles.

### 📱 User Experience (UX)
- **Mobile Refactor**: Normalized touch controls so lateral movement feels consistent across all screen resolutions and devices.
- **Onboarding Tutorial**: Implemented a "How to Play" dialog that appears automatically on the first visit (saved via `localStorage`).
- **Localization**: Added full English and Russian support for the onboarding system and hazard warnings.

### 📡 Platform Integration
- **Yandex SDK V2**: Refactored the initialization process with robust retry logic and better handling of player data.
- **Ad Logic**: Fixed a bug where music would incorrectly unmute during or after ads if the player had manually muted.
- **Export Optimization**: Configured `next.config.ts` for static export and updated `package.json` with a precise `export-zip` script for one-click publishing.
- **Promo Materials**: Created a `yandex-promo/` directory containing localized marketing copy, AI graphic prompts, and vector assets (`icon.svg`, `cover.svg`).

## 📄 File Modifications Log
- `src/components/game/GameManager.ts`: Collision logic, animal models, starting width logic.
- `src/components/game/HelixGame.tsx`: SDK integration, UI delay, onboarding state, ad callbacks.
- `src/app/lib/translations.ts`: Localization for predators and tutorial.
- `package.json`: Refined export scripts for Yandex Games.
- `next.config.ts`: Finalized static export configuration.
- `yandex-promo/`: Vector graphics and marketing metadata.
