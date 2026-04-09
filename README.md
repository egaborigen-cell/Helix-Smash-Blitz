# HelixSmash - 3D Bouncing Adventure

HelixSmash is a hyper-casual 3D game built with Next.js and Three.js. Guide a bouncing ball down a rotating procedural tower, smashing through colored platforms while avoiding dangerous obstacles.

## Features

- **Procedural Tower Generation**: Every game session features a unique tower layout.
- **Difficulty Modes**:
  - **Easy**: Shorter towers (15 levels) with more gaps and fewer danger zones.
  - **Hard**: Tall towers (30 levels) with fewer gaps, more danger zones, and higher score multipliers.
  - **Insane**: Extreme towers (50 levels) with only a single gap per platform and high danger zone density.
- **Responsive 3D Graphics**: Powered by Three.js with smooth animations and dynamic lighting.
- **Mobile Optimized**: Smooth touch controls for rotating the tower on any device.
- **Score System**: Track your progress as you smash through levels.
- **Localization**: Supports English and Russian.
- **Yandex Games Integrated**: Fully compatible with the Yandex Games SDK.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **3D Engine**: [Three.js](https://threejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

1.  **Start the development server**:
    ```bash
    npm run dev
    ```
2.  **Open the game**: Navigate to `http://localhost:9002` in your browser.
3.  **How to Play**:
    - **Desktop**: Click and drag your mouse horizontally or use **Arrow Keys / A-D keys** to rotate the tower.
    - **Mobile**: Swipe left or right to rotate the tower.
    - Avoid the red segments and reach the green finish platform at the bottom!

## Pushing Updates to GitHub

To push your local changes to your GitHub repository:

1. **Stage all changes**:
   ```bash
   git add .
   ```
2. **Commit your work**:
   ```bash
   git commit -m "Add new features and fixes"
   ```
3. **Push to the main branch**:
   ```bash
   git push origin main
   ```

## Deployment

This project is configured for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting). Use the `apphosting.yaml` for configuration. For static export (like for Yandex Games), run:

```bash
npm run build
```
The output will be in the `out` directory.
