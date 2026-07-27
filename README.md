# Step Smash: 3D Endless Runner

Step Smash is a high-octane hyper-casual 3D endless runner built with Next.js, Three.js, and React. Navigate a bouncing ball across procedurally generated floating platforms, dodging deadly spikes and competing for the global high score.

## 🎮 Key Features

- **Procedural Step Generation**: An infinite path that becomes more challenging as you progress.
- **Dynamic Hazard System**: Strategically placed 3D spikes that test your reflexes.
- **Advanced Physics & Rhythm**: Synchronized bounce mechanics that reward consistent timing.
- **Diverse Difficulty Modes**:
  - **Practice**: Slow speed, wide steps, no spikes.
  - **Beginner**: Relaxed pace for casual play.
  - **Easy**: The standard runner experience.
  - **Hard**: Fast speed and narrow platforms.
  - **Insane**: Extreme speed with tiny steps for the pros.
- **Skin Customization**: 
  - **Toxic**: Balanced physics (Green).
  - **Neon**: Light and high-bouncing (Pink).
  - **Aqua**: Fast and heavy (Cyan).
- **Yandex Games Integrated**: Global leaderboards and ads ready for publishing.
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

## 📡 Deployment & Publishing

### Yandex Games Console
1. **Build the project**: `npm run build`
2. **Package for upload**: Open the `out/` directory. Select all files/folders *inside* `out/` and create a ZIP archive. 
   - *Note: Do not zip the 'out' folder itself, only its contents.*
3. **Leaderboards**: Ensure you create a leaderboard in the Yandex Console with the Technical Name: `TopScores`.

### Git Workflow
If you need to push updates to your repository:
1. `git add .`
2. `git commit -m "Your description of changes"`
3. `git push origin main`

## ❓ Troubleshooting

### "Permission Denied" on Git Push
If you see `remote: Permission to ... denied to ...`, it usually means your local Git is authenticated as a user who doesn't have write access to that specific repository.

**Solution:**
Create your own repository on GitHub and point the project to it:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 404 Errors on Yandex Games
Usually caused by incorrect zipping. Ensure the `index.html` file is at the root level of your ZIP archive, not inside a subfolder named `out`.

---
*For marketing copy and AI graphic prompts, see [src/app/yandex-promo.md](./src/app/yandex-promo.md).*
