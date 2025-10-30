import * as THREE from 'three';
import { Entity } from './Entity';
import { AssetManager } from '../assets';

/**
 * Poop types with different behaviors and point values
 */
export enum PoopType {
  REGULAR = 'regular',
  FANCY = 'fancy',
  BOOB = 'boob'
}

/**
 * Configuration for different poop types
 */
interface PoopTypeConfig {
  points: number;
  color: number;
  probability: number;
}

/**
 * Poop projectile entity that falls from the baby
 * Implements requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */
export class Poop extends Entity {
  public readonly type: PoopType;
  public readonly points: number;
  private fallSpeed: number;
  private baseSpeed: number = 200; // Base fall speed in units per second
  private screenBottom: number = -300; // Bottom boundary of the screen

  // Static configuration for poop types
  private static readonly typeConfigs: Record<PoopType, PoopTypeConfig> = {
    [PoopType.REGULAR]: {
      points: 10,
      color: 0x8B4513, // Brown
      probability: 0.6 // 60% base probability
    },
    [PoopType.FANCY]: {
      points: 50,
      color: 0xFFD700, // Gold
      probability: 0.25 // 25% base probability
    },
    [PoopType.BOOB]: {
      points: -1, // Special value indicating game over
      color: 0xFF69B4, // Hot pink
      probability: 0.15 // 15% base probability (increased for better testing)
    }
  };

  constructor(
    scene: THREE.Scene,
    x: number,
    y: number,
    type: PoopType,
    screenBottom: number = -300
  ) {
    // Defensive programming: ensure valid type and config
    if (!type || !Poop.typeConfigs[type]) {
      console.error(`Invalid poop type: ${type}. Using REGULAR as fallback.`);
      type = PoopType.REGULAR;
    }
    
    const config = Poop.typeConfigs[type];
    
    // Create poop sprite using PlaneGeometry with texture
    const geometry = new THREE.PlaneGeometry(30, 30);
    
    // Try to get texture from AssetManager, fallback to solid color
    const assetManager = AssetManager.getInstance();
    const textureKey = `poop-${type}`;
    const poopTexture = assetManager.getTexture(textureKey);
    
    const material = new THREE.MeshBasicMaterial({ 
      map: poopTexture || null,
      color: poopTexture ? 0xffffff : config.color, // White if texture, type color if no texture
      transparent: true,
      opacity: 1.0
    });

    super(scene, geometry, material);
    
    this.type = type;
    this.points = config.points;
    this.screenBottom = screenBottom;
    
    // Set initial position
    this.setPosition(x, y, 0);
    
    // Set randomized fall speed
    this.fallSpeed = this.baseSpeed + (Math.random() - 0.5) * 50; // ±25 variation
    this.setVelocity(0, -this.fallSpeed, 0);
    
    // Set random rotation speed for visual variety
    this.rotationSpeed = (Math.random() - 0.5) * 4; // Random rotation between -2 and 2 rad/s
  }

  private rotationSpeed: number = 0;
  
  /**
   * Update poop entity - handles downward movement and rotation animation
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  public update(deltaTime: number): void {
    if (!this.isActive) return;

    // Call base update for physics
    this.baseUpdate(deltaTime);
    
    // Add rotation animation for visual appeal
    this.updateRotationAnimation(deltaTime);
    
    // Note: Don't auto-destroy when off screen - let the main game loop handle miss detection
  }
  
  /**
   * Update rotation animation for falling poop
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  private updateRotationAnimation(deltaTime: number): void {
    const deltaSeconds = deltaTime / 1000;
    this.mesh.rotation.z += this.rotationSpeed * deltaSeconds;
  }
  
  /**
   * Trigger catch animation when poop is caught
   */
  public triggerCatchAnimation(): void {
    // Scale up briefly before destruction
    this.mesh.scale.multiplyScalar(1.5);
    
    // Add a spin effect
    this.rotationSpeed = 10; // Fast spin
    
    // Fade out effect
    if (this.mesh.material instanceof THREE.MeshBasicMaterial) {
      this.mesh.material.transparent = true;
      const fadeInterval = setInterval(() => {
        if (!this.isActive) {
          clearInterval(fadeInterval);
          return;
        }
        
        if (this.mesh.material instanceof THREE.MeshBasicMaterial) {
          this.mesh.material.opacity -= 0.1;
          if (this.mesh.material.opacity <= 0) {
            clearInterval(fadeInterval);
            this.destroy();
          }
        }
      }, 50);
    }
  }

  /**
   * Check if poop has fallen off the bottom of the screen
   */
  public isOffScreen(): boolean {
    return this.position.y < this.screenBottom;
  }

