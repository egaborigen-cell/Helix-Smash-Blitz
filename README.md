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
- **Yandex Games Integrated**: Fully compatible with the Yandex Games SDK, Fullscreen Ads, and Leaderboards.

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
   git commit -m "Update features and fix bugs"
   ```
3. **Push to the main branch**:
   ```bash
   git push origin main
   ```

## Deployment to Yandex Games

To resolve 404 errors and ensure correct SDK integration on Yandex Games:

1. **Build the project**:
   ```bash
   npm run build
   ```
2. **Locate the output**: The build files are in the `out/` directory.
3. **Zip correctly**: 
   - Open the `out/` folder.
   - Select **all files and folders inside** (including `index.html`, `_next/`, etc.).
   - Create a ZIP archive from these selected items.
   - **DO NOT** zip the `out/` folder itself. The `index.html` must be at the top level of the ZIP.
4. **Leaderboard Setup**:
   - In the Yandex Games Console, go to the **Leaderboards** section.
   - Create a new leaderboard with the **Technical Name**: `TopScores`.
   - Ensure the name matches exactly, as the code uses this identifier to submit scores.

## Troubleshooting

- **404 Errors**: Ensure you zipped the *contents* of the `out` folder, not the folder itself.
- **Leaderboard Not Working**: Double-check the technical name in the Yandex Console matches `TopScores`.
- **SWC Errors**: If the build fails locally, ensure your project path contains only standard alphanumeric characters (no special symbols like `ƒ`).
