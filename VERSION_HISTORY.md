# HelixSmash Version History

This document tracks the major milestones and evolutionary steps of the HelixSmash project.

## [1.15.0] - 2025-06-03
### Physics Optimization
- **Neon Stability**: Fixed an issue where the Neon skin would drift off-track after multiple bounces by recalibrating its gravity-to-bounce ratio and increasing its physical scale to match the landing detection window better.

## [1.14.0] - 2025-06-02
### Mastery Rewards
- **Life Gain Mechanic**: Introduced a new rule where landing on 10 consecutive new platforms grants an extra life.
- **Dynamic Life UI**: The top-HUD heart counter now adjusts to show up to 5 lives visually.

## [1.13.0] - 2025-06-01
### Skyline Enhancement
- **Lush Forest**: Increased tree height on side platforms and introduced random height multipliers to create a more dynamic and organic forest environment.

## [1.12.0] - 2025-05-30
### Gameplay Revolution: The Forest & The Lives
- **Survival Mechanics**: Introduced a robust Three-Lives system.
- **Precision Respawning**: Implemented the "Snap-and-Bounce" logic to ensure players never miss a platform after losing a life.
- **Dynamic Hazards**: Added jumping predators (Foxes, Wolves, Bears) that cross the path from decorative side platforms.
- **Patrol AI**: Static hazards on the main path now move laterally to intercept the player.
- **Environment**: Added non-collidable side platforms with low-poly trees to create a forest aesthetic.
- **Visuals**: Updated default ball to an orange-red "Fox Toy" style.

## [1.11.0] - 2025-05-29
### Visual Consolidation
- **Grass Aesthetic**: Unified all platform colors to a consistent green (0x66bb6a).
- **Onboarding Update**: Refined the tutorial to focus on landing on the new green platforms.

## [1.10.0] - 2025-05-28
### UI & Performance
- **Skin Selection**: Moved skin management to a dedicated modal dialog.
- **Static Export**: Finalized the build scripts for standalone web deployment.

## [1.0.0] - 2025-05-25
### Initial Prototype
- Core Three.js engine implementation.
- Procedural step generation.
- Basic movement and score tracking.
