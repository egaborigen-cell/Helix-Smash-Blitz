# Step Smash: 3D Endless Runner

Step Smash is a high-octane hyper-casual 3D endless runner built with Next.js, Three.js, and React. Navigate a bouncing ball across procedurally generated floating platforms, dodging deadly predators and competing for high scores.

## 🎮 Key Features

- **Procedural Step Generation**: An infinite path that becomes more challenging as you progress.
- **Dynamic Hazard System**: Stylized 3D predators (foxes and wolves) that test your reflexes.
- **Advanced Physics & Rhythm**: Synchronized bounce mechanics that reward consistent timing.
- **Diverse Difficulty Modes**:
  - **Practice**: Slow speed, wide steps, no hazards.
  - **Beginner**: Relaxed pace for casual play.
  - **Easy**: The standard runner experience.
  - **Hard**: Fast speed and narrow platforms.
  - **Insane**: Extreme speed with tiny steps for the pros.
- **Skin Customization**: 
  - **Toxic**: Balanced physics (Green).
  - **Neon**: Light and high-bouncing (Pink).
  - **Aqua**: Fast and heavy (Cyan).
- **Cross-Platform**: Optimized for both high-end desktop browsers and mobile touch devices.

## 🚀 Getting Started

1.  **Start the development server**:
    ```bash
    npm run dev
    ```
2.  **Open the game**: Navigate to `http://localhost:9002`.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **3D Engine**: Three.js
- **Styling**: Tailwind CSS & ShadCN UI
- **AI Integration**: Genkit (Configured for future expansion)

## 🛠 Maintenance & Known Warnings

### NPM Deprecation Warnings
You may see a warning like: `npm warn deprecated @opentelemetry/exporter-jaeger@1.30.1: Package no longer supported`.
- **Reason**: This is a transitive dependency used by the Genkit telemetry system.
- **Impact**: **None.** This warning is informational and does not affect the game's build, performance, or functionality. You can safely ignore it.
