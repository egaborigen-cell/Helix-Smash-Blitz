
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
    const width = this.difficulty === 'INSANE' ? 1.5 : this.difficulty === 'HARD' ? 2.5 : 4;
    const geo = new THREE.BoxGeometry(width, 0.3, 2);
    const mat = new THREE.MeshStandardMaterial({ 
      color: isDanger ? 0xff4444 : 0xf2cc0d,
      roughness: 0.5 
    });
    
    const step = new THREE.Mesh(geo, mat);
    step.receiveShadow = true;
    
    // Procedural lateral placement
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

    // Adjust speed based on difficulty
    const speeds = { PRACTICE: 0.1, BEGINNER: 0.12, EASY: 0.15, HARD: 0.22, INSANE: 0.3 };
    this.forwardSpeed = speeds[difficulty];
    
    (this.ball.material as THREE.MeshStandardMaterial).color.setHex(this.ballColor);
    this.ball.scale.setScalar(this.ballScale);

    this.gameState = 'PLAYING';
    this.options.onGameStateChange(this.gameState);
    this.score = 0;
    this.options.onScoreUpdate(this.score);
    
    // Clear old steps
    while(this.stepsGroup.children.length > 0) { 
        this.stepsGroup.remove(this.stepsGroup.children[0]); 
    }
    this.steps = [];
    this.nextStepZ = 0;
    
    // Initial batch
    for (let i = 0; i < 15; i++) {
        this.createStep(this.nextStepZ);
        this.nextStepZ += this.stepSpacing;
    }

    this.ball.position.set(this.steps[0].position.x, 2, 0);
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
    
    // Camera follow
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
    // Keep steps ahead of ball
    if (Math.abs(this.ball.position.z) + 40 > this.nextStepZ) {
        this.createStep(this.nextStepZ);
        this.nextStepZ += this.stepSpacing;
    }

    // Cleanup steps behind
    if (this.steps.length > 20) {
        const first = this.steps[0];
        if (first.position.z > this.ball.position.z + 10) {
            this.stepsGroup.remove(first);
            this.steps.shift();
        }
    }
  }

  private updatePhysics() {
    // Forward Movement
    this.ball.position.z -= this.forwardSpeed;
    
    // Lateral Movement
    this.ball.position.x += this.ballVelocityX;
    this.ballVelocityX *= 0.9; // Friction
    
    // Clamp to lanes
    if (Math.abs(this.ball.position.x) > this.laneWidth / 2 + 1) {
        this.gameOver();
    }

    // Vertical Movement
    this.ballVelocityY += this.gravity;
    this.ball.position.y += this.ballVelocityY;

    // Collision Detection
    if (this.ballVelocityY < 0) {
        for (const step of this.steps) {
            const dx = Math.abs(this.ball.position.x - step.position.x);
            const dz = Math.abs(this.ball.position.z - step.position.z);
            const dy = this.ball.position.y - step.position.y;

            const width = (step.geometry as THREE.BoxGeometry).parameters.width;

            if (dz < 1.2 && dx < width / 2 + 0.2 && dy > -0.2 && dy < 0.5) {
                if (step.userData.isDanger) {
                    this.particles.emit(this.ball.position, 0xff4444, 30, 0.4);
                    this.gameOver();
                } else {
                    this.ballVelocityY = this.bounceStrength;
                    this.ball.position.y = step.position.y + 0.4;
                    this.audio.playBounce();
                    this.particles.emit(this.ball.position, 0xf2cc0d, 12, 0.15);
                    
                    // Score based on distance
                    const newScore = Math.floor(Math.abs(this.ball.position.z));
                    if (newScore > this.score) {
                        this.score = newScore;
                        this.options.onScoreUpdate(this.score);
                    }
                }
                break;
            }
        }
    }

    // Fall detection
    if (this.ball.position.y < -10) {
        this.gameOver();
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
