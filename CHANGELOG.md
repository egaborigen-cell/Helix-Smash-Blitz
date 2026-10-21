
# Changelog

All notable changes to the HelixSmash project will be documented in this file.

## [1.21.0] - 2025-06-09
### Improved
- **Physics Engine**: Implemented velocity-aware collision detection. The "landing window" now dynamically scales with vertical velocity to prevent ball tunneling at high speeds.
- **Skins**: Balanced all skin parameters (Fox Toy, Neon, Aqua) for maximum stability. Increased default ball scales and tightened gravity-to-bounce ratios.

## [1.20.0] - 2025-06-08
### Fixed
- **Physics**: Major overhaul of ball physics and collision detection. Increased ball scale for all skins and widened the landing detection window to prevent "tunneling" (falling between platforms) at high speeds.
- **Stability**: Calibrated gravity and bounce strength for Fox Toy, Neon, and Aqua skins to ensure predictable trajectories.

## [1.19.0] - 2025-06-07
### Improved
- **Environment**: Moved side platforms closer to the center track. This creates a denser forest atmosphere and makes jumping predators more dangerous due to their reduced travel distance.

## [1.18.0] - 2025-06-06
### Improved
- **Predator AI**: Refined jumping predators (Foxes, Wolves, Bears) to use a double-hop trajectory. They now land mid-way on the central platform during their jump, significantly increasing hazard presence on the main path.
- **Visuals**: Updated predator models with lighter, higher-contrast colors for better readability against the green forest environment.
