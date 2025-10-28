import * as THREE from 'three';

/**
 * Particle types for different visual effects
 */
export enum ParticleType {
  CATCH_SPARKLE = 'catch_sparkle',
  MISS_SPLASH = 'miss_splash',
  SHOOT_PUFF = 'shoot_puff',
  SCORE_POP = 'score_pop'
}

/**
 * Individual particle class
 */
class Particle {
  public mesh: THREE.Mesh;
  public velocity: THREE.Vector3;
  public life: number;
  public maxLife: number;
  public isActive: boolean = true;
  
  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    life: number
  ) {
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.velocity = velocity.clone();
    this.life = life;
    this.maxLife = life;
  }
  
  update(deltaTime: number): void {
    if (!this.isActive) return;
    
    const deltaSeconds = deltaTime / 1000;
    
    // Update position with gravity effect
    this.velocity.y -= 150 * deltaSeconds; // Gravity
    this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaSeconds));
    
    // Update life
    this.life -= deltaTime;
    
    // Calculate life ratios for different animation phases
    const lifeRatio = this.life / this.maxLife;
    const ageRatio = 1 - lifeRatio;
    
    // Enhanced opacity animation with fade-in and fade-out
    let opacity = 1;
    if (ageRatio < 0.1) {
      // Fade in during first 10% of life
      opacity = ageRatio / 0.1;
    } else if (lifeRatio < 0.3) {
      // Fade out during last 30% of life
      opacity = lifeRatio / 0.3;
    }
    
    if (this.mesh.material instanceof THREE.MeshBasicMaterial) {
      this.mesh.material.opacity = opacity;
    }
    
    // Enhanced scale animation with growth and shrink phases
    let scale = 1;
    if (ageRatio < 0.2) {
      // Grow during first 20% of life
      scale = 0.3 + (ageRatio / 0.2) * 0.7;
    } else if (lifeRatio < 0.4) {
      // Shrink during last 40% of life
      scale = 0.3 + (lifeRatio / 0.4) * 0.7;
    }
    
    this.mesh.scale.setScalar(scale);
    
    // Add rotation animation for visual interest
    this.mesh.rotation.z += deltaSeconds * 2; // 2 radians per second
    
    // Deactivate when life expires
    if (this.life <= 0) {
      this.isActive = false;
    }
  }
  
  destroy(scene: THREE.Scene): void {
    scene.remove(this.mesh);
    this.isActive = false;
  }
}

/**
 * Particle system for visual effects
 */
