import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private group: THREE.Group;
  private geometry: THREE.BoxGeometry;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
  }

  public emit(position: THREE.Vector3, color: number, count: number = 15, speed: number = 0.2) {
    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 1,
        emissive: color,
        emissiveIntensity: 0.5,
      });
      const mesh = new THREE.Mesh(this.geometry, material);
      
      mesh.position.copy(position);
      
      // Randomize velocity for a more natural explosion
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * speed;

      const velocity = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.abs(Math.sin(phi) * Math.sin(theta)) + speed * 0.5, // Bias upwards
        r * Math.cos(phi)
      );

      const life = 0.6 + Math.random() * 0.6;
      
      this.particles.push({
        mesh,
        velocity,
        life,
        maxLife: life
      });

      this.group.add(mesh);
    }
  }

  public update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.group.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
        continue;
      }

      p.mesh.position.add(p.velocity);
      p.velocity.y -= 0.01; // Gravity on particles
      p.velocity.multiplyScalar(0.98); // Air resistance
      
      const opacity = p.life / p.maxLife;
      (p.mesh.material as THREE.MeshStandardMaterial).opacity = opacity;
      p.mesh.scale.setScalar(opacity);
      p.mesh.rotation.x += 0.2;
      p.mesh.rotation.y += 0.2;
    }
  }

  public clear() {
    this.particles.forEach(p => {
      this.group.remove(p.mesh);
      (p.mesh.material as THREE.Material).dispose();
    });
    this.particles = [];
  }
}
