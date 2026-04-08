
import * as THREE from 'three';

export type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'WON';

interface GameOptions {
  onScoreUpdate: (score: number) => void;
  onGameStateChange: (state: GameState) => void;
  container: HTMLDivElement;
}

export class GameManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private towerGroup: THREE.Group;
  private ball: THREE.Mesh;
  private clock: THREE.Clock;

  private score: number = 0;
  private gameState: GameState = 'START';
  private options: GameOptions;

  // Ball physics
  private ballVelocityY: number = 0;
  private gravity: number = -0.015;
  private bounceStrength: number = 0.3;
  private currentLevelIndex: number = 0;
  private towerRotation: number = 0;
  private targetTowerRotation: number = 0;

  // Configuration
  private platformGap: number = 4;
  private numLevels: number = 20;
  private platformRadius: number = 2.5;
  private platformThickness: number = 0.3;

  constructor(options: GameOptions) {
    this.options = options;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbe0d1);
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    options.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.towerGroup = new THREE.Group();
    this.scene.add(this.towerGroup);

    // Initial Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Create Ball
    const ballGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xb8f53d, roughness: 0.3 });
    this.ball = new THREE.Mesh(ballGeo, ballMat);
    this.ball.castShadow = true;
    this.ball.position.set(0, 2, 2);
    this.scene.add(this.ball);

    this.createTower();
    this.animate();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private createTower() {
    // Center Pole
    const poleGeo = new THREE.CylinderGeometry(0.8, 0.8, this.numLevels * this.platformGap + 10, 32);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x999999 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.receiveShadow = true;
    this.towerGroup.add(pole);

    // Platforms
    for (let i = 0; i < this.numLevels; i++) {
      const levelGroup = new THREE.Group();
      levelGroup.position.y = -i * this.platformGap;
      this.towerGroup.add(levelGroup);

      // Procedural platform pieces (12 segments of 30 degrees)
      const numSegments = 12;
      const segmentAngle = (Math.PI * 2) / numSegments;
      
      // Randomly decide gaps
      const gapIndices = new Set<number>();
      const numGaps = i === 0 ? 1 : Math.floor(Math.random() * 3) + 2; 
      while (gapIndices.size < numGaps) {
        gapIndices.add(Math.floor(Math.random() * numSegments));
      }

      // Randomly add a danger zone
      const dangerIndex = i > 2 ? Math.floor(Math.random() * numSegments) : -1;

      for (let j = 0; j < numSegments; j++) {
        if (gapIndices.has(j)) continue;

        const isDanger = j === dangerIndex;
        const geo = new THREE.CylinderGeometry(
          this.platformRadius, 
          this.platformRadius, 
          this.platformThickness, 
          32, 1, false, 
          j * segmentAngle, 
          segmentAngle
        );
        const mat = new THREE.MeshStandardMaterial({ 
          color: isDanger ? 0xff4444 : 0xf2cc0d,
          roughness: 0.5 
        });
        const segment = new THREE.Mesh(geo, mat);
        segment.receiveShadow = true;
        segment.userData = { isDanger, level: i };
        levelGroup.add(segment);
      }
    }

    // Finish Platform
    const finishGeo = new THREE.CylinderGeometry(this.platformRadius + 1, this.platformRadius + 1, 0.5, 32);
    const finishMat = new THREE.MeshStandardMaterial({ color: 0xb8f53d });
    const finish = new THREE.Mesh(finishGeo, finishMat);
    finish.position.y = -this.numLevels * this.platformGap;
    this.towerGroup.add(finish);
  }

  public startGame() {
    this.gameState = 'PLAYING';
    this.options.onGameStateChange(this.gameState);
    this.score = 0;
    this.options.onScoreUpdate(this.score);
    this.resetBall();
    this.towerGroup.rotation.y = 0;
    this.targetTowerRotation = 0;
  }

  private resetBall() {
    this.ball.position.set(0, 2, 2);
    this.ballVelocityY = 0;
    this.currentLevelIndex = 0;
  }

  public rotateTower(delta: number) {
    if (this.gameState !== 'PLAYING') return;
    this.targetTowerRotation += delta * 0.01;
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    
    if (this.gameState === 'PLAYING') {
      this.updatePhysics();
    }

    // Smooth tower rotation
    this.towerGroup.rotation.y += (this.targetTowerRotation - this.towerGroup.rotation.y) * 0.1;

    // Camera follow ball
    const targetCamY = this.ball.position.y + 3;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, this.ball.position.y - 1, 0);

    this.renderer.render(this.scene, this.camera);
  };

  private updatePhysics() {
    this.ballVelocityY += this.gravity;
    this.ball.position.y += this.ballVelocityY;

    // Ball interaction with platforms
    // Check which level the ball is at
    const relativeBallY = this.ball.position.y;
    const towerRotation = this.towerGroup.rotation.y % (Math.PI * 2);

    // Ball is roughly at Z=2. We need to check the angle of the ball relative to tower
    // Since ball is fixed at Z=2, X=0, its angle is 0. 
    // We check the segment of the tower at angle -towerRotation
    let checkAngle = (-this.towerGroup.rotation.y) % (Math.PI * 2);
    if (checkAngle < 0) checkAngle += Math.PI * 2;

    const currentLevelY = -this.currentLevelIndex * this.platformGap;
    
    // Collision detection
    if (this.ballVelocityY < 0 && this.ball.position.y <= currentLevelY + 0.35) {
      // Check if we hit a platform or a gap
      const numSegments = 12;
      const segmentAngle = (Math.PI * 2) / numSegments;
      const segmentIdx = Math.floor(checkAngle / segmentAngle);

      const levelGroup = this.towerGroup.children[this.currentLevelIndex + 1] as THREE.Group; // +1 because of pole
      let hitSomething = false;

      if (levelGroup && levelGroup.children) {
          for (const segment of levelGroup.children) {
              const mesh = segment as THREE.Mesh;
              // Geometry parameters for CylinderGeometry are [radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength]
              const params = (mesh.geometry as any).parameters;
              const start = params.thetaStart;
              const length = params.thetaLength;
              const end = start + length;

              // Check if checkAngle is within [start, end]
              if (checkAngle >= start && checkAngle <= end) {
                  if (mesh.userData.isDanger) {
                      this.gameOver();
                  } else {
                      this.ballVelocityY = this.bounceStrength;
                      this.ball.position.y = currentLevelY + 0.36;
                      hitSomething = true;
                  }
                  break;
              }
          }
      }

      if (!hitSomething) {
          // It's a gap! Check if we passed a level
          if (this.ball.position.y < currentLevelY - 0.5) {
              this.currentLevelIndex++;
              this.score += 10;
              this.options.onScoreUpdate(this.score);

              if (this.currentLevelIndex >= this.numLevels) {
                this.gameWon();
              }
          }
      }
    }
    
    // Safety net
    if (this.ball.position.y < -(this.numLevels + 2) * this.platformGap) {
        this.gameOver();
    }
  }

  private gameOver() {
    this.gameState = 'GAMEOVER';
    this.options.onGameStateChange(this.gameState);
  }

  private gameWon() {
    this.gameState = 'WON';
    this.options.onGameStateChange(this.gameState);
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public dispose() {
    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}
