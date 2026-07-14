# HelixSmash - 3D Bouncing Adventure

HelixSmash is a hyper-casual 3D game built with Next.js and Three.js. Guide a bouncing ball down a rotating procedural tower, smashing through colored platforms while avoiding dangerous obstacles.

## Features

- **Procedural Tower Generation**: Every game session features a unique tower layout.
- **Difficulty Modes**:
  - **Practice**: 5 levels, no danger zones.
  - **Beginner**: 10 levels, minimal risk.
  - **Easy**: 15 levels, standard gameplay.
  - **Hard**: 30 levels, high danger density.
  - **Insane**: 50 levels, extreme risk (single gap).
- **Skin Selection**: Choose between Toxic, Neon, and Aqua styles.
- **Particle System**: High-performance 3D particle effects for bounces and smashes.
- **Mobile Optimized**: Smooth touch and keyboard controls.
- **Localization**: Full English and Russian support.
- **Yandex Games Integrated**: Leaderboards, Fullscreen Ads, and SDK initialization ready.

## Marketing & Publishing

If you are ready to publish on Yandex Games, check out [src/app/yandex-promo.md](./src/app/yandex-promo.md) for localized descriptions and AI graphic prompts.

## Getting Started

1.  **Start the development server**:
    ```bash
    npm run dev
    ```
2.  **Open the game**: Navigate to `http://localhost:9002` in your browser.

## Pushing Updates to GitHub

1. **Stage all changes**: `git add .`
2. **Commit your work**: `git commit -m "Update features"`
3. **Push to the main branch**: `git push origin main`

## Deployment to Yandex Games

1. **Build**: `npm run build`
2. **Zip**: Open the `out/` folder, select all contents, and create a ZIP. **Do not zip the 'out' folder itself.**
3. **Leaderboard**: Create a leaderboard with the Technical Name: `TopScores` in the Yandex Console.

## Troubleshooting

- **404 Errors**: Ensure you zipped the *contents* of the `out` folder.
- **SWC Errors**: Ensure your project path contains only standard alphanumeric characters.