  /**
   * Get poop width for collision detection
   */
  public getWidth(): number {
    return 30;
  }

  /**
   * Get poop height for collision detection
   */
  public getHeight(): number {
    return 30;
  }

  /**
   * Create a random poop type based on probability and score scaling
   * @param score Current player score for probability scaling
   * @returns Random poop type
   */
  public static createRandomType(score: number = 0): PoopType {
    // Scale fancy poop probability based on score (every 100 points increases by 5%)
    const fancyBonus = Math.floor(score / 100) * 0.05;
    const adjustedFancyProb = Math.min(0.4, Poop.typeConfigs[PoopType.FANCY].probability + fancyBonus);
    
    // Adjust probabilities
    const boobProb = Poop.typeConfigs[PoopType.BOOB].probability; // Boob stays constant
    
    const random = Math.random();
    
    if (random < boobProb) {
      return PoopType.BOOB;
    } else if (random < boobProb + adjustedFancyProb) {
      return PoopType.FANCY;
    } else {
      return PoopType.REGULAR;
    }
  }

  /**
   * Create a new poop entity at the specified position
   * @param scene Three.js scene
   * @param x X position
   * @param y Y position
   * @param score Current score for type probability scaling
   * @param screenBottom Bottom boundary of the screen
   * @returns New Poop entity
   */
  public static create(
    scene: THREE.Scene,
    x: number,
    y: number,
    score: number = 0,
    screenBottom: number = -300
  ): Poop {
    const type = Poop.createRandomType(score);
    return new Poop(scene, x, y, type, screenBottom);
  }

  /**
   * Get configuration for a specific poop type
   * @param type Poop type
   * @returns Type configuration
   */
  public static getTypeConfig(type: PoopType): PoopTypeConfig {
    return { ...Poop.typeConfigs[type] };
  }

  /**
   * Get all poop type configurations
   * @returns All type configurations
   */
  public static getAllTypeConfigs(): Record<PoopType, PoopTypeConfig> {
    return { ...Poop.typeConfigs };
  }

  /**
   * Check if this poop causes game over when caught
   */
  public causesGameOver(): boolean {
    return this.type === PoopType.BOOB;
  }

  /**
   * Get display name for poop type
   */
  public getTypeName(): string {
    switch (this.type) {
      case PoopType.REGULAR:
        return 'Regular Poop';
      case PoopType.FANCY:
        return 'Fancy Poop';
      case PoopType.BOOB:
        return 'Boob Poop';
      default:
        return 'Unknown Poop';
    }
  }

  /**
   * Reset the poop entity for object pooling
   * @param scene Three.js scene
   * @param x X position
   * @param y Y position
   * @param type Poop type
   * @param screenBottom Bottom boundary of the screen
   */
  public reset(
    scene: THREE.Scene,
    x: number,
    y: number,
    type: PoopType,
    screenBottom: number = -300
  ): void {
    // Defensive programming: ensure valid scene
    if (!scene) {
      console.error('Invalid scene provided to Poop.reset()');
      return;
    }
    
    // Defensive programming: ensure valid type
    if (!type || !Poop.typeConfigs[type]) {
      console.error(`Invalid poop type in reset: ${type}. Using REGULAR as fallback.`);
      type = PoopType.REGULAR;
    }
    
    // Reset type and points
    (this as any).type = type;
    (this as any).points = Poop.typeConfigs[type].points;
    this.screenBottom = screenBottom;

    // Reset position and velocity
    this.setPosition(x, y, 0);
    this.fallSpeed = this.baseSpeed + (Math.random() - 0.5) * 50;
    this.setVelocity(0, -this.fallSpeed, 0);

    // Reset rotation
    this.rotationSpeed = (Math.random() - 0.5) * 4;
    this.mesh.rotation.z = 0;
    this.mesh.scale.set(1, 1, 1);

    // Reset material properties
    if (this.mesh.material instanceof THREE.MeshBasicMaterial) {
      const config = Poop.typeConfigs[type];
      
      // Update texture and color for the new type
      const assetManager = AssetManager.getInstance();
      const textureKey = `poop-${type}`;
      const poopTexture = assetManager.getTexture(textureKey);
      
      this.mesh.material.map = poopTexture || null;
      this.mesh.material.color.setHex(poopTexture ? 0xffffff : config.color);
      this.mesh.material.opacity = 1.0;
      this.mesh.material.transparent = true;
      this.mesh.material.needsUpdate = true;
    }

    // Reactivate the entity
    this.isActive = true;
    this.mesh.visible = true;

    // Add back to scene if not already there
    if (scene && scene.children && !scene.children.includes(this.mesh)) {
      scene.add(this.mesh);
    }
  }
}