import * as THREE from 'whiteboard-three';
import * as THREE_ORIGINAL from 'three';
const THREE = THREE_ORIGINAL;
import { AudioManager } from './AudioManager';
import { ParticleSystem } from './ParticleSystem';

/**
 * @fileOverview Core Game Engine for HelixSmash.
 * Manages Three.js scene, physics, procedural generation, and game logic.
 */

export type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'WON';
export type Difficulty = 'PRACTICE' | 'BEGINNER' | 'EASY' | 'HARD' | 'INSANE';

export interface SkinConfig {
  id: string;
  color: number;
  hex: string;
  gravity: number;
  bounceStrength: number;
  scale: number;
}

interface GameOptions {
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onGameStateChange: (state: GameState) => void;
  container: HTMLDivElement;
}

interface JumperAnimal {
  mesh: THREE.Group;
  startX: number;
  direction: number;
  isJumping: boolean;
  jumpProgress: number;
}

export class GameManager {
  // Three.js Core
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private stepsGroup: THREE.Group;
  private ball: THREE.Mesh;
  private clock: THREE.Clock;
  
  // Systems
  private audio: AudioManager;
  private particles: ParticleSystem;

  // Game State
  private score: number = 0;
  private lives: number = 3;
  private platformsSinceLastLife: number = 0;
  private lastBouncedStepId: string | null = null;
  private gameState: GameState = 'START';
  private options: GameOptions;
  
  // Physics Settings (Overwritten by skins)
  private ballColor: number = 0xff4500;
  private gravity: number = -0.012;
  private bounceStrength: number = 0.30; 
  private ballScale: number = 1.0;
  
  // Constants
  private readonly BASE_BALL_RADIUS = 0.3;
  private readonly STEP_THICKNESS = 0.4;
  private readonly STEP_DEPTH = 10.0; 
  private readonly LANE_WIDTH = 16;
  private readonly PLATFORM_COLOR = 0x66bb6a;
  private readonly VISION_RANGE = 12.0;

  // Runtime Physics
  private ballVelocityY: number = 0;
  private ballVelocityX: number = 0;
  private forwardSpeed: number = 0.15; 
  private lateralSensitivity: number = 0.05;
  private lastSafePosition: THREE.Vector3 = new THREE.Vector3(0, 2, 0);
  private respawnInvulnerability: number = 0;

  // Procedural Data
  private steps: THREE.Mesh[] = [];
  private nextStepZ: number = 0;
  private baseStepSpacing: number = 4;

