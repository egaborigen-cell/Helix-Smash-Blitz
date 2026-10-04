
# HelixSmash Development History

This document serves as a record of the changes, bug fixes, and feature implementations requested during the current development session for **HelixSmash**.

## 🚀 Key Improvements & Features

### 📡 Documentation
- **Version History**: Created `VERSION_HISTORY.md` to track major milestones and evolutionary steps of the project.
- **Logs**: Updated `CHANGELOG.md` to reflect the latest gameplay refactors.

### 🛠 Core Gameplay & Physics
- **Precision Bouncing**: Refactored the physics engine to dynamically calculate ball landing positions based on skin scale.
- **Expanded Platforms**: Platforms are now significantly wider and placed across a wider lane (16 units).
- **Three-Lives System**: Implemented a lives system where players have 3 attempts per run.
- **Bulletproof Respawn**: Developed a "snap and bounce" respawn mechanism that ensures the ball always resets to the exact center of the last safe platform, preventing void falls after losing a life.
- **Dynamic Predators**: Refactored jumping predators (foxes, wolves, bears) to perform low, fast pounces across the player's path.
- **Predator Patrols**: Static hazards on platforms now patrol back and forth across their surface.

### 🦊 Visuals & Aesthetics
- **Grass Color Uniformity**: All platforms (main path and side decorations) are now a consistent green grass color (0x66bb6a).
- **Environment Decoration**: Added non-interactive side platforms with low-poly trees on both the left and right sides of the main track.
- **Fox Toy Ball**: Updated the default ball appearance to an orange-red "toy" style with a smoother, high-visibility material finish.
- **Camera Adjustments**: Updated the camera to provide a wider field of view.

### 📱 User Experience (UX)
- **Swipeable Onboarding**: Refactored the tutorial into a mobile-friendly carousel that supports touch swipes.
- **Skin Selection Refinement**: Moved skin selection to a high-fidelity modal dialog with a preview button in the main menu.

### 🐛 Bug Fixes
- **Respawn Trajectory**: Fixed an issue where high forward velocity caused the ball to overshoot platforms on respawn by implementing the snap-to-center logic.
- **TypeScript Interface Fix**: Added missing properties to the `SkinConfig` interface.
