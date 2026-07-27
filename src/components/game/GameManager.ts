
import * as THREE from 'three';
import { AudioManager } from './AudioManager';
import { ParticleSystem } from './ParticleSystem';

export type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'WON';
export type Difficulty = 'PRACTICE' | 'BEGINNER' | 'EASY' | 'HARD' | 'INSANE';

export interface SkinConfig {
  id: string;
  color: number;
  gravity: number;
  bounceStrength: number;
  scale: number;
}

interface GameOptions {
  onScoreUpdate: (score: number) => void;
  onGameStateChange: (state: GameState) => void;
  container: HTMLDivElement;
}

export class GameManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private stepsGroup: THREE.Group;
  private ball: THREE.Mesh;
  private clock: THREE.Clock;
  private audio: AudioManager;
  private particles: ParticleSystem;

  private score: number = 0;
  private gameState: GameState = 'START';
  private difficulty: Difficulty = 'EASY';
  private options: GameOptions;
  
  // Current Skin Settings
  private ballColor: number = 0xb8f53d;
  private gravity: number = -0.015;
  private bounceStrength: number = 0.3;
  private ballScale: number = 1.0;

  // Physics state
  private ballVelocityY: number = 0;
  private ballVelocityX: number = 0;
  private forwardSpeed: number = 0.15;
  private lateralSensitivity: number = 0.05;

  // Platform Generation
  private steps: THREE.Mesh[] = [];
  private stepSpacing: number = 4;
  private nextStepZ: number = 0;
  private laneWidth: number = 8;

  constructor(options: GameOptions) {
    this.options = options;
    this.scene = new THREE.Scene();
    
    this.audio = new AudioManager();
    this.particles = new ParticleSystem(this.scene);
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0x000000, 0);
    options.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.stepsGroup = new THREE.Group();
    this.scene.add(this.stepsGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    const ballGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({ color: this.ballColor, roughness: 0.3 });
    this.ball = new THREE.Mesh(ballGeo, ballMat);
    this.ball.castShadow = true;
    this.ball.position.set(0, 2, 0);
    this.scene.add(this.ball);

    this.animate();
    window.addEventListener('resize', this.onWindowResize);
  }

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private createStep(z: number) {
    const isDanger = Math.random() > 0.8 && z > 20;
    const width = this.difficulty === 'INSANE' ? 2.2 : this.difficulty === 'HARD' ? 3.8 : 5.5;
    const geo = new THREE.BoxGeometry(width, 0.3, 2);
    const mat = new THREE.MeshStandardMaterial({ 
      color: 0xf2cc0d,
      roughness: 0.5 
    });
    
    const step = new THREE.Mesh(geo, mat);
    step.receiveShadow = true;
    
    if (isDanger) {
      const spikeGeo = new THREE.ConeGeometry(0.2, 0.6, 4);
      const spikeMat = new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.3 });
      
      let numSpikes = 1;
      if (z > 100) numSpikes = 1 + Math.floor(Math.random() * 2);
      if (z > 250) numSpikes = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numSpikes; i++) {
        const spike = new THREE.Mesh(spikeGeo, spikeMat);
        spike.castShadow = true;
        const randomX = (Math.random() - 0.5) * (width - 0.6);
        const randomZ = (Math.random() - 0.5) * 1.4;
        spike.position.set(randomX, 0.45, randomZ);
        spike.rotation.y = Math.random() * Math.PI;
        step.add(spike);
      }
    }
    
    const range = this.laneWidth - width;
    step.position.set((Math.random() - 0.5) * range, 0, -z);
    step.userData = { isDanger, z };
    
    this.stepsGroup.add(step);
    this.steps.push(step);
  }

  public startGame(difficulty: Difficulty = 'EASY', skin: SkinConfig) {
    this.difficulty = difficulty;
    this.ballColor = skin.color;
    this.gravity = skin.gravity;
    this.bounceStrength = skin.bounceStrength;
    this.ballScale = skin.scale;

    const speeds = { PRACTICE: 0.1, BEGINNER: 0.12, EASY: 0.15, HARD: 0.22, INSANE: 0.3 };
    this.forwardSpeed = speeds[difficulty];
    
    (this.ball.material as THREE.MeshStandardMaterial).color.setHex(this.ballColor);
    this.ball.scale.setScalar(this.ballScale);

    this.gameState = 'PLAYING';
    this.options.onGameStateChange(this.gameState);
    this.score = 0;
    this.options.onScoreUpdate(this.score);
    
    while(this.stepsGroup.children.length > 0) { 
        this.stepsGroup.remove(this.stepsGroup.children[0]); 
    }
    this.steps = [];
    this.nextStepZ = 0;
    
    for (let i = 0; i < 15; i++) {
        this.createStep(this.nextStepZ);
        this.nextStepZ += this.stepSpacing;
    }

    // Set starting position higher to ensure collision on fast levels
    this.ball.position.set(this.steps[0].position.x, 1.5, 0);
    this.ballVelocityY = 0;
    this.ballVelocityX = 0;
    
    this.particles.clear();
    this.audio.startMusic();
  }

  public toggleMute() {
    return this.audio.toggleMute();
  }

  public moveBall(delta: number) {
    if (this.gameState !== 'PLAYING') return;
    this.ballVelocityX += delta * this.lateralSensitivity;
  }

  private animate = () => {
    const delta = this.clock.getDelta();
    requestAnimationFrame(this.animate);
    
    if (this.gameState === 'PLAYING') {
      this.updatePhysics();
      this.spawnSteps();
    }
    
    this.particles.update(delta);
    
    const targetCamX = this.ball.position.x * 0.5;
    const targetCamY = this.ball.position.y + 4;
    const targetCamZ = this.ball.position.z + 8;
    
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.1;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.05;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.1;
    this.camera.lookAt(this.ball.position.x, this.ball.position.y, this.ball.position.z - 5);
    
    this.renderer.render(this.scene, this.camera);
  };

  private spawnSteps() {
    if (Math.abs(this.ball.position.z) + 40 > this.nextStepZ) {
        this.createStep(this.nextStepZ);
        this.nextStepZ += this.stepSpacing;
    }

    if (this.steps.length > 20) {
        const first = this.steps[0];
        if (first.position.z > this.ball.position.z + 10) {
            this.stepsGroup.remove(first);
            this.steps.shift();
        }
    }
  }

  private updatePhysics() {
    this.ball.position.z -= this.forwardSpeed;
    
    this.ball.position.x += this.ballVelocityX;
    this.ballVelocityX *= 0.85; // Slightly increased damping for better control
    
    if (Math.abs(this.ball.position.x) > this.laneWidth / 2 + 1) {
        this.gameOver();
    }

    this.ballVelocityY += this.gravity;
    this.ball.position.y += this.ballVelocityY;

    if (this.ballVelocityY < 0) {
        for (const step of this.steps) {
            const dx = Math.abs(this.ball.position.x - step.position.x);
            const dz = Math.abs(this.ball.position.z - step.position.z);
            const dy = this.ball.position.y - step.position.y;

            const width = (step.geometry as THREE.BoxGeometry).parameters.width;

            if (dz < 1.2 && dx < width / 2 + 0.2 && dy > -0.2 && dy < 0.5) {
                // If the step has spikes, check for specific proximity to spikes
                if (step.userData.isDanger) {
                  let hitSpike = false;
                  for (const child of step.children) {
                    if (child instanceof THREE.Mesh) {
                      const spikeGlobalX = step.position.x + child.position.x;
                      const spikeGlobalZ = step.position.z + child.position.z;
                      const distToSpike = Math.sqrt(
                        Math.pow(this.ball.position.x - spikeGlobalX, 2) +
                        Math.pow(this.ball.position.z - spikeGlobalZ, 2)
                      );
                      
                      if (distToSpike < 0.45) { // Collision radius for spikes
                        hitSpike = true;
                        break;
                      }
                    }
                  }

                  if (hitSpike) {
                    this.particles.emit(this.ball.position, 0xff4444, 30, 0.4);
                    this.gameOver();
                    break;
                  }
                }

                // If not hit or not a spike step, perform standard bounce
                this.performBounce(step);
                break;
            }
        }
    }

    if (this.ball.position.y < -10) {
        this.gameOver();
    }
  }

  private performBounce(step: THREE.Mesh) {
    this.ballVelocityY = this.bounceStrength;
    this.ball.position.y = step.position.y + 0.4;
    this.audio.playBounce();
    this.particles.emit(this.ball.position, 0xf2cc0d, 12, 0.15);
    
    const newScore = Math.floor(Math.abs(this.ball.position.z));
    if (newScore > this.score) {
        this.score = newScore;
        this.options.onScoreUpdate(this.score);
    }
  }

  private gameOver() {
    if (this.gameState !== 'PLAYING') return;
    this.gameState = 'GAMEOVER';
    this.options.onGameStateChange(this.gameState);
    this.audio.playGameOver();
    this.audio.stopMusic();
  }

  public dispose() {
    this.renderer.dispose();
    this.audio.stopMusic();
    window.removeEventListener('resize', this.onWindowResize);
  }
}
