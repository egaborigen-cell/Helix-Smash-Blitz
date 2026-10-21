
# HelixSmash Version History

This document tracks the major milestones and evolutionary steps of the HelixSmash project.

## [1.25.0] - 2025-06-13
### Engine Architecture Remake
- **Trajectory Intercepts**: Replaced simple position checks with Continuous Collision Detection (CCD) that tracks the ball's path between frames.
- **Dynamic Rhythm Spacing**: Platforms are now spaced mathematically to match the ball's parabolic arc, providing a satisfying and stable rhythmic experience.

## [1.24.0] - 2025-06-12
### Stability Overhaul
- **Zero-Gap Track**: Adjusted platform geometry to ensure continuous physical coverage across the Z-axis.
