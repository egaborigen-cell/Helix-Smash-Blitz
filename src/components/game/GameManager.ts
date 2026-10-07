import * as THREE from 'three';
import { AudioManager } from './AudioManager';
import { ParticleSystem } from './ParticleSystem';

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
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private stepsGroup: THREE.Group;
  private ball: THREE.Mesh;
  private clock: THREE.Clock;
  private audio: AudioManager;
  private particles: ParticleSystem;

  private score: number = 0;
  private lives: number = 3;
  private platformsSinceLastLife: number = 0;
  private lastBouncedStepId: string | null = null;
  private gameState: GameState = 'START';
  private difficulty: Difficulty = 'EASY';
  private options: GameOptions;
  
  private ballColor: number = 0xff4500; // Default Orange-Red Toy color
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
  private platformColor: number = 0x66bb6a; // Green grass color

  private lastSafePosition: THREE.Vector3 = new THREE.Vector3(0, 2, 0);
  private respawnInvulnerability: number = 0;

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
    const ballMat = new THREE.MeshStandardMaterial({ 
      color: this.ballColor, 
      roughness: 0.2, 
      metalness: 0.1,
      transparent: true 
    });
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

  private createTreeModel() {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });

    // Random height factor for variety
    const heightFactor = 1.8 + Math.random() * 2.5;
    
    const trunkHeight = 0.8 * heightFactor;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, trunkHeight, 8), trunkMat);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    group.add(trunk);

    const leavesHeight = 1.2 * heightFactor;
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.5 * (1 + heightFactor * 0.1), leavesHeight, 8), leavesMat);
    leaves.position.y = trunkHeight + (leavesHeight / 2);
    leaves.castShadow = true;
    group.add(leaves);

    return group;
  }

  private createAnimalModel(type: 'fox' | 'wolf' | 'bear') {
    const group = new THREE.Group();
    let color = 0xd1d8e0; // Light Grey (Wolf)
    let accentColor = 0xffffff;
    let scale = 1.0;

    if (type === 'fox') {
      color = 0xffa45c; // Light Orange
      accentColor = 0xffffff;
    } else if (type === 'wolf') {
      color = 0xe0e0e0; // Silver/Light Grey
      accentColor = 0x333333;
    } else if (type === 'bear') {
      color = 0xad8b73; // Light Cinnamon Brown
      accentColor = 0x5d4037;
      scale = 1.35;
    }
    
    const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 });
    const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.7 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 1.2), bodyMat);
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), bodyMat);
    head.position.set(0, 0.9, -0.6);
    head.castShadow = true;
    group.add(head);

    // Snout
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.4), type === 'fox' ? accentMat : bodyMat);
    snout.position.set(0, 0.8, -0.95);
    group.add(snout);

    // Ears
    const earGeo = new THREE.ConeGeometry(0.15, 0.35, 4);
    const earL = new THREE.Mesh(earGeo, bodyMat);
    earL.position.set(-0.25, 1.25, -0.6);
    group.add(earL);

    const earR = new THREE.Mesh(earGeo, bodyMat);
    earR.position.set(0.25, 1.25, -0.6);
    group.add(earR);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const eyeL = new THREE.Mesh(eyeGeo, type === 'wolf' ? new THREE.MeshBasicMaterial({ color: 0xff3333 }) : eyeMat);
    eyeL.position.set(-0.18, 0.95, -0.85);
    group.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, type === 'wolf' ? new THREE.MeshBasicMaterial({ color: 0xff3333 }) : eyeMat);
    eyeR.position.set(0.18, 0.95, -0.85);
    group.add(eyeR);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.18, 0.4, 0.18);
    const legPositions = [
        [-0.25, 0.2, -0.4], [0.25, 0.2, -0.4],
        [-0.25, 0.2, 0.4], [0.25, 0.2, 0.4]
    ];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, bodyMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        group.add(leg);
    });

    // Tail
    const tail = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.5), 
        type === 'fox' ? accentMat : bodyMat
    );
    tail.position.set(0, 0.6, 0.7);
    tail.rotation.x = 0.2;
    group.add(tail);

    // Hazard Ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      transparent: true, 
      opacity: 0.6, 
      side: THREE.DoubleSide 
    });
    const hazardRing = new THREE.Mesh(ringGeo, ringMat);
    hazardRing.rotation.x = -Math.PI / 2;
    hazardRing.position.y = 0.02;
    group.add(hazardRing);

    group.scale.setScalar(scale);
    return group;
  }

  private createStep(z: number) {
    const progressFactor = Math.min(this.score / 500, 1);
    
    // Determine the number of predators first to adjust platform width
    const isDanger = this.difficulty === 'PRACTICE' ? false : (z < 20 ? false : (Math.random() > (0.8 - progressFactor * 0.2)));
    let numHazards = 0;
    if (isDanger) {
      numHazards = 1;
      if (z > 150) numHazards = 1 + Math.floor(Math.random() * 2);
      if (z > 400) numHazards = 2 + Math.floor(Math.random() * 2);
    }

    let baseWidth = this.difficulty === 'INSANE' ? 6.0 : this.difficulty === 'HARD' ? 8.5 : 11.0;
    
    // Dynamically increase width for platforms with more predators to keep them fair
    if (numHazards === 2) baseWidth *= 1.35;
    if (numHazards >= 3) baseWidth *= 1.7;

    const startWidthMultiplier = Math.max(1, 2.5 - (z / 60) * 1.5);
    const width = Math.min(this.laneWidth + 8, baseWidth * startWidthMultiplier);
    
    const geo = new THREE.BoxGeometry(width, this.stepThickness, this.stepDepth);
    const mat = new THREE.MeshStandardMaterial({ color: this.platformColor, roughness: 0.5 });
    
    const step = new THREE.Mesh(geo, mat);
    step.receiveShadow = true;
    
    const range = Math.max(0, this.laneWidth - width);
    const xPos = z === 0 ? 0 : (Math.random() - 0.5) * range;
    step.position.set(xPos, 0, -z);

    // Add Static Hazards
    if (isDanger) {
      for (let i = 0; i < numHazards; i++) {
        const types: ('fox' | 'wolf' | 'bear')[] = ['fox', 'wolf', 'bear'];
        const animalType = types[Math.floor(Math.random() * types.length)];
        const animalGroup = this.createAnimalModel(animalType);
        animalGroup.name = 'spike'; 

        const randomX = (Math.random() - 0.5) * (width - 2.5);
        const randomZ = (Math.random() - 0.5) * 1.2;
        animalGroup.position.set(randomX, 0.1, randomZ);
        animalGroup.rotation.y = Math.random() * Math.PI;

        // Initialize patrol data
        animalGroup.userData = {
          patrolRange: (width - 2.5) / 2,
          patrolSpeed: 0.6 + Math.random() * 0.8,
          patrolOffset: Math.random() * Math.PI * 2
        };

        step.add(animalGroup);
      }
    }

    // Dynamic Hazards (Jumping Animals)
    const sideOffset = 18;
    const hasJumper = this.difficulty !== 'PRACTICE' && z > 40 && Math.random() < (0.2 + progressFactor * 0.3);
    let jumper: JumperAnimal | null = null;

    if (hasJumper) {
      const types: ('fox' | 'wolf' | 'bear')[] = ['fox', 'wolf', 'bear'];
      const animalType = types[Math.floor(Math.random() * types.length)];
      const animalGroup = this.createAnimalModel(animalType);
      animalGroup.name = 'jumper';
      
      const dir = Math.random() > 0.5 ? 1 : -1;
      const startX = dir * sideOffset;
      animalGroup.position.set(startX - xPos, 0.1, 0);
      animalGroup.rotation.y = dir > 0 ? -Math.PI / 2 : Math.PI / 2;
      step.add(animalGroup);

      jumper = {
        mesh: animalGroup,
        startX: startX - xPos,
        direction: -dir,
        isJumping: false,
        jumpProgress: 0
      };
    }
    
    // Decorative forest environment
    const sideWidth = 6;
    const sideGeo = new THREE.BoxGeometry(sideWidth, this.stepThickness, this.stepDepth);
    const sideMat = new THREE.MeshStandardMaterial({ color: this.platformColor, roughness: 0.9 });
    
    const leftSide = new THREE.Mesh(sideGeo, sideMat);
    leftSide.position.set(-sideOffset - xPos, 0, 0);
    leftSide.receiveShadow = true;
    step.add(leftSide);

    const treeL = this.createTreeModel();
    treeL.position.y = this.stepThickness / 2;
    leftSide.add(treeL);

    const rightSide = new THREE.Mesh(sideGeo, sideMat);
    rightSide.position.set(sideOffset - xPos, 0, 0);
    rightSide.receiveShadow = true;
    step.add(rightSide);
    
    const treeR = this.createTreeModel();
    treeR.position.y = this.stepThickness / 2;
    rightSide.add(treeR);

    step.userData = { isDanger, z, jumper };
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
    this.forwardSpeed = (speeds as any)[difficulty] || 0.18;
    
    const bounceTime = 2 * this.bounceStrength / -this.gravity;
    this.baseStepSpacing = this.forwardSpeed * bounceTime;
    
    (this.ball.material as THREE.MeshStandardMaterial).color.setHex(this.ballColor);
    this.ball.scale.setScalar(this.ballScale);
    (this.ball.material as THREE.MeshStandardMaterial).opacity = 1.0;

    this.gameState = 'PLAYING';
    this.options.onGameStateChange(this.gameState);
    
    this.score = 0;
    this.options.onScoreUpdate(this.score);
    
    this.lives = 3;
    this.platformsSinceLastLife = 0;
    this.lastBouncedStepId = null;
    this.options.onLivesUpdate(this.lives);
    this.respawnInvulnerability = 0;
    
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
    this.lastSafePosition.copy(this.ball.position);
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
      this.updatePhysics(delta);
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

    if (this.steps.length > 50) {
        const first = this.steps[0];
        const threshold = Math.max(this.ball.position.z, this.lastSafePosition.z) + 30;
        if (first.position.z > threshold) {
            this.stepsGroup.remove(first);
            this.steps.shift();
        }
    }
  }

  private updatePhysics(delta: number) {
    if (this.respawnInvulnerability > 0) {
      this.respawnInvulnerability -= delta;
      (this.ball.material as THREE.MeshStandardMaterial).opacity = 0.5 + Math.sin(this.clock.elapsedTime * 20) * 0.2;
      if (this.respawnInvulnerability <= 0) {
        (this.ball.material as THREE.MeshStandardMaterial).opacity = 1.0;
      }
    }

    this.ball.position.z -= this.forwardSpeed;
    this.ball.position.x += this.ballVelocityX;
    this.ballVelocityX *= 0.85;
    
    if (Math.abs(this.ball.position.x) > this.laneWidth / 2 + 3.0) {
        this.loseLife();
        return;
    }

    this.ballVelocityY += this.gravity;
    this.ball.position.y += this.ballVelocityY;

    const currentBallRadius = this.baseBallRadius * this.ballScale;
    const time = this.clock.getElapsedTime();

    for (const step of this.steps) {
        // Update patrolling animals
        for (const child of step.children) {
          if (child.name === 'spike' && child.userData.patrolRange) {
            const { patrolRange, patrolSpeed, patrolOffset } = child.userData;
            const prevX = child.position.x;
            const newX = Math.sin(time * patrolSpeed + patrolOffset) * patrolRange;
            child.position.x = newX;
            // Face the direction of movement
            child.rotation.y = (newX > prevX ? -Math.PI / 2 : Math.PI / 2);
          }
        }

        const jumper = step.userData.jumper as JumperAnimal | null;
        if (jumper) {
          const distToJumperZ = Math.abs(this.ball.position.z - step.position.z);
          // Trigger jump
          if (!jumper.isJumping && distToJumperZ < 25) {
            jumper.isJumping = true;
          }

          if (jumper.isJumping && jumper.jumpProgress < 1) {
            jumper.jumpProgress += delta * 0.8; 
            const totalDistance = 36; // sideOffset * 2
            const targetX = jumper.startX + jumper.direction * totalDistance * jumper.jumpProgress;
            jumper.mesh.position.x = targetX;
            jumper.mesh.position.y = Math.sin(jumper.jumpProgress * Math.PI) * 1.5 + 0.1;
          }

          // Collision with jumper
          if (this.respawnInvulnerability <= 0) {
            const animalScale = jumper.mesh.scale.x;
            const hazardRadius = 1.3 * animalScale;
            const animalGlobalX = step.position.x + jumper.mesh.position.x;
            const animalGlobalY = step.position.y + jumper.mesh.position.y;
            const animalGlobalZ = step.position.z + jumper.mesh.position.z;

            const distSq = Math.pow(this.ball.position.x - animalGlobalX, 2) + 
                         Math.pow(this.ball.position.y - animalGlobalY, 2) + 
                         Math.pow(this.ball.position.z - animalGlobalZ, 2);
            
            const collisionThreshold = Math.pow(hazardRadius + (currentBallRadius * 0.6), 2);
            if (distSq < collisionThreshold) {
              this.loseLife();
              return;
            }
          }
        }

        // Static Hazards collision
        if (this.respawnInvulnerability <= 0) {
          const dz = Math.abs(this.ball.position.z - step.position.z);
          const dy = this.ball.position.y - step.position.y;

          if (step.userData.isDanger && dz < this.stepDepth / 2 + 0.5 && dy < 1.8 && dy > -0.8) {
              const hazardRadius = 1.3; 
              for (const child of step.children) {
                  if (child.name === 'spike') {
                      const animalScale = child.scale.x;
                      const spikeGlobalX = step.position.x + child.position.x;
                      const spikeGlobalZ = step.position.z + child.position.z;
                      
                      const distSq = Math.pow(this.ball.position.x - spikeGlobalX, 2) + Math.pow(this.ball.position.z - spikeGlobalZ, 2);
                      const collisionThreshold = Math.pow((hazardRadius * animalScale) + (currentBallRadius * 0.4), 2);

                      if (distSq < collisionThreshold) {
                          this.loseLife();
                          return; 
                      }
                  }
              }
          }
        }
    }

    // Platform landing
    for (const step of this.steps) {
        const dx = Math.abs(this.ball.position.x - step.position.x);
        const dz = Math.abs(this.ball.position.z - step.position.z);
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
        this.loseLife();
        return;
    }
  }

  private performBounce(step: THREE.Mesh, landingY: number) {
    this.ballVelocityY = this.bounceStrength;
    this.ball.position.y = landingY;
    
    // Check if it's a new platform for life-gain progress
    if (this.lastBouncedStepId !== step.uuid) {
      this.lastBouncedStepId = step.uuid;
      this.platformsSinceLastLife++;
      
      // Earn a life every 10 new platforms (capped at 5 for balance)
      if (this.platformsSinceLastLife >= 10) {
        if (this.lives < 5) {
          this.lives++;
          this.options.onLivesUpdate(this.lives);
          this.audio.playWin(); 
        }
        this.platformsSinceLastLife = 0;
      }
    }

    this.lastSafePosition.set(step.position.x, landingY, step.position.z);
    
    this.audio.playBounce();
    this.particles.emit(this.ball.position, this.platformColor, 15, 0.2);
    
    const newScore = Math.floor(Math.abs(this.ball.position.z));
    if (newScore > this.score) {
        this.score = newScore;
        this.options.onScoreUpdate(this.score);
    }
  }

  private loseLife() {
    if (this.gameState !== 'PLAYING' || this.respawnInvulnerability > 0) return;
    
    this.lives--;
    this.platformsSinceLastLife = 0; 
    this.options.onLivesUpdate(this.lives);
    this.particles.emit(this.ball.position, 0xff0000, 50, 0.6);

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.audio.playGameOver(); 
      this.ball.position.copy(this.lastSafePosition);
      this.ballVelocityY = this.bounceStrength; 
      this.ballVelocityX = 0;
      this.respawnInvulnerability = 2.0; 
      this.particles.emit(this.ball.position, this.ballColor, 20, 0.3);
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
