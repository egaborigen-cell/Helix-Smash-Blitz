/**
 * @fileOverview Safe wrapper for GamePush SDK.
 * Handles initialization checks and provides clean methods for game logic.
 */

import { CONFIG } from './config';

declare global {
  interface Window {
    GP?: any;
  }
}

export const GamePushService = {
  /**
   * Check if the SDK is available and the feature is enabled.
   */
  isReady(): boolean {
    return typeof window !== 'undefined' && !!window.GP && CONFIG.features.useGamePush;
  },

  /**
   * Shows a standard full-screen interstitial ad.
   */
  async showFullscreenAd() {
    if (this.isReady()) {
      return window.GP.ads.showFullscreen();
    }
    console.log('GamePush: Ad skip (SDK not ready)');
  },

  /**
   * Shows a rewarded video ad.
   * @param onReward Callback if the user finished the video.
   */
  async showRewardedAd(onReward: () => void) {
    if (this.isReady()) {
      window.GP.ads.showRewardedVideo().then((success: boolean) => {
        if (success) onReward();
      });
    }
  },

  /**
   * Update the player's high score.
   */
  setScore(score: number) {
    if (this.isReady()) {
      window.GP.leaderboard.set({ id: 'main', score });
    }
  },

  /**
   * Save game state to the cloud.
   */
  saveCloud(data: Record<string, any>) {
    if (this.isReady()) {
      window.GP.player.set(data);
      window.GP.player.sync();
    }
  }
};
