/**
 * @fileOverview Centralized configuration for multi-platform builds.
 * Uses NEXT_PUBLIC_ environment variables which are baked into the static build.
 */

export const CONFIG = {
  platform: process.env.NEXT_PUBLIC_PLATFORM_NAME || 'GENERIC',
  appTitle: process.env.NEXT_PUBLIC_APP_TITLE || 'Step Smash',
  
  features: {
    showLeaderboards: process.env.NEXT_PUBLIC_SHOW_LEADERBOARDS === 'true',
    showExternalLinks: process.env.NEXT_PUBLIC_SHOW_EXTERNAL_LINKS === 'true',
  },

  analytics: {
    googleId: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
    yandexId: process.env.NEXT_PUBLIC_YANDEX_GAME_ID || '',
  },

  isYandex: process.env.NEXT_PUBLIC_PLATFORM_NAME === 'YANDEX',
  isCrazyGames: process.env.NEXT_PUBLIC_PLATFORM_NAME === 'CRAZYGAMES',
};
