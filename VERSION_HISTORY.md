
# HelixSmash Version History

This document tracks the major milestones and evolutionary steps of the HelixSmash project.

## [1.22.0] - 2025-06-10
### Path-Based Physics Stability
- **CCD Implementation**: The physics engine now samples the ball's Y-axis path between frames. If the ball was above the platform top in frame A and is below it in frame B, a collision is registered, eliminating "skipping."
- **Skin Buffs**: Increased all ball scales for better visibility and landing reliability.

## [1.21.0] - 2025-06-09
### Velocity-Aware Physics Refactor
- **Robust Collisions**: The physics engine now calculates a landing window based on the ball's current velocity. This ensures that even at maximum speed (0.4+ forward speed), the ball never misses a platform check.
- **Skin Fine-Tuning**: 
  - **Fox Toy**: Scaled to 2.3, gravity -0.018, bounce 0.36.
  - **Neon**: Scaled to 2.0, gravity -0.016, bounce 0.40.
  - **Aqua**: Scaled to 2.2, gravity -0.022, bounce 0.34.

## [1.20.0] - 2025-06-08
### Physics Stability & Scale Refactor
- **Reliable Landings**: Increased the ball's collision detection threshold by 40% and adjusted the Y-axis landing window. This fixes the bug where the ball could fall through platforms after several high-velocity bounces.
