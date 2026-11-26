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
  - **Toy**: Balanced physics (Orange-Red).
  - **Neon**: Light and high-bouncing (Pink).
  - **Aqua**: Fast and heavy (Cyan).
- **Cross-Platform**: Optimized for both high-end desktop browsers and mobile touch devices.

## 🚀 Multi-Platform Builds

To build for a specific platform using environment variables:

1.  **Create a local env file**: Copy `.env.example` to `.env.local`.
2.  **Run a platform build**:
    ```bash
    # For Yandex Games
    NEXT_PUBLIC_PLATFORM_NAME=YANDEX npm run build
    
    # For CrazyGames
    NEXT_PUBLIC_PLATFORM_NAME=CRAZYGAMES npm run build
    ```
The `NEXT_PUBLIC_` prefix ensures the variables are available in the browser-side code after the static export.

## 📦 How to Make a Release

To release a new version on GitHub:

1.  **Prepare the Version**: Update the version number in `package.json` and add the latest changes to `CHANGELOG.md`.
2.  **Create an Export**: Run the build script to generate a deployment-ready ZIP file:
    ```bash
    npm run export-zip
    ```
    This will create a new archive in the `archives/` directory.
3.  **Push to GitHub**: Commit your changes and push to your main branch.
4.  **Create a Tag**: Create a git tag for your version:
    ```bash
    git tag -a v1.28.0 -m "Release version 1.28.0"
    git push origin v1.28.0
    ```
5.  **Draft Release**: 
    - Go to your repository on GitHub.
    - Click **Releases** > **Draft a new release**.
    - Select the tag you just pushed.
    - Title the release (e.g., `v1.28.0 - Stability Update`).
    - Copy the relevant notes from `CHANGELOG.md` into the description.
    - **Attach the ZIP**: Drag and drop the generated `.zip` file from your `archives/` folder into the binaries section.
6.  **Publish**: Click **Publish release**.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **3D Engine**: Three.js
- **Styling**: Tailwind CSS & ShadCN UI
- **AI Integration**: Genkit (Configured for future expansion)

## 🔧 Troubleshooting

### Git Credential Errors (VS Code)
If you see an error like `connect ECONNREFUSED /tmp/vscode-git-...sock`:
1.  **Restart VS Code**: This is the most reliable fix to reset the Git bridge.
2.  **Unset AskPass**: Run `unset GIT_ASKPASS` in your terminal to bypass the broken VS Code credential helper.

### Console Error: `.reset in derived store is deprecated`
If you see this error in the console after publishing:
- **Reason**: This is a deprecation warning from a monitoring script. It is harmless and can be ignored.
