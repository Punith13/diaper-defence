import * as THREE from 'three';
import { Poop, PoopType } from '../entities/Poop';

/**
 * Generic object pool interface for reusable objects
 */
interface Poolable {
  isActive: boolean;
  reset(...args: any[]): void;
  destroy(): void;
}

/**
 * Generic object pool implementation for memory optimization
 */
export class ObjectPool<T extends Poolable> {
  private pool: T[] = [];
  private createFn: (...args: any[]) => T;
  private maxSize: number;

  constructor(createFn: (...args: any[]) => T, initialSize: number = 10, maxSize: number = 50) {
    this.createFn = createFn;
    this.maxSize = maxSize;
    
    // Pre-populate pool with initial objects
    for (let i = 0; i < initialSize; i++) {
      const obj = this.createFn();
      obj.destroy(); // Deactivate immediately
      this.pool.push(obj);
    }
  }

  /**
   * Get an object from the pool or create a new one
   */
  public get(...args: any[]): T {
    // Try to find an inactive object in the pool
    const pooledObject = this.pool.find(obj => !obj.isActive);
    
    if (pooledObject) {
      // Reset and reactivate the pooled object
      pooledObject.reset(...args);
      return pooledObject;
    }
    
    // No available objects in pool, create a new one
    const newObject = this.createFn(...args);
    
    // Add to pool if we haven't reached max size
    if (this.pool.length < this.maxSize) {
      this.pool.push(newObject);
    }
    
    return newObject;
  }

  /**
   * Return an object to the pool (automatically called when object is destroyed)
   */
  public release(obj: T): void {
    // Object is automatically returned to pool when destroyed
    // since we keep references in the pool array
  }

  /**
   * Get pool statistics for debugging
   */
  public getStats(): { total: number; active: number; inactive: number } {
    const active = this.pool.filter(obj => obj.isActive).length;
    return {
      total: this.pool.length,
      active,
      inactive: this.pool.length - active
    };
  }

  /**
   * Clear the entire pool and destroy all objects
   */
  public clear(): void {
    this.pool.forEach(obj => {
      if (obj.isActive) {
        obj.destroy();
      }
    });
    this.pool = [];
  }
}

/**
 * Specialized object pool for Poop entities
 */
export class PoopPool {
  private pool: ObjectPool<Poop>;
  private scene: THREE.Scene;
  private screenBottom: number;

  constructor(scene: THREE.Scene, screenBottom: number, initialSize: number = 15, maxSize: number = 100) {
    this.scene = scene;
    this.screenBottom = screenBottom;
    
    // Create the object pool with a factory function
    this.pool = new ObjectPool<Poop>(
      () => this.createPoop(),
      initialSize,
      maxSize
    );
  }

  /**
   * Factory function to create new Poop entities
   */
  private createPoop(): Poop {
    // Create a default poop that will be reset when used
    return new Poop(this.scene, 0, 0, PoopType.REGULAR, this.screenBottom);
  }

  /**
   * Get a poop from the pool with specified parameters
   */
  public getPoop(x: number, y: number, type: PoopType): Poop {
    const poop = this.pool.get();
    
    // Reset the poop with new parameters
    poop.reset(this.scene, x, y, type, this.screenBottom);
    
    return poop;
  }

  /**
   * Create a poop with random type based on score
   */
  public getRandomPoop(x: number, y: number, score: number = 0): Poop {
    const type = Poop.createRandomType(score);
    return this.getPoop(x, y, type);
  }

  /**
   * Get pool statistics
   */
  public getStats() {
    return this.pool.getStats();
  }

  /**
   * Clear the pool
   */
  public clear(): void {
    this.pool.clear();
  }
}