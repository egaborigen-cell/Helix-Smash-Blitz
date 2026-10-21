
# Changelog

All notable changes to the HelixSmash project will be documented in this file.

## [1.25.0] - 2025-06-13
### Refactored
- **Core Engine Remake**: Rewrote `GameManager` from scratch to implement a Trajectory-Intercept Collision System. This resolves all "falling through platform" issues by calculating frame-independent intercepts.
- **Rhythmic Synchronization**: Spacing between platforms is now dynamically calculated based on the ball's air-time and current forward speed, ensuring a perfectly consistent bounce rhythm.

## [1.24.0] - 2025-06-12
### Improved
- **Collision Robustness**: Increased platform depth and detection buffers to create a zero-gap landing environment.
