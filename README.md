# HelixSmash - 3D Bouncing Adventure

HelixSmash is a hyper-casual 3D game built with Next.js and Three.js. Guide a bouncing ball down a rotating procedural tower, smashing through colored platforms while avoiding dangerous obstacles.

## Features

- **Procedural Tower Generation**: Every game session features a unique tower layout.
- **Difficulty Modes**:
  - **Easy**: Shorter towers (15 levels) with more gaps and fewer danger zones.
  - **Hard**: Tall towers (30 levels) with fewer gaps, more danger zones, and higher score multipliers.
- **Responsive 3D Graphics**: Powered by Three.js with smooth animations and dynamic lighting.
- **Mobile Optimized**: Smooth touch controls for rotating the tower on any device.
- **Score System**: Track your progress as you smash through levels.

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
    - **Desktop**: Click and drag your mouse horizontally to rotate the tower.
    - **Mobile**: Swipe left or right to rotate the tower.
    - Avoid the red segments and reach the green finish platform at the bottom!

## Deployment

This project is configured for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting). Use the `apphosting.yaml` for configuration.
