# GamePush Integration Guide - Step Smash

[GamePush](https://gamepush.com/) is a powerful platform for publishing HTML5 games. It abstracts multiple game portal SDKs (Yandex, VK, CrazyGames, etc.) into one unified API.

## 🚀 Why use GamePush?
- **Unified Ads**: One command to show interstitials or rewarded videos across all supported platforms.
- **Cross-Platform Leaderboards**: Manage high scores without setting up separate backends for each portal.
- **Cloud Saves**: Sync player progress (skins, scores) automatically.
- **Analytics**: Built-in tracking for player retention and revenue.

## 🛠 Setup Instructions

### 1. Register Your Game
- Create an account at [GamePush Panel](https://cp.gamepush.com/).
- Add a new game and note your **Project ID** and **Token**.

### 2. Add the SDK
In `src/app/layout.tsx`, you can add the GamePush loader script:
```tsx
<script src="https://gamepush.com/sdk/gamepush.js?id=YOUR_PROJECT_ID&token=YOUR_TOKEN"></script>
```

### 3. Using the Wrapper
We've added `src/lib/gamepush.ts` to safely interact with the global `window.GP` object.

#### Show Interstitial Ad:
```ts
import { GamePushService } from '@/lib/gamepush';

// Call this when the game ends or at menu transitions
GamePushService.showFullscreenAd();
```

#### Submit High Score:
```ts
GamePushService.setScore(score);
```

## 📦 Build for GamePush
GamePush accepts standard static exports.
1. Run `npm run build`
2. Zip the contents of the `out` folder.
3. Upload to the GamePush panel.