export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  private geometries: Map<ParticleType, THREE.BufferGeometry> = new Map();
  private materials: Map<ParticleType, THREE.Material> = new Map();
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeParticleTypes();
  }
  
  /**
   * Initialize geometries and materials for different particle types
   */
  private initializeParticleTypes(): void {
    // Sparkle particles for successful catches
    const sparkleGeometry = new THREE.PlaneGeometry(8, 8);
    const sparkleMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFD700, // Gold
      transparent: true,
      opacity: 1.0
    });
    this.geometries.set(ParticleType.CATCH_SPARKLE, sparkleGeometry);
    this.materials.set(ParticleType.CATCH_SPARKLE, sparkleMaterial);
    
    // Splash particles for misses
    const splashGeometry = new THREE.PlaneGeometry(12, 12);
    const splashMaterial = new THREE.MeshBasicMaterial({
      color: 0x8B4513, // Brown
      transparent: true,
      opacity: 1.0
    });
    this.geometries.set(ParticleType.MISS_SPLASH, splashGeometry);
    this.materials.set(ParticleType.MISS_SPLASH, splashMaterial);
    
    // Puff particles for baby shooting
    const puffGeometry = new THREE.PlaneGeometry(6, 6);
    const puffMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF, // White
      transparent: true,
      opacity: 1.0
    });
    this.geometries.set(ParticleType.SHOOT_PUFF, puffGeometry);
    this.materials.set(ParticleType.SHOOT_PUFF, puffMaterial);
    
    // Score pop particles
    const scoreGeometry = new THREE.PlaneGeometry(10, 10);
    const scoreMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FF00, // Green
      transparent: true,
      opacity: 1.0
    });
    this.geometries.set(ParticleType.SCORE_POP, scoreGeometry);
    this.materials.set(ParticleType.SCORE_POP, scoreMaterial);
  }
  
  /**
   * Create particle effect at specified position with enhanced patterns
   */
  public createEffect(
    type: ParticleType,
    position: THREE.Vector3,
    count: number = 5,
    spread: number = 50
  ): void {
    const geometry = this.geometries.get(type);
    const material = this.materials.get(type);
    
    if (!geometry || !material) {
      console.warn(`Particle type ${type} not found`);
      return;
    }
    
    // Create particles with different patterns based on type
    switch (type) {
      case ParticleType.CATCH_SPARKLE:
        this.createSparklePattern(geometry, material, position, count, spread);
        break;
      case ParticleType.MISS_SPLASH:
        this.createSplashPattern(geometry, material, position, count, spread);
        break;
      case ParticleType.SHOOT_PUFF:
        this.createPuffPattern(geometry, material, position, count, spread);
        break;
      case ParticleType.SCORE_POP:
        this.createScorePattern(geometry, material, position, count, spread);
        break;
      default:
        this.createDefaultPattern(geometry, material, position, count, spread);
    }
  }
  
  /**
   * Create sparkle pattern for successful catches
   */
  private createSparklePattern(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: THREE.Vector3,
    count: number,
    spread: number
  ): void {
    // Create particles in a radial burst pattern
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = Math.random() * spread * 0.5;
      
      const particlePos = new THREE.Vector3(
        position.x + Math.cos(angle) * radius,
        position.y + Math.sin(angle) * radius,
        position.z
      );
      
      // Velocity radiating outward with upward bias
      const velocity = new THREE.Vector3(
        Math.cos(angle) * (80 + Math.random() * 40),
        Math.sin(angle) * (60 + Math.random() * 40) + 50, // Upward bias
        0
      );
      
      const life = 1000 + Math.random() * 500; // 1-1.5 seconds
      const particle = new Particle(geometry, material.clone(), particlePos, velocity, life);
      
      // Add sparkle effect with random initial rotation
      particle.mesh.rotation.z = Math.random() * Math.PI * 2;
      
      this.particles.push(particle);
      this.scene.add(particle.mesh);
    }
  }
  
  /**
   * Create splash pattern for misses
   */
  private createSplashPattern(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: THREE.Vector3,
    count: number,
    spread: number
  ): void {
    // Create particles in a downward splash pattern
    for (let i = 0; i < count; i++) {
      const particlePos = new THREE.Vector3(
        position.x + (Math.random() - 0.5) * spread,
        position.y + Math.random() * 20, // Slight upward spread
        position.z
      );
      
      // Velocity with strong horizontal spread and downward motion
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 200, // Strong horizontal spread
        Math.random() * 30 - 50, // Mostly downward
        0
      );
      
      const life = 800 + Math.random() * 400; // 0.8-1.2 seconds
      const particle = new Particle(geometry, material.clone(), particlePos, velocity, life);
      
      this.particles.push(particle);
      this.scene.add(particle.mesh);
    }
  }
  
  /**
   * Create puff pattern for baby shooting
   */
  private createPuffPattern(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: THREE.Vector3,
    count: number,
    spread: number
  ): void {
    // Create particles in a cloud-like puff pattern
    for (let i = 0; i < count; i++) {
      const particlePos = new THREE.Vector3(
        position.x + (Math.random() - 0.5) * spread * 0.6,
        position.y + (Math.random() - 0.5) * spread * 0.6,
        position.z
      );
      
      // Gentle expanding velocity
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        Math.random() * 40 + 20, // Mostly upward
        0
      );
      
      const life = 600 + Math.random() * 300; // 0.6-0.9 seconds
      const particle = new Particle(geometry, material.clone(), particlePos, velocity, life);
      
      this.particles.push(particle);
      this.scene.add(particle.mesh);
    }
  }
  
  /**
   * Create score pattern for point awards
   */
  private createScorePattern(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: THREE.Vector3,
    count: number,
    spread: number
  ): void {
    // Create particles in an upward fountain pattern
    for (let i = 0; i < count; i++) {
      const particlePos = new THREE.Vector3(
        position.x + (Math.random() - 0.5) * spread * 0.4,
        position.y + Math.random() * 10,
        position.z
      );
      
      // Strong upward velocity with slight spread
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        80 + Math.random() * 60, // Strong upward motion
        0
      );
      
      const life = 1200 + Math.random() * 600; // 1.2-1.8 seconds
      const particle = new Particle(geometry, material.clone(), particlePos, velocity, life);
      
      this.particles.push(particle);
      this.scene.add(particle.mesh);
    }
  }
  
  /**
   * Create default pattern for fallback
   */
  private createDefaultPattern(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: THREE.Vector3,
    count: number,
    spread: number
  ): void {
    for (let i = 0; i < count; i++) {
      const particlePos = new THREE.Vector3(
        position.x + (Math.random() - 0.5) * spread,
        position.y + (Math.random() - 0.5) * spread,
        position.z
      );
      
      const velocity = this.getParticleVelocity(ParticleType.CATCH_SPARKLE);
      const life = this.getParticleLife(ParticleType.CATCH_SPARKLE);
      
      const particle = new Particle(geometry, material.clone(), particlePos, velocity, life);
      this.particles.push(particle);
      this.scene.add(particle.mesh);
    }
  }
  
  /**
   * Get velocity for particle type
   */
  private getParticleVelocity(type: ParticleType): THREE.Vector3 {
    switch (type) {
      case ParticleType.CATCH_SPARKLE:
        return new THREE.Vector3(
          (Math.random() - 0.5) * 100,
          Math.random() * 100 + 50,
          0
        );
      case ParticleType.MISS_SPLASH:
        return new THREE.Vector3(
          (Math.random() - 0.5) * 150,
          Math.random() * 50 + 25,
          0
        );
      case ParticleType.SHOOT_PUFF:
        return new THREE.Vector3(
          (Math.random() - 0.5) * 80,
          Math.random() * 60 + 30,
          0
        );
      case ParticleType.SCORE_POP:
        return new THREE.Vector3(
          (Math.random() - 0.5) * 60,
          Math.random() * 80 + 40,
          0
        );
      default:
        return new THREE.Vector3(0, 50, 0);
    }
  }
  
  /**
   * Get life duration for particle type
   */
  private getParticleLife(type: ParticleType): number {
    switch (type) {
      case ParticleType.CATCH_SPARKLE:
        return 1000; // 1 second
      case ParticleType.MISS_SPLASH:
        return 800; // 0.8 seconds
      case ParticleType.SHOOT_PUFF:
        return 600; // 0.6 seconds
      case ParticleType.SCORE_POP:
        return 1200; // 1.2 seconds
      default:
        return 1000;
    }
  }
  
  /**
   * Update all particles
   */
  public update(deltaTime: number): void {
    // Update active particles
    this.particles.forEach(particle => {
      if (particle.isActive) {
        particle.update(deltaTime);
      }
    });
    
    // Remove inactive particles
    const inactiveParticles = this.particles.filter(p => !p.isActive);
    inactiveParticles.forEach(particle => {
      particle.destroy(this.scene);
    });
    
    // Keep only active particles
    this.particles = this.particles.filter(p => p.isActive);
  }
  
  /**
   * Clear all particles
   */
  public clear(): void {
    this.particles.forEach(particle => {
      particle.destroy(this.scene);
    });
    this.particles = [];
  }
  
  /**
   * Get active particle count
   */
  public getActiveParticleCount(): number {
    return this.particles.length;
  }
}