
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
  
  private ballColor: number = 0xb8f53d;
  private gravity: number = -0.015;
  private bounceStrength: number = 0.32; 
  private ballScale: number = 1.0;
  private baseBallRadius: number = 0.3;
  private stepThickness: number = 0.3;
  private stepDepth: number = 2.5;

  private ballVelocityY: number = 0;
  private ballVelocityX: number = 0;
  private forwardSpeed: number = 0.15;
  private lateralSensitivity: number = 0.045;

  private steps: THREE.Mesh[] = [];
  private baseStepSpacing: number = 4;
  private nextStepZ: number = 0;
  private laneWidth: number = 16;

  constructor(options: GameOptions) {
    this.options = options;
    this.scene = new THREE.Scene();
    
    this.audio = new AudioManager();
    this.particles = new ParticleSystem(this.scene);
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 6, 10);
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
    directionalLight.position.set(5, 15, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    const ballGeo = new THREE.SphereGeometry(this.baseBallRadius, 32, 32);
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

  private createAnimalModel(type: 'fox' | 'wolf') {
    const group = new THREE.Group();
    const color = type === 'fox' ? 0xff8c00 : 0x4a4a4a;
    const accentColor = type === 'fox' ? 0xffffff : 0xff0000;
    
    const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 });
    const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.7 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 1.0), bodyMat);
    body.position.y = 0.4;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), bodyMat);
    head.position.set(0, 0.8, -0.6);
    head.castShadow = true;
    group.add(head);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), type === 'fox' ? accentMat : bodyMat);
    snout.position.set(0, 0.7, -0.9);
    group.add(snout);

    const earGeo = new THREE.ConeGeometry(0.15, 0.3, 4);
    const earL = new THREE.Mesh(earGeo, bodyMat);
    earL.position.set(-0.2, 1.15, -0.6);
    group.add(earL);

    const earR = new THREE.Mesh(earGeo, bodyMat);
    earR.position.set(0.2, 1.15, -0.6);
    group.add(earR);

    const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const eyeL = new THREE.Mesh(eyeGeo, type === 'wolf' ? new THREE.MeshBasicMaterial({ color: 0xff0000 }) : eyeMat);
    eyeL.position.set(-0.15, 0.85, -0.85);
    group.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, type === 'wolf' ? new THREE.MeshBasicMaterial({ color: 0xff0000 }) : eyeMat);
    eyeR.position.set(0.15, 0.85, -0.85);
    group.add(eyeR);

    const ringGeo = new THREE.RingGeometry(1.0, 1.3, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      transparent: true, 
      opacity: 0.8, 
      side: THREE.DoubleSide 
    });
    const hazardRing = new THREE.Mesh(ringGeo, ringMat);
    hazardRing.rotation.x = -Math.PI / 2;
    hazardRing.position.y = 0.05;
    group.add(hazardRing);

    return group;
  }

  private createStep(z: number) {
    const progressFactor = Math.min(this.score / 500, 1);
    const isDanger = this.difficulty === 'PRACTICE' ? false : (z < 20 ? false : (Math.random() > (0.8 - progressFactor * 0.2)));
    
    const baseWidth = this.difficulty === 'INSANE' ? 4.0 : this.difficulty === 'HARD' ? 6.0 : 8.5;
    const startWidthMultiplier = Math.max(1, 2.5 - (z / 60) * 1.5);
    const width = baseWidth * startWidthMultiplier;
    
    const geo = new THREE.BoxGeometry(width, this.stepThickness, this.stepDepth);
    const mat = new THREE.MeshStandardMaterial({ color: 0xf2cc0d, roughness: 0.5 });
    
    const step = new THREE.Mesh(geo, mat);
    step.receiveShadow = true;
    
    if (isDanger) {
      let numHazards = 1;
      if (z > 150) numHazards = 1 + Math.floor(Math.random() * 2);
      if (z > 400) numHazards = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < numHazards; i++) {
        const animalType = Math.random() > 0.5 ? 'fox' : 'wolf';
        const animalGroup = this.createAnimalModel(animalType);
        animalGroup.name = 'spike'; 

        const randomX = (Math.random() - 0.5) * (width - 2.5);
        const randomZ = (Math.random() - 0.5) * 1.2;
        animalGroup.position.set(randomX, 0.1, randomZ);
        animalGroup.rotation.y = Math.random() * Math.PI;
        step.add(animalGroup);
      }
    }
    
    const range = this.laneWidth - width;
    const xPos = z === 0 ? 0 : (Math.random() - 0.5) * range;
    step.position.set(xPos, 0, -z);
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

    const speeds = { PRACTICE: 0.12, BEGINNER: 0.15, EASY: 0.18, HARD: 0.25, INSANE: 0.35 };
    this.forwardSpeed = speeds[difficulty];
    
    const bounceTime = 2 * this.bounceStrength / -this.gravity;
    this.baseStepSpacing = this.forwardSpeed * bounceTime;
    
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
    
    for (let i = 0; i < 20; i++) {
        this.createStep(this.nextStepZ);
        this.nextStepZ += this.baseStepSpacing;
    }

    const currentBallRadius = this.baseBallRadius * this.ballScale;
    this.ball.position.set(0, this.stepThickness / 2 + currentBallRadius + 0.1, 0);
    this.ballVelocityY = this.bounceStrength;
    this.ballVelocityX = 0;
    
    this.particles.clear();
    this.audio.startMusic();
  }

  public setMuted(muted: boolean) {
    this.audio.setMuted(muted);
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
    
    const targetCamX = this.ball.position.x * 0.6;
    const targetCamY = this.ball.position.y + 5;
    const targetCamZ = this.ball.position.z + 10;
    
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.1;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.05;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.1;
    this.camera.lookAt(this.ball.position.x, this.ball.position.y, this.ball.position.z - 6);
    
    this.renderer.render(this.scene, this.camera);
  };

  private spawnSteps() {
    if (Math.abs(this.ball.position.z) + 60 > this.nextStepZ) {
        this.createStep(this.nextStepZ);
        this.nextStepZ += this.baseStepSpacing;
    }

    if (this.steps.length > 35) {
        const first = this.steps[0];
        if (first.position.z > this.ball.position.z + 25) {
            this.stepsGroup.remove(first);
            this.steps.shift();
        }
    }
  }

  private updatePhysics() {
    this.ball.position.z -= this.forwardSpeed;
    this.ball.position.x += this.ballVelocityX;
    this.ballVelocityX *= 0.85;
    
    if (Math.abs(this.ball.position.x) > this.laneWidth / 2 + 1.5) {
        this.gameOver();
        return;
    }

    this.ballVelocityY += this.gravity;
    this.ball.position.y += this.ballVelocityY;

    const currentBallRadius = this.baseBallRadius * this.ballScale;

    for (const step of this.steps) {
        const dx = Math.abs(this.ball.position.x - step.position.x);
        const dz = Math.abs(this.ball.position.z - step.position.z);
        const dy = this.ball.position.y - step.position.y;

        if (step.userData.isDanger && dz < this.stepDepth / 2 + 0.5 && dy < 1.8 && dy > -0.8) {
            const hazardRadius = 1.3; 
            for (const child of step.children) {
                if (child.name === 'spike') {
                    const spikeGlobalX = step.position.x + child.position.x;
                    const spikeGlobalZ = step.position.z + child.position.z;
                    
                    const distSq = Math.pow(this.ball.position.x - spikeGlobalX, 2) + Math.pow(this.ball.position.z - spikeGlobalZ, 2);
                    const collisionThreshold = Math.pow(hazardRadius + (currentBallRadius * 0.4), 2);

                    if (distSq < collisionThreshold) {
                        this.particles.emit(this.ball.position, 0xff0000, 70, 0.7);
                        this.gameOver();
                        return; 
                    }
                }
            }
        }
    }

    for (const step of this.steps) {
        const dx = Math.abs(this.ball.position.x - step.position.x);
        const dz = Math.abs(this.ball.position.z - step.position.z);
        const dy = this.ball.position.y - step.position.y;
        const width = (step.geometry as THREE.BoxGeometry).parameters.width;

        const surfaceY = step.position.y + this.stepThickness / 2;
        const targetLandingY = surfaceY + currentBallRadius;
        const landingThreshold = 0.35; 

        if (this.ballVelocityY < 0 && 
            dz < this.stepDepth / 2 && 
            dx < width / 2 + (currentBallRadius * 0.4) &&
            this.ball.position.y < targetLandingY + landingThreshold && 
            this.ball.position.y > surfaceY - 0.2) {
            
            this.performBounce(step, targetLandingY);
            return;
        }
    }

    if (this.ball.position.y < -15) {
        this.gameOver();
    }
  }

  private performBounce(step: THREE.Mesh, landingY: number) {
    this.ballVelocityY = this.bounceStrength;
    this.ball.position.y = landingY;
    this.audio.playBounce();
    this.particles.emit(this.ball.position, 0xf2cc0d, 15, 0.2);
    
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
