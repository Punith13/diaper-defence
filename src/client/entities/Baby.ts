import * as THREE from 'three';
import { Entity } from './Entity';
import { AssetManager } from '../assets';
import { PoopType } from './Poop';

/**
 * Baby entity that oscillates horizontally and shoots poop projectiles
 * Implements requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */
export class Baby extends Entity {
  private shootTimer: number = 0;
  private shootInterval: number = 2000; // Initial shooting interval in milliseconds
  private oscillationPhase: number = 0;
  private oscillationSpeed: number = 2; // Oscillation speed
  private oscillationAmplitude: number = 150; // How far the baby moves left/right
  private centerX: number = 0; // Center position for oscillation
  private gameTime: number = 0; // Track total game time for difficulty scaling
  private lastShootRateUpdate: number = 0; // Track when we last updated shoot rate
  
  // Shooting mechanics
  private onShootCallback: ((baby: Baby) => void) | undefined;

  constructor(
    scene: THREE.Scene, 
    x: number = 0, 
    y: number = 250,
    onShoot?: (baby: Baby) => void
  ) {
    // Create baby sprite using PlaneGeometry with texture
    const geometry = new THREE.PlaneGeometry(60, 60);
    
    // Try to get crying texture from AssetManager (default state)
    const assetManager = AssetManager.getInstance();
    const babyTexture = assetManager.getTexture('baby-crying');
    
    const material = new THREE.MeshBasicMaterial({ 
      map: babyTexture || null,
      color: babyTexture ? 0xffffff : 0xFFB6C1, // White if texture, pink if no texture
      transparent: true,
      opacity: 1.0
    });

    super(scene, geometry, material);
    
    this.centerX = x;
    this.setPosition(x, y, 0);
    this.onShootCallback = onShoot;
    
    // Initialize random shooting timer
    this.resetShootTimer();
  }

  /**
   * Update baby entity - handles oscillation movement and shooting mechanics
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  public update(deltaTime: number): void {
    if (!this.isActive) return;

    // Call base update for common functionality
    this.baseUpdate(deltaTime);
    
    // Track total game time
    this.gameTime += deltaTime;
    
    // Update oscillation movement using sine wave
    this.oscillationPhase += (this.oscillationSpeed * deltaTime) / 1000;
    const oscillationX = this.centerX + Math.sin(this.oscillationPhase) * this.oscillationAmplitude;
    this.setPosition(oscillationX, this.position.y, this.position.z);
    
    // Handle shooting rate increase every 15 seconds
    this.updateShootingRate();
    
    // Handle shooting mechanics
    this.updateShooting(deltaTime);
  }

  /**
   * Update shooting mechanics - handles timing and projectile creation
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  private updateShooting(deltaTime: number): void {
    this.shootTimer -= deltaTime;
    
    if (this.shootTimer <= 0) {
      this.shoot();
      this.resetShootTimer();
    }
  }

  /**
   * Shoot a projectile and trigger callback
   */
  private shoot(): void {
    // Trigger shooting animation event (visual feedback)
    this.triggerShootingAnimation();
    
    // Call the callback to create a poop projectile
    if (this.onShootCallback) {
      this.onShootCallback(this);
    }
  }

  /**
   * Reset the shooting timer with random interval
   */
  private resetShootTimer(): void {
    // Random interval between 1-3 seconds, modified by current shoot interval
    const randomFactor = 0.5 + Math.random(); // 0.5 to 1.5
    this.shootTimer = this.shootInterval * randomFactor;
  }

  /**
   * Update shooting rate based on game time - increases difficulty every 15 seconds
   */
  private updateShootingRate(): void {
    const currentInterval = Math.floor(this.gameTime / 15000); // Every 15 seconds
    
    if (currentInterval > this.lastShootRateUpdate) {
      this.lastShootRateUpdate = currentInterval;
      
      // Decrease shooting interval by 10% each time, minimum 500ms
      this.shootInterval = Math.max(500, this.shootInterval * 0.9);
      
      // console.log(`Baby shooting rate increased! New interval: ${this.shootInterval}ms`);
    }
  }

