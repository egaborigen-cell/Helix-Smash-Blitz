
# Changelog

All notable changes to the HelixSmash project will be documented in this file.

## [1.12.0] - 2025-05-30
### Added
- **Lives System**: Implemented a three-lives system to increase player longevity.
- **Dynamic Hazards**: Predators (Foxes, Wolves, Bears) now jump across the player's path from side platforms.
- **Patrol AI**: Static hazards on main platforms now patrol laterally, adding a new layer of difficulty.
- **Environment**: Added decorative side platforms with low-poly trees to create a forest-like atmosphere.
- **Visuals**: Updated ball to a vibrant "Fox Toy" orange-red appearance.

### Improved
- **Respawn Logic**: Implemented a "snap and bounce" mechanism that guarantees the ball resets perfectly to the center of the last safe platform.
- **Physics**: Refined hazard jump arcs and speeds to ensure they pounce through the player's path rather than over it.
- **Documentation**: Created `VERSION_HISTORY.md` for better project tracking.

## [1.11.0] - 2025-05-29
### Changed
- **Visuals**: Unified platform colors to a consistent "green grass" theme (0x66bb6a).
- **UI/Onboarding**: Updated instructions and goal descriptions to reflect the new green platform color.

## [1.10.0] - 2025-05-28
### Added
- **UI Refactoring**: Moved skin selection to a dedicated modal dialog.
