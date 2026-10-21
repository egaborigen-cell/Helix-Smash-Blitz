
# Changelog

All notable changes to the HelixSmash project will be documented in this file.

## [1.23.0] - 2025-06-11
### Improved
- **Collision Robustness**: Increased platform depth from 2.5 to 3.5 and expanded the longitudinal collision window to 2.0. This creates a safer overlap between platforms, ensuring the ball always has a surface to land on even at maximum speed.
- **Physics Spacing**: Added a safety factor to the base platform spacing calculation to prioritize landing in the center of platforms.

## [1.22.0] - 2025-06-10
### Fixed
- **Physics**: Implemented Continuous Collision Detection (CCD) by checking path intersections between frames. This permanently resolves the issue of the ball falling through platforms at extreme speeds or variable frame rates.
- **Skins**: Further increased the physical scale for Fox Toy (2.6), Neon (2.2), and Aqua (2.4) to maximize collision robustness.

## [1.21.0] - 2025-06-09
### Improved
- **Physics Engine**: Implemented velocity-aware collision detection. The "landing window" now dynamically scales with vertical velocity to prevent ball tunneling at high speeds.
- **Skins**: Balanced all skin parameters (Fox Toy, Neon, Aqua) for maximum stability. Increased default ball scales and tightened gravity-to-bounce ratios.