  constructor(options: GameOptions) {
    this.options = options;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.audio = new AudioManager();
    this.particles = new ParticleSystem(this.scene);
    
    // Setup Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0x000000, 0);
    options.container.appendChild(this.renderer.domElement);

    // Setup Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 8, 12);
    this.camera.lookAt(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    this.scene.add(sun);

    // Ball
    const ballGeo = new THREE.SphereGeometry(this.BASE_BALL_RADIUS, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({ 
      color: this.ballColor, 
      roughness: 0.1, 
      metalness: 0.2,
      transparent: true 
    });
    this.ball = new THREE.Mesh(ballGeo, ballMat);
    this.ball.castShadow = true;
    this.scene.add(this.ball);

    // Platform Group
    this.stepsGroup = new THREE.Group();
    this.scene.add(this.stepsGroup);

    window.addEventListener('resize', this.onWindowResize);
    this.animate();
  }

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private createTree() {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.2, 1, 8),
      new THREE.MeshStandardMaterial({ color: 0x5d4037 })
    );
    trunk.position.y = 0.5;
    group.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 1.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x2e7d32 })
    );
    leaves.position.y = 1.5;
    group.add(leaves);

    group.scale.setScalar(0.8 + Math.random() * 1.5);
    return group;
  }

  private createAnimal(type: 'fox' | 'wolf' | 'bear') {
    const group = new THREE.Group();
    let color = 0xffbe76; 
    let baseScale = 1.0;

    if (type === 'wolf') color = 0xdcdde1;
    if (type === 'bear') { color = 0xe67e22; baseScale = 1.4; }

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 1.2), new THREE.MeshStandardMaterial({ color }));
    body.position.y = 0.5;
    group.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshStandardMaterial({ color }));
    head.position.set(0, 0.9, -0.6);
    group.add(head);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.5), new THREE.MeshStandardMaterial({ color }));
    tail.position.set(0, 0.6, 0.8);
    group.add(tail);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.2, 1.4, 32),
      new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    group.add(ring);

    group.scale.setScalar(baseScale);
    group.userData.baseScale = baseScale;
    group.userData.startleTime = 0;
    
    return group;
  }

  private createStep(z: number) {
    const isFirst = z === 0;
    let baseWidth = 10;
    const hazardThreshold = 0.7; 
    const isDanger = !isFirst && Math.random() > hazardThreshold;
    
    let hazards = 0;
    if (isDanger) {
      hazards = 1 + (Math.random() > 0.8 ? 1 : 0);
      if (hazards > 1) baseWidth *= 1.3;
    }
    
    const width = Math.min(this.LANE_WIDTH + 4, baseWidth);
    const geo = new THREE.BoxGeometry(width, this.STEP_THICKNESS, this.STEP_DEPTH);
    const mat = new THREE.MeshStandardMaterial({ color: this.PLATFORM_COLOR });
    const step = new THREE.Mesh(geo, mat);
    step.receiveShadow = true;
    
    const xRange = Math.max(0, this.LANE_WIDTH - width);
    const xPos = isFirst ? 0 : (Math.random() - 0.5) * xRange;
    step.position.set(xPos, 0, -z);

    // Hazards
    if (isDanger) {
      for (let i = 0; i < hazards; i++) {
        const types: ('fox' | 'wolf' | 'bear')[] = ['fox', 'wolf', 'bear'];
        const animal = this.createAnimal(types[Math.floor(Math.random() * types.length)]);
        animal.name = 'spike';
        const hX = (Math.random() - 0.5) * (width - 2.5);
        const hZ = (Math.random() - 0.5) * (this.STEP_DEPTH - 2);
        animal.position.set(hX, 0.1, hZ);
        animal.userData = {
          ...animal.userData,
          patrolRange: (width - 2.5) / 2,
          patrolSpeed: 0.5 + Math.random() * 0.5,
          patrolOffset: Math.random() * Math.PI * 2
        };
        step.add(animal);
      }
    }

    // Side platforms & trees
    const sideOffset = 12;
    const sideGeo = new THREE.BoxGeometry(6, this.STEP_THICKNESS, this.STEP_DEPTH);
    const leftSide = new THREE.Mesh(sideGeo, mat);
    leftSide.position.set(-sideOffset - xPos, 0, 0);
    step.add(leftSide);
    leftSide.add(this.createTree());

    const rightSide = new THREE.Mesh(sideGeo, mat);
    rightSide.position.set(sideOffset - xPos, 0, 0);
    step.add(rightSide);
    rightSide.add(this.createTree());

    // Jumper Animal
    let jumper: JumperAnimal | null = null;
    if (!isFirst && Math.random() < 0.20) {
      const animal = this.createAnimal('fox');
      animal.name = 'jumper';
      const dir = Math.random() > 0.5 ? 1 : -1;
      const startX = dir * sideOffset;
      animal.position.set(startX - xPos, 0.1, 0);
      animal.rotation.y = dir > 0 ? -Math.PI / 2 : Math.PI / 2;
      step.add(animal);
      jumper = { mesh: animal, startX: startX - xPos, direction: -dir, isJumping: false, jumpProgress: 0 };
    }

    step.userData = { isDanger, z, jumper };
    this.stepsGroup.add(step);
    this.steps.push(step);
  }

  private updateRhythm() {
    const airTime = 2 * this.bounceStrength / -this.gravity;
    this.baseStepSpacing = this.forwardSpeed * airTime;
  }

  public startGame(skin: SkinConfig) {
    this.ballColor = skin.color;
    this.gravity = skin.gravity;
    this.bounceStrength = skin.bounceStrength;
    this.ballScale = skin.scale;
    this.forwardSpeed = 0.15; 
    
    (this.ball.material as THREE.MeshStandardMaterial).color.setHex(this.ballColor);
    this.ball.scale.setScalar(this.ballScale);
    (this.ball.material as THREE.MeshStandardMaterial).opacity = 1;

    this.gameState = 'PLAYING';
    this.options.onGameStateChange(this.gameState);
    
    this.score = 0;
    this.options.onScoreUpdate(0);
    this.lives = 3;
    this.options.onLivesUpdate(3);
    
    // Clear & Init Steps
    while(this.stepsGroup.children.length > 0) this.stepsGroup.remove(this.stepsGroup.children[0]);
    this.steps = [];
    this.nextStepZ = 0;
    this.updateRhythm();

    for (let i = 0; i < 15; i++) {
      this.createStep(this.nextStepZ);
      this.nextStepZ += this.baseStepSpacing;
    }

    this.ball.position.set(0, 2, 0);
    this.ballVelocityY = this.bounceStrength;
    this.ballVelocityX = 0;
    this.respawnInvulnerability = 0;
    this.lastSafePosition.copy(this.ball.position);
    this.lastBouncedStepId = null;
    
    this.particles.clear();
    this.audio.startMusic();
  }

  public moveBall(delta: number) {
    if (this.gameState === 'PLAYING') {
      this.ballVelocityX += delta * this.lateralSensitivity;
    }
  }

  private animate = () => {
    const dt = this.clock.getDelta();
    requestAnimationFrame(this.animate);
    
    if (this.gameState === 'PLAYING') {
      this.updatePhysics(dt);
      this.manageSteps();
    }
    
    this.particles.update(dt);
    this.updateCamera();
    this.renderer.render(this.scene, this.camera);
  };

  private manageSteps() {
    if (Math.abs(this.ball.position.z) + 100 > this.nextStepZ) {
      this.createStep(this.nextStepZ);
      this.nextStepZ += this.baseStepSpacing;
    }

    if (this.steps.length > 40) {
      const first = this.steps[0];
      if (first.position.z > this.ball.position.z + 50) {
        this.stepsGroup.remove(first);
        this.steps.shift();
      }
    }
  }

  private updatePhysics(dt: number) {
    if (this.respawnInvulnerability > 0) {
      this.respawnInvulnerability -= dt;
      (this.ball.material as THREE.MeshStandardMaterial).opacity = 0.5 + Math.sin(this.clock.elapsedTime * 20) * 0.2;
      if (this.respawnInvulnerability <= 0) (this.ball.material as THREE.MeshStandardMaterial).opacity = 1;
    }

    const prevY = this.ball.position.y;
    const ballRadius = this.BASE_BALL_RADIUS * this.ballScale;

    // Move Ball
    this.ball.position.z -= this.forwardSpeed;
    this.ball.position.x += this.ballVelocityX;
    this.ballVelocityX *= 0.85;

    this.ballVelocityY += this.gravity;
    this.ball.position.y += this.ballVelocityY;

    // Bounds check
    if (Math.abs(this.ball.position.x) > this.LANE_WIDTH / 2 + 3) {
      this.loseLife();
      return;
    }

    const time = this.clock.getElapsedTime();

    for (const step of this.steps) {
      const width = (step.geometry as THREE.BoxGeometry).parameters.width;
      const targetY = step.position.y + this.STEP_THICKNESS / 2 + ballRadius;

      const dx = Math.abs(this.ball.position.x - step.position.x);
      const dz = Math.abs(this.ball.position.z - step.position.z);
      
      const isOver = dx < width / 2 + ballRadius * 0.7 && dz < this.STEP_DEPTH / 2 + 1.0;

      if (isOver && this.ballVelocityY < 0) {
        const collisionBuffer = Math.abs(this.ballVelocityY) + 0.2;
        const crossedPlane = prevY >= targetY && this.ball.position.y <= targetY + collisionBuffer;
        const slightlyInside = this.ball.position.y < targetY && this.ball.position.y > targetY - 1.5;

        if (crossedPlane || slightlyInside) {
          this.handleBounce(step, targetY);
          return;
        }
      }

      // Hazards Update & Collision
      for (const child of step.children) {
        if (child.name === 'spike' || child.name === 'jumper') {
          const worldX = step.position.x + child.position.x;
          const worldZ = step.position.z + child.position.z;
          const distToBallSq = Math.pow(this.ball.position.x - worldX, 2) + Math.pow(this.ball.position.z - worldZ, 2);
          const isBallClose = distToBallSq < Math.pow(this.VISION_RANGE, 2);

          // Vision/Look-at Logic
          if (isBallClose) {
            const angle = Math.atan2(this.ball.position.x - worldX, this.ball.position.z - worldZ);
            child.rotation.y = angle + Math.PI; // Face the ball
          }

          // Smash Startle Animation
          if (child.userData.startleTime > 0) {
            child.userData.startleTime -= dt;
            const progress = child.userData.startleTime / 0.5; // duration is 0.5s
            const squash = 1 + Math.sin(progress * Math.PI * 4) * 0.3 * progress;
            child.scale.set(
              child.userData.baseScale * (2 - squash),
              child.userData.baseScale * squash,
              child.userData.baseScale * (2 - squash)
            );
            child.position.y = Math.max(0.1, 0.1 + Math.sin(progress * Math.PI) * 0.5);
          } else {
            child.scale.setScalar(child.userData.baseScale);
          }

          if (this.respawnInvulnerability <= 0) {
            // Collision Logic
            if (child.name === 'spike') {
              const dist = Math.sqrt(distToBallSq);
              if (dist < 1.3 * child.scale.x) {
                this.loseLife();
                return;
              }
            }
          }
        }

        if (child.name === 'spike') {
          const { patrolRange, patrolSpeed, patrolOffset } = child.userData;
          const pX = Math.sin(time * patrolSpeed + patrolOffset) * patrolRange;
          const prevPX = child.position.x;
          child.position.x = pX;
          
          // Only use patrol rotation if ball is NOT close
          const worldX = step.position.x + child.position.x;
          const worldZ = step.position.z + child.position.z;
          const distToBallSq = Math.pow(this.ball.position.x - worldX, 2) + Math.pow(this.ball.position.z - worldZ, 2);
          if (distToBallSq >= Math.pow(this.VISION_RANGE, 2)) {
            child.rotation.y = pX > prevPX ? -Math.PI / 2 : Math.PI / 2;
          }
        }
      }

      // Jumper specific update
      const jumper = step.userData.jumper as JumperAnimal | null;
      if (jumper) {
        if (!jumper.isJumping && Math.abs(this.ball.position.z - step.position.z) < 20) jumper.isJumping = true;
        if (jumper.isJumping && jumper.jumpProgress < 1) {
          const prevJumperX = jumper.mesh.position.x;
          jumper.jumpProgress += dt * 0.7;
          const totalDist = 24;
          jumper.mesh.position.x = jumper.startX + jumper.direction * totalDist * jumper.jumpProgress;
          
          if (jumper.mesh.userData.startleTime <= 0) {
            jumper.mesh.position.y = Math.abs(Math.sin(jumper.jumpProgress * Math.PI * 2)) * 2 + 0.1;
          }

          // Rotation logic for jumper
          const worldX = step.position.x + jumper.mesh.position.x;
          const worldZ = step.position.z + jumper.mesh.position.z;
          const distToBallSq = Math.pow(this.ball.position.x - worldX, 2) + Math.pow(this.ball.position.z - worldZ, 2);
          if (distToBallSq >= Math.pow(this.VISION_RANGE, 2)) {
            jumper.mesh.rotation.y = jumper.mesh.position.x > prevJumperX ? -Math.PI / 2 : Math.PI / 2;
          } else {
            const angle = Math.atan2(this.ball.position.x - worldX, this.ball.position.z - worldZ);
            jumper.mesh.rotation.y = angle + Math.PI;
          }
        }
        
        if (this.respawnInvulnerability <= 0) {
          const jWorldX = step.position.x + jumper.mesh.position.x;
          const jWorldY = step.position.y + jumper.mesh.position.y;
          const jWorldZ = step.position.z + jumper.mesh.position.z;
          const dSq = Math.pow(this.ball.position.x - jWorldX, 2) + Math.pow(this.ball.position.y - jWorldY, 2) + Math.pow(this.ball.position.z - jWorldZ, 2);
          if (dSq < Math.pow(1.5 + ballRadius, 2)) {
            this.loseLife();
            return;
          }
        }
      }
    }

    if (this.ball.position.y < -15) this.loseLife();
  }

  private handleBounce(step: THREE.Mesh, landingY: number) {
    this.ball.position.y = landingY;
    this.ballVelocityY = this.bounceStrength;
    this.lastSafePosition.copy(this.ball.position);
    this.audio.playBounce();
    
    // Startle enemies on this platform
    step.children.forEach(child => {
      if (child.name === 'spike' || child.name === 'jumper') {
        child.userData.startleTime = 0.5;
      }
    });

    if (this.lastBouncedStepId !== step.uuid) {
      this.lastBouncedStepId = step.uuid;
      this.platformsSinceLastLife++;
      if (this.platformsSinceLastLife >= 10 && this.lives < 5) {
        this.lives++;
        this.options.onLivesUpdate(this.lives);
        this.audio.playWin();
        this.platformsSinceLastLife = 0;
      }
      this.score = Math.max(this.score, Math.floor(Math.abs(this.ball.position.z)));
      this.options.onScoreUpdate(this.score);
    }
  }

  private loseLife() {
    if (this.respawnInvulnerability > 0 || this.gameState !== 'PLAYING') return;
    this.lives--;
    this.options.onLivesUpdate(this.lives);
    this.particles.emit(this.ball.position, 0xff0000, 40, 0.5);
    
    if (this.lives <= 0) {
      this.gameState = 'GAMEOVER';
      this.options.onGameStateChange(this.gameState);
      this.audio.playGameOver();
      this.audio.stopMusic();
    } else {
      this.audio.playGameOver();
      this.ball.position.copy(this.lastSafePosition);
      this.ballVelocityY = this.bounceStrength;
      this.ballVelocityX = 0;
      this.respawnInvulnerability = 2.0;
    }
  }

  private updateCamera() {
    const targetX = this.ball.position.x * 0.5;
    const targetY = Math.max(4, this.ball.position.y + 6);
    const targetZ = this.ball.position.z + 12;
    this.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.1);
    this.camera.lookAt(this.ball.position.x, this.ball.position.y, this.ball.position.z - 5);
  }

  public setMuted(muted: boolean) { this.audio.setMuted(muted); }
  public toggleMute() { return this.audio.toggleMute(); }
  public dispose() {
    this.audio.stopMusic();
    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize);
  }
}