  /**
   * Trigger shooting animation - enhanced with crying effect and multiple phases
   */
  private triggerShootingAnimation(): void {
    // Enhanced shooting animation with multiple effects
    const originalScale = this.mesh.scale.clone();
    const originalColor = (this.mesh.material as THREE.MeshBasicMaterial).color.clone();
    const originalRotation = this.mesh.rotation.z;
    
    // Phase 1: Pre-shoot anticipation (scale down slightly)
    this.mesh.scale.multiplyScalar(0.9);
    (this.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xFFB6C1); // Lighter pink
    
    setTimeout(() => {
      if (!this.isActive) return;
      
      // Phase 2: Shoot burst (scale up and change color - crying effect)
      this.mesh.scale.copy(originalScale);
      this.mesh.scale.multiplyScalar(1.4);
      (this.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xFF9999); // Slightly red (crying)
      
      // Phase 3: Intense shake effect with rotation
      const originalPosition = this.mesh.position.clone();
      let shakeCount = 0;
      const shakeInterval = setInterval(() => {
        if (!this.isActive) {
          clearInterval(shakeInterval);
          return;
        }
        
        const shakeIntensity = 4 + Math.sin(shakeCount * 0.5) * 2; // Variable intensity
        this.mesh.position.x = originalPosition.x + (Math.random() - 0.5) * shakeIntensity;
        this.mesh.position.y = originalPosition.y + (Math.random() - 0.5) * shakeIntensity;
        
        // Add rotation shake
        this.mesh.rotation.z = originalRotation + (Math.random() - 0.5) * 0.2;
        
        shakeCount++;
        if (shakeCount >= 8) { // Longer shake for more dramatic effect
          clearInterval(shakeInterval);
          this.mesh.position.copy(originalPosition);
          this.mesh.rotation.z = originalRotation;
        }
      }, 15); // Faster shake for more intensity
      
    }, 100); // Short anticipation delay
    
    // Phase 4: Recovery phase with bounce-back effect
    setTimeout(() => {
      if (!this.isActive) return;
      
      // Bounce back to slightly larger than normal
      this.mesh.scale.copy(originalScale);
      this.mesh.scale.multiplyScalar(1.1);
      (this.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xFFCCCC); // Light pink recovery
      
      // Final return to normal with smooth transition
      setTimeout(() => {
        if (this.isActive) {
          this.mesh.scale.copy(originalScale);
          (this.mesh.material as THREE.MeshBasicMaterial).color.copy(originalColor);
        }
      }, 150);
      
    }, 300);
  }

  /**
   * Get current shooting interval for external systems
   */
  public getCurrentShootInterval(): number {
    return this.shootInterval;
  }

  /**
   * Get game time for external systems
   */
  public getGameTime(): number {
    return this.gameTime;
  }

  /**
   * Change baby expression based on poop type about to be shot
   * @param poopType Type of poop that will be shot
   */
  public setExpressionForPoopType(poopType: PoopType): void {
    const assetManager = AssetManager.getInstance();
    let texture: THREE.Texture | undefined;
    
    if (poopType === PoopType.FANCY) {
      // Happy expression for golden poop
      texture = assetManager.getTexture('baby-happy');
    } else {
      // Crying expression for regular and boob poop
      texture = assetManager.getTexture('baby-crying');
    }
    
    if (texture && this.mesh.material instanceof THREE.MeshBasicMaterial) {
      this.mesh.material.map = texture;
      this.mesh.material.needsUpdate = true;
    }
  }

  /**
   * Reset baby expression to default (crying)
   */
  public resetExpression(): void {
    const assetManager = AssetManager.getInstance();
    const cryingTexture = assetManager.getTexture('baby-crying');
    
    if (cryingTexture && this.mesh.material instanceof THREE.MeshBasicMaterial) {
      this.mesh.material.map = cryingTexture;
      this.mesh.material.needsUpdate = true;
    }
  }

  /**
   * Reset baby state for new game
   */
  public reset(): void {
    this.gameTime = 0;
    this.lastShootRateUpdate = 0;
    this.shootInterval = 2000; // Reset to initial interval
    this.oscillationPhase = 0;
    this.resetShootTimer();
    this.setPosition(this.centerX, this.position.y, this.position.z);
    this.resetExpression(); // Reset to crying expression
  }
}