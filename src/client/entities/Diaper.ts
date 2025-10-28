import * as THREE from 'three';
import { Entity } from './Entity';

/**
 * Diaper entity controlled by the player to catch falling poop projectiles
 * Implements requirements 1.1, 1.3, 5.3
 */
export class Diaper extends Entity {
  private speed: number = 300; // Movement speed in units per second
  private bounds: { left: number; right: number };
  private targetX: number; // Target position for smooth movement
  private bobbingPhase: number = 0; // Phase for bobbing animation
  private bobbingSpeed: number = 3; // Speed of bobbing animation
  private bobbingAmplitude: number = 5; // Amplitude of bobbing animation
  private baseY: number; // Base Y position for bobbing

  constructor(
    scene: THREE.Scene, 
    x: number = 0, 
    y: number = -240,
    bounds: { left: number; right: number } = { left: -350, right: 350 }
  ) {
    // Create diaper sprite using PlaneGeometry
    const geometry = new THREE.PlaneGeometry(80, 40);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xFFFFFF, // White color for diaper
      transparent: true,
      opacity: 1.0
    });

    super(scene, geometry, material);
    
    this.bounds = bounds;
    this.baseY = y;
    this.targetX = x;
    this.setPosition(x, y, 0);
  }

  /**
   * Update diaper entity - handles smooth movement and bobbing animation
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  public update(deltaTime: number): void {
    if (!this.isActive) return;

    // Call base update for common functionality
    this.baseUpdate(deltaTime);
    
    // Handle smooth horizontal movement
    this.updateMovement(deltaTime);
    
    // Handle bobbing animation
    this.updateBobbingAnimation(deltaTime);
    
    // Ensure diaper stays within bounds
    this.checkBounds();
  }

  /**
   * Update smooth horizontal movement towards target position with improved interpolation
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  private updateMovement(deltaTime: number): void {
    const deltaSeconds = deltaTime / 1000;
    const currentX = this.position.x;
    const deltaX = this.targetX - currentX;
    
    // If we're close enough to target, snap to it to prevent jittering
    if (Math.abs(deltaX) < 0.5) {
      this.position.x = this.targetX;
      return;
    }
    
    // Use exponential smoothing for more natural movement
    // This provides faster movement when far from target, slower when close
    const smoothingFactor = 8.0; // Higher values = more responsive movement
    const moveAmount = deltaX * smoothingFactor * deltaSeconds;
    
    // Apply maximum speed limit to prevent overshooting
    const maxMoveDistance = this.speed * deltaSeconds;
    const clampedMove = Math.sign(moveAmount) * Math.min(Math.abs(moveAmount), maxMoveDistance);
    
    this.position.x += clampedMove;
    
    // Ensure position stays within bounds after movement
    this.checkBounds();
  }

  /**
   * Update bobbing animation for visual appeal with enhanced effects
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  private updateBobbingAnimation(deltaTime: number): void {
    this.bobbingPhase += (this.bobbingSpeed * deltaTime) / 1000;
    
    // Enhanced bobbing with multiple wave components for more natural movement
    const primaryBob = Math.sin(this.bobbingPhase) * this.bobbingAmplitude;
    const secondaryBob = Math.sin(this.bobbingPhase * 1.3) * (this.bobbingAmplitude * 0.3);
    const bobbingOffset = primaryBob + secondaryBob;
    
    // Enhanced rotation with multiple components
    const primaryRotation = Math.sin(this.bobbingPhase * 0.7) * 0.08;
    const secondaryRotation = Math.sin(this.bobbingPhase * 1.1) * 0.03;
    const rotationOffset = primaryRotation + secondaryRotation;
    
    // Subtle scale variation for breathing effect
    const scaleVariation = 1 + Math.sin(this.bobbingPhase * 0.5) * 0.02;
    
    this.position.y = this.baseY + bobbingOffset;
    this.mesh.rotation.z = rotationOffset;
    this.mesh.scale.setScalar(scaleVariation);
  }
  
  /**
   * Trigger catch animation when successfully catching poop
   */
  public triggerCatchAnimation(): void {
    const originalScale = this.mesh.scale.clone();
    const originalColor = (this.mesh.material as THREE.MeshBasicMaterial).color.clone();
    
    // Brief scale and brightness effect
    this.mesh.scale.multiplyScalar(1.3);
    (this.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xFFFFFF); // Bright white flash
    
    // Return to normal after short delay
    setTimeout(() => {
      if (this.isActive) {
        this.mesh.scale.copy(originalScale);
        (this.mesh.material as THREE.MeshBasicMaterial).color.copy(originalColor);
      }
    }, 150);
  }
  
  /**
   * Trigger miss animation when poop falls past diaper
   */
  public triggerMissAnimation(): void {
    const originalColor = (this.mesh.material as THREE.MeshBasicMaterial).color.clone();
    
    // Brief red flash to indicate miss
    (this.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xFF6B6B); // Light red
    
    // Return to normal
    setTimeout(() => {
      if (this.isActive) {
        (this.mesh.material as THREE.MeshBasicMaterial).color.copy(originalColor);
      }
    }, 200);
  }

  /**
   * Move diaper left
   */
  public moveLeft(): void {
    this.targetX = Math.max(this.bounds.left, this.targetX - 50);
  }

  /**
   * Move diaper right
   */
  public moveRight(): void {
    this.targetX = Math.min(this.bounds.right, this.targetX + 50);
  }

  /**
   * Set target position directly (for touch/mouse input)
   * @param x Target X position
   */
  public setTargetX(x: number): void {
    this.targetX = Math.max(this.bounds.left, Math.min(this.bounds.right, x));
  }

  /**
   * Get current target X position
   */
  public getTargetX(): number {
    return this.targetX;
  }

  /**
   * Ensure diaper stays within movement bounds with improved validation
   */
  private checkBounds(): void {
    let positionChanged = false;
    
    // Check and correct position bounds
    if (this.position.x < this.bounds.left) {
      this.position.x = this.bounds.left;
      positionChanged = true;
    } else if (this.position.x > this.bounds.right) {
      this.position.x = this.bounds.right;
      positionChanged = true;
    }
    
    // Check and correct target bounds
    if (this.targetX < this.bounds.left) {
      this.targetX = this.bounds.left;
      positionChanged = true;
    } else if (this.targetX > this.bounds.right) {
      this.targetX = this.bounds.right;
      positionChanged = true;
    }
    
    // If position was corrected, ensure target and position are aligned
    if (positionChanged) {
      // If we hit a boundary, align target with current position to prevent oscillation
      if (this.position.x === this.bounds.left || this.position.x === this.bounds.right) {
        this.targetX = this.position.x;
      }
    }
  }

  /**
   * Get movement bounds
   */
  public getMovementBounds(): { left: number; right: number } {
    return { ...this.bounds };
  }

  /**
   * Set movement bounds
   * @param left Left boundary
   * @param right Right boundary
   */
  public setBounds(left: number, right: number): void {
    this.bounds.left = left;
    this.bounds.right = right;
    
    // Ensure current position is within new bounds
    this.checkBounds();
  }

  /**
   * Get diaper width for collision detection
   */
  public getWidth(): number {
    return 80; // Width of the diaper sprite
  }

  /**
   * Get diaper height for collision detection
   */
  public getHeight(): number {
    return 40; // Height of the diaper sprite
  }

  /**
   * Reset diaper to center position
   */
  public reset(): void {
    const centerX = (this.bounds.left + this.bounds.right) / 2;
    this.targetX = centerX;
    this.setPosition(centerX, this.baseY, 0);
    this.bobbingPhase = 0;
  }

  /**
   * Check if diaper is currently moving
   */
  public isMoving(): boolean {
    return Math.abs(this.targetX - this.position.x) > 0.5;
  }
  
  /**
   * Set movement speed
   * @param speed New movement speed in units per second
   */
  public setSpeed(speed: number): void {
    this.speed = Math.max(50, speed); // Minimum speed of 50 units/second
  }
  
  /**
   * Get current movement speed
   */
  public getSpeed(): number {
    return this.speed;
  }
  
  /**
   * Get distance to target position
   */
  public getDistanceToTarget(): number {
    return Math.abs(this.targetX - this.position.x);
  }
  
  /**
   * Check if diaper is at target position (within tolerance)
   */
  public isAtTarget(): boolean {
    return this.getDistanceToTarget() < 0.5;
  }
  
  /**
   * Immediately snap to target position (for instant movement)
   */
  public snapToTarget(): void {
    this.position.x = this.targetX;
  }
  
  /**
   * Validate and clamp a target X position to bounds
   * @param x Target X position to validate
   * @returns Clamped X position within bounds
   */
  public validateTargetX(x: number): number {
    return Math.max(this.bounds.left, Math.min(this.bounds.right, x));
  }
}