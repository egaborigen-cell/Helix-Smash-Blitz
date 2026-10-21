
# Changelog

All notable changes to the HelixSmash project will be documented in this file.

## [1.22.0] - 2025-06-10
### Fixed
- **Physics**: Implemented Continuous Collision Detection (CCD) by checking path intersections between frames. This permanently resolves the issue of the ball falling through platforms at extreme speeds or variable frame rates.
- **Skins**: Further increased the physical scale for Fox Toy (2.6), Neon (2.2), and Aqua (2.4) to maximize collision robustness.

## [1.21.0] - 2025-06-09
### Improved
- **Physics Engine**: Implemented velocity-aware collision detection. The "landing window" now dynamically scales with vertical velocity to prevent ball tunneling at high speeds.
- **Skins**: Balanced all skin parameters (Fox Toy, Neon, Aqua) for maximum stability. Increased default ball scales and tightened gravity-to-bounce ratios.

## [1.20.0] - 2025-06-08
### Fixed
- **Physics**: Major overhaul of ball physics and collision detection. Increased ball scale for all skins and widened the landing detection window to prevent "tunneling" (falling between platforms) at high speeds.
- **Stability**: Calibrated gravity and bounce strength for Fox Toy, Neon, and Aqua skins to ensure predictable trajectories.
