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
    this.geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  }

  public emit(position: THREE.Vector3, color: number, count: number = 10, speed: number = 0.1) {
    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(this.geometry, material);
      
      mesh.position.copy(position);
      
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed + 0.05,
        (Math.random() - 0.5) * speed
      );

      const life = 0.5 + Math.random() * 0.5;
      
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
      p.velocity.y -= 0.005; // Gravity on particles
      
      const opacity = p.life / p.maxLife;
      (p.mesh.material as THREE.MeshStandardMaterial).opacity = opacity;
      p.mesh.scale.setScalar(opacity);
      p.mesh.rotation.x += 0.1;
      p.mesh.rotation.y += 0.1;
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
