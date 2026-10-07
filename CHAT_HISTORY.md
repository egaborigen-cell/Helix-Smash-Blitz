
# HelixSmash Development History

This document serves as a record of the changes, bug fixes, and feature implementations requested during the current development session for **HelixSmash**.

## 🚀 Key Improvements & Features

### 📡 Documentation
- **Troubleshooting**: Added a dedicated section to `README.md` for resolving common Git credential issues and the ".reset in derived store" console warning encountered on web platforms.
- **Version History**: Created `VERSION_HISTORY.md` to track major milestones and evolutionary steps of the project.
- **Logs**: Updated `CHANGELOG.md` to reflect the latest predator speed adjustments, platform scaling, and Neon skin stability fixes.

### 🛠 Core Gameplay & Physics
- **Platform Balancing**: Dynamically increased the width of platforms containing 2 or 3 predators to ensure high-difficulty steps remain fair.
- **AI Balancing**: Reduced the movement speed of patrolling and jumping predators to make the game more accessible and balanced.
- **Neon Skin Refactor**: Stabilized the floaty Neon skin by recalibrating its gravity-to-bounce ratio, preventing it from falling between platforms.
- **Precision Bouncing**: Refactored the physics engine to dynamically calculate ball landing positions based on skin scale.
- **Three-Lives System**: Implemented a lives system where players have 3 attempts per run, with a "snap and bounce" respawn mechanism.
- **Mastery Rewards**: Players earn one extra life for every 10 new platforms they successfully land on (capped at 5 lives).
- **Dynamic Predators**: Refactored jumping predators (foxes, wolves, bears) to perform low, fast pounces across the player's path.
- **Predator Patrols**: Static hazards on platforms now patrol back and forth across their surface.

### 🦊 Visuals & Aesthetics
- **Grass Color Uniformity**: All platforms are now a consistent green grass color (0x66bb6a).
- **Environment Decoration**: Added non-interactive side platforms with high-poly trees. Increased tree height and added random scaling for a lush forest look.
- **Fox Toy Ball**: Updated the default ball appearance to an orange-red "toy" style with a refined high-visibility finish.

### 📱 User Experience (UX)
- **UI Refinement**: Redesigned the Game Over dialog with better contrast, a prominent score container, and an arcade-style "3D" button for improved readability.
- **Swipeable Onboarding**: Refactored the tutorial into a mobile-friendly carousel that supports touch swipes.
- **Skin Selection Refinement**: Moved skin selection to a high-fidelity modal dialog.

### 🐛 Bug Fixes
- **Respawn Trajectory**: Fixed an issue where high forward velocity caused the ball to overshoot platforms on respawn.
- **Neon Drift**: Resolved physics drift on the Neon skin by normalizing gravity/bounce ratios.
