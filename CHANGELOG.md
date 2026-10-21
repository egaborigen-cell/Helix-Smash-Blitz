
# Changelog

All notable changes to the HelixSmash project will be documented in this file.

## [1.27.0] - 2025-06-15
### Fixed
- **Zero-Gap Stability**: Increased platform depth to 10.0 and synchronized step spacing with the ball's flight time. This ensures a continuous landing surface with safe overlap, permanently preventing the ball from falling through the track.

## [1.26.0] - 2025-06-14
### Refactored
- **Simplified Progression**: Removed dynamic difficulty scaling. Speed, platform width, and hazard density are now constant for a more consistent gameplay experience.

## [1.25.0] - 2025-06-13
### Refactored
- **Core Engine Remake**: Rewrote `GameManager` from scratch to implement a Trajectory-Intercept Collision System. This resolves all "falling through platform" issues by calculating frame-independent intercepts.
- **Rhythmic Synchronization**: Spacing between platforms is now dynamically calculated based on the ball's air-time and current forward speed, ensuring a perfectly consistent bounce rhythm.

## [1.24.0] - 2025-06-12
### Improved
- **Collision Robustness**: Increased platform depth and detection buffers to create a zero-gap landing environment.
