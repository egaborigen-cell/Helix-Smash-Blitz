
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicOsc: OscillatorNode | null = null;
  private isMuted: boolean = false;
  private isStarted: boolean = false;

  constructor() {
    // Context is initialized on first user interaction
  }

  private init() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.updateVolume();
  }

  private updateVolume() {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.3, this.audioContext!.currentTime, 0.1);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.updateVolume();
    return this.isMuted;
  }

  public startMusic() {
    this.init();
    if (this.musicOsc || this.isMuted) return;

    const ctx = this.audioContext!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, ctx.currentTime); // Low A
    
    // Simple rhythmic pulse
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    this.musicOsc = osc;

    // Simple melody loop logic could go here, but keeping it basic for now
  }

  public stopMusic() {
    if (this.musicOsc) {
      this.musicOsc.stop();
      this.musicOsc = null;
    }
  }

  public playBounce() {
    this.playSound(440, 0.1, 'sine');
  }

  public playSmash() {
    this.playSound(880, 0.2, 'square', 0.1);
  }

  public playGameOver() {
    this.playSound(220, 0.5, 'sawtooth', 0.2, true);
  }

  public playWin() {
    this.playSound(660, 0.5, 'sine', 0.2, false, true);
  }

  private playSound(freq: number, duration: number, type: OscillatorType, volume = 0.1, slideDown = false, slideUp = false) {
    this.init();
    if (this.isMuted) return;

    const ctx = this.audioContext!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    if (slideDown) {
      osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    } else if (slideUp) {
      osc.frequency.exponentialRampToValueAtTime(freq * 2, ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }
}
