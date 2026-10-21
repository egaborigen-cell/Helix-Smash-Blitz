
# HelixSmash Version History

This document tracks the major milestones and evolutionary steps of the HelixSmash project.

## [1.23.0] - 2025-06-11
### Maximum Stability Refactor
- **Overlapping Collision Zones**: Increased platform depth and collision Z-threshold to ensure 100% landing reliability. There are no longer any physical "dead zones" where the ball can fall through the track.

## [1.22.0] - 2025-06-10
### Path-Based Physics Stability
- **CCD Implementation**: The physics engine now samples the ball's Y-axis path between frames. If the ball was above the platform top in frame A and is below it in frame B, a collision is registered, eliminating "skipping."
- **Skin Buffs**: Increased all ball scales for better visibility and landing reliability.

## [1.21.0] - 2025-06-09
### Velocity-Aware Physics Refactor
- **Robust Collisions**: The physics engine now calculates a landing window based on the ball's current velocity. This ensures that even at maximum speed (0.4+ forward speed), the ball never misses a platform check.
