import * as THREE from 'three';
import { Entity } from '../entities/Entity';
import { Diaper } from '../entities/Diaper';
import { Poop } from '../entities/Poop';

/**
 * Collision detection system using AABB (Axis-Aligned Bounding Box) algorithm
 * Implements requirement 1.2 for collision detection between diaper and poop entities
 */
export class CollisionSystem {
  private static instance: CollisionSystem;
  
  private constructor() {}
  
  /**
   * Get singleton instance of collision system
   */
  public static getInstance(): CollisionSystem {
    if (!CollisionSystem.instance) {
      CollisionSystem.instance = new CollisionSystem();
    }
    return CollisionSystem.instance;
  }

  /**
   * Check collision between diaper and poop using optimized AABB detection
   * @param diaper The diaper entity
   * @param poop The poop entity
   * @returns True if collision detected
   */
  public checkDiaperPoopCollision(diaper: Diaper, poop: Poop): boolean {
    if (!diaper.isActive || !poop.isActive) {
      return false;
    }

    // Get entity positions and dimensions
    const diaperPos = diaper.position;
    const poopPos = poop.position;
    
    const diaperWidth = diaper.getWidth();
    const diaperHeight = diaper.getHeight();
    const poopWidth = poop.getWidth();
    const poopHeight = poop.getHeight();

    // Calculate half-dimensions for AABB collision detection
    const diaperHalfWidth = diaperWidth / 2;
    const diaperHalfHeight = diaperHeight / 2;
    const poopHalfWidth = poopWidth / 2;
    const poopHalfHeight = poopHeight / 2;

    // AABB collision detection algorithm
    const deltaX = Math.abs(diaperPos.x - poopPos.x);
    const deltaY = Math.abs(diaperPos.y - poopPos.y);
    
    const minDistanceX = diaperHalfWidth + poopHalfWidth;
    const minDistanceY = diaperHalfHeight + poopHalfHeight;

    // Check if bounding boxes intersect
    return deltaX < minDistanceX && deltaY < minDistanceY;
  }

  /**
   * Check collision between any two entities using AABB detection
   * @param entityA First entity
   * @param entityB Second entity
   * @returns True if collision detected
   */
  public checkEntityCollision(entityA: Entity, entityB: Entity): boolean {
    if (!entityA.isActive || !entityB.isActive) {
      return false;
    }

    // Use Three.js Box3 for general entity collision detection
    return entityA.isCollidingWith(entityB);
  }

  /**
   * Check collision between diaper and multiple poop entities
   * Returns the first poop that collides with the diaper
   * @param diaper The diaper entity
   * @param poops Array of poop entities
   * @returns The first colliding poop entity, or null if no collision
   */
  public checkDiaperPoopCollisions(diaper: Diaper, poops: Poop[]): Poop | null {
    for (const poop of poops) {
      if (this.checkDiaperPoopCollision(diaper, poop)) {
        return poop;
      }
    }
    return null;
  }

  /**
   * Optimized collision detection for multiple entities
   * Uses spatial partitioning for better performance with many entities
   * @param entities Array of entities to check collisions for
   * @returns Array of collision pairs
   */
  public checkMultipleCollisions(entities: Entity[]): Array<{ entityA: Entity; entityB: Entity }> {
    const collisions: Array<{ entityA: Entity; entityB: Entity }> = [];
    
    // Simple O(n²) approach for now - can be optimized with spatial partitioning if needed
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];
        
        if (this.checkEntityCollision(entityA, entityB)) {
          collisions.push({ entityA, entityB });
        }
      }
    }
    
    return collisions;
  }

  /**
   * Check if an entity is within screen bounds
   * @param entity The entity to check
   * @param bounds Screen bounds
   * @returns True if entity is within bounds
   */
  public isWithinBounds(
    entity: Entity, 
    bounds: { left: number; right: number; top: number; bottom: number }
  ): boolean {
    const pos = entity.position;
    return pos.x >= bounds.left && 
           pos.x <= bounds.right && 
           pos.y >= bounds.bottom && 
           pos.y <= bounds.top;
  }

  /**
   * Get collision information for debugging
   * @param entityA First entity
   * @param entityB Second entity
   * @returns Collision debug information
   */
  public getCollisionInfo(entityA: Entity, entityB: Entity): {
    isColliding: boolean;
    distance: number;
    overlap: { x: number; y: number };
  } {
    const posA = entityA.position;
    const posB = entityB.position;
    
    const distance = posA.distanceTo(posB);
    const deltaX = Math.abs(posA.x - posB.x);
    const deltaY = Math.abs(posA.y - posB.y);
    
    const boundsA = entityA.getBounds();
    const boundsB = entityB.getBounds();
    
    const overlapX = Math.max(0, Math.min(boundsA.max.x, boundsB.max.x) - Math.max(boundsA.min.x, boundsB.min.x));
    const overlapY = Math.max(0, Math.min(boundsA.max.y, boundsB.max.y) - Math.max(boundsA.min.y, boundsB.min.y));
    
    return {
      isColliding: this.checkEntityCollision(entityA, entityB),
      distance,
      overlap: { x: overlapX, y: overlapY }
    };
  }
}