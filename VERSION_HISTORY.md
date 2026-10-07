# HelixSmash Version History

This document tracks the major milestones and evolutionary steps of the HelixSmash project.

## [1.18.0] - 2025-06-06
### Predator Pouncing Refinement
- **Double-Hop Mechanics**: Jumping predators now land mid-way on the central platform. This creates two distinct threat zones during their jump and forces the player to time their lateral movement more carefully.
- **Lighter Visuals**: Optimized animal skin colors for higher contrast and better visibility in dense forest sections.

## [1.17.0] - 2025-06-05
### Dynamic Platform Scaling
- **Fair Density**: Automatically increased the width of platforms containing multiple predators (2 or 3) by up to 70%. This ensures that even high-difficulty steps remain fair and navigable for the player.

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
