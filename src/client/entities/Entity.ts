import * as THREE from 'three';

/**
 * Base Entity interface defining common properties and methods for all game entities
 */
export interface IEntity {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isActive: boolean;
  
  update(deltaTime: number): void;
  destroy(): void;
}

/**
 * Abstract base Entity class providing common functionality for all game entities
 * Implements entity lifecycle management and basic physics properties
 */
export abstract class Entity implements IEntity {
  public mesh: THREE.Mesh;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public isActive: boolean;
  
  protected scene: THREE.Scene;

  constructor(scene: THREE.Scene, geometry: THREE.BufferGeometry, material: THREE.Material) {
    this.scene = scene;
    this.mesh = new THREE.Mesh(geometry, material);
    this.position = this.mesh.position;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.isActive = true;
    
    // Add mesh to scene
    this.scene.add(this.mesh);
  }

  /**
   * Update entity state - to be implemented by subclasses
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  public abstract update(deltaTime: number): void;

  /**
   * Base update method that handles common entity updates
   * Should be called by subclass update implementations
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  protected baseUpdate(deltaTime: number): void {
    if (!this.isActive) return;
    
    // Apply velocity to position (convert deltaTime from ms to seconds)
    const deltaSeconds = deltaTime / 1000;
    this.position.add(this.velocity.clone().multiplyScalar(deltaSeconds));
  }

  /**
   * Destroy the entity and clean up resources
   * Removes mesh from scene and marks entity as inactive
   */
  public destroy(): void {
    if (this.mesh && this.scene) {
      this.scene.remove(this.mesh);
    }
    
    // Dispose of geometry and material to free memory
    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }
    
    if (this.mesh.material) {
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(material => material.dispose());
      } else {
        this.mesh.material.dispose();
      }
    }
    
    this.isActive = false;
  }

  /**
   * Set entity position
   * @param x X coordinate
   * @param y Y coordinate
   * @param z Z coordinate (optional, defaults to 0)
   */
  public setPosition(x: number, y: number, z: number = 0): void {
    this.position.set(x, y, z);
  }

  /**
   * Set entity velocity
   * @param x X velocity
   * @param y Y velocity
   * @param z Z velocity (optional, defaults to 0)
   */
  public setVelocity(x: number, y: number, z: number = 0): void {
    this.velocity.set(x, y, z);
  }

  /**
   * Get entity bounds for collision detection
   * Returns a bounding box based on the mesh geometry
   */
  public getBounds(): THREE.Box3 {
    const box = new THREE.Box3();
    box.setFromObject(this.mesh);
    return box;
  }

  /**
   * Check if this entity is colliding with another entity using AABB collision detection
   * @param other The other entity to check collision with
   * @returns True if entities are colliding
   */
  public isCollidingWith(other: Entity): boolean {
    if (!this.isActive || !other.isActive) return false;
    
    const thisBounds = this.getBounds();
    const otherBounds = other.getBounds();
    
    return thisBounds.intersectsBox(otherBounds);
  }
}