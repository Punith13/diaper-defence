import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator';

/**
 * Asset loading states for tracking progress
 */
export enum AssetLoadState {
  PENDING = 'pending',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

/**
 * Asset metadata for tracking and management
 */
interface AssetMetadata {
  name: string;
  url: string;
  state: AssetLoadState;
  retryCount: number;
  error?: Error;
}

/**
 * Asset loading progress information
 */
export interface LoadingProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset?: string;
}

/**
 * AssetManager class for texture management with fallback to colored geometry
 * Implements progressive loading for better user experience
 * Requirements: 2.2, 2.3, 2.4
 */
export class AssetManager {
  private static instance: AssetManager;
  private textures: Map<string, THREE.Texture> = new Map();
  private textureLoader: THREE.TextureLoader;
  private loadingManager: THREE.LoadingManager;
  private assetMetadata: Map<string, AssetMetadata> = new Map();
  private maxRetries: number = 3;
  private loadingProgress: LoadingProgress = { loaded: 0, total: 0, percentage: 0 };
  private onProgressCallback?: (progress: LoadingProgress) => void;
  private onCompleteCallback?: () => void;
  private onErrorCallback?: (error: Error, assetName: string) => void;

  private constructor() {
    // Initialize loading manager for progress tracking
    this.loadingManager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    
    this.setupLoadingManager();
  }

  /**
   * Get singleton instance of AssetManager
   */
  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  /**
   * Setup loading manager callbacks for progress tracking
   */
  private setupLoadingManager(): void {
    this.loadingManager.onProgress = (url: string, loaded: number, total: number) => {
      this.loadingProgress = {
        loaded,
        total,
        percentage: total > 0 ? (loaded / total) * 100 : 0,
        currentAsset: this.getAssetNameFromUrl(url)
      };
      
      if (this.onProgressCallback) {
        this.onProgressCallback(this.loadingProgress);
      }
    };

    this.loadingManager.onLoad = () => {
      // console.log('All assets loaded successfully');
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    };

    this.loadingManager.onError = (url: string) => {
      const assetName = this.getAssetNameFromUrl(url);
      const error = new Error(`Failed to load asset: ${url}`);
      console.error('Asset loading error:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error, assetName);
      }
    };
  }

  /**
   * Extract asset name from URL for progress tracking
   */
  private getAssetNameFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }

  /**
   * Load a single texture with fallback to colored geometry
   * @param name Asset name for retrieval
   * @param url Asset URL to load from
   * @param fallbackColor Fallback color if texture fails to load
   * @returns Promise that resolves to the loaded texture or fallback
   */
  public async loadTexture(
    name: string, 
    url: string, 
    fallbackColor: number = 0xffffff
  ): Promise<THREE.Texture> {
    // Check if texture is already loaded
    if (this.textures.has(name)) {
      return this.textures.get(name)!;
    }

    // Initialize metadata
    const metadata: AssetMetadata = {
      name,
      url,
      state: AssetLoadState.PENDING,
      retryCount: 0
    };
    this.assetMetadata.set(name, metadata);

    return this.attemptTextureLoad(name, url, fallbackColor, metadata);
  }

  /**
   * Attempt to load texture with retry logic
   */
  private async attemptTextureLoad(
    name: string,
    url: string,
    fallbackColor: number,
    metadata: AssetMetadata
  ): Promise<THREE.Texture> {
    metadata.state = AssetLoadState.LOADING;

    try {
      const texture = await this.loadTextureFromUrl(url);
      
      // Configure texture settings for optimal game rendering
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false; // Disable mipmaps for 2D sprites
      
      this.textures.set(name, texture);
      metadata.state = AssetLoadState.LOADED;
      
      // console.log(`Texture loaded successfully: ${name}`);
      return texture;
      
    } catch (error) {
      metadata.retryCount++;
      metadata.error = error as Error;
      
      if (metadata.retryCount < this.maxRetries) {
        console.warn(`Texture load failed, retrying (${metadata.retryCount}/${this.maxRetries}): ${name}`);
        
        // Exponential backoff for retries
        const delay = Math.pow(2, metadata.retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.attemptTextureLoad(name, url, fallbackColor, metadata);
      } else {
        console.error(`Texture load failed after ${this.maxRetries} attempts: ${name}`, error);
        metadata.state = AssetLoadState.ERROR;
        
        // Create fallback texture with colored geometry
        return this.createFallbackTexture(name, fallbackColor);
      }
    }
  }

  /**
   * Load texture from URL using Three.js TextureLoader
   */
  private loadTextureFromUrl(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => resolve(texture),
        undefined, // onProgress callback handled by LoadingManager
        (error) => reject(error)
      );
    });
  }

  /**
   * Create fallback texture with appropriate sprite design when texture loading fails
   */
  private createFallbackTexture(name: string, color: number): THREE.Texture {
    // console.log(`Creating fallback texture for ${name} with color: #${color.toString(16)}`);
    
    let texture: THREE.Texture;
    
    // Use TextureGenerator for game-specific sprites, fallback to solid color for others
    switch (name) {
      case 'baby-crying':
        texture = TextureGenerator.createBabyTexture();
        break;
      case 'baby-happy':
        texture = TextureGenerator.createHappyBabyTexture();
        break;
      case 'diaper':
        texture = TextureGenerator.createDiaperTexture();
        break;
      case 'poop-regular':
        texture = TextureGenerator.createRegularPoopTexture();
        break;
      case 'poop-fancy':
        texture = TextureGenerator.createFancyPoopTexture();
        break;
      case 'poop-boob':
        texture = TextureGenerator.createBoobPoopTexture();
        break;
      default:
        // Create a simple colored texture for unknown assets
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        
        const context = canvas.getContext('2d')!;
        context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        context.fillRect(0, 0, 32, 32);
        
        texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        break;
    }
    
    this.textures.set(name, texture);
    return texture;
  }

  /**
   * Load multiple textures with progressive loading
   * @param assets Array of asset definitions with name, url, and optional fallback color
   * @returns Promise that resolves when all assets are loaded or failed with fallbacks
   */
  public async loadAssets(assets: Array<{
    name: string;
    url: string;
    fallbackColor?: number;
  }>): Promise<void> {
    // console.log(`Starting to load ${assets.length} assets...`);
    
    this.loadingProgress.total = assets.length;
    this.loadingProgress.loaded = 0;
    this.loadingProgress.percentage = 0;

    // Load all assets concurrently for better performance
    const loadPromises = assets.map(asset => 
      this.loadTexture(asset.name, asset.url, asset.fallbackColor || 0xffffff)
        .then(() => {
          this.loadingProgress.loaded++;
          this.loadingProgress.percentage = (this.loadingProgress.loaded / this.loadingProgress.total) * 100;
          
          if (this.onProgressCallback) {
            this.onProgressCallback(this.loadingProgress);
          }
        })
        .catch(error => {
          console.error(`Failed to load asset ${asset.name}:`, error);
          // Don't throw here - we want to continue loading other assets
        })
    );

    await Promise.allSettled(loadPromises);
    
    // console.log(`Asset loading complete. Loaded: ${this.loadingProgress.loaded}/${this.loadingProgress.total}`);
    
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }

  /**
   * Get loaded texture by name
   * @param name Asset name
   * @returns Texture if loaded, undefined otherwise
   */
  public getTexture(name: string): THREE.Texture | undefined {
    return this.textures.get(name);
  }

  /**
   * Check if texture is loaded
   * @param name Asset name
   * @returns True if texture is loaded
   */
  public isTextureLoaded(name: string): boolean {
    const metadata = this.assetMetadata.get(name);
    return metadata?.state === AssetLoadState.LOADED;
  }

  /**
   * Get asset loading state
   * @param name Asset name
   * @returns Current loading state
   */
  public getAssetState(name: string): AssetLoadState {
    const metadata = this.assetMetadata.get(name);
    return metadata?.state || AssetLoadState.PENDING;
  }

  /**
   * Get current loading progress
   */
  public getLoadingProgress(): LoadingProgress {
    return { ...this.loadingProgress };
  }

  /**
   * Set progress callback for loading updates
   */
  public setProgressCallback(callback: (progress: LoadingProgress) => void): void {
    this.onProgressCallback = callback;
  }

  /**
   * Set completion callback for when all assets are loaded
   */
  public setCompleteCallback(callback: () => void): void {
    this.onCompleteCallback = callback;
  }

  /**
   * Set error callback for asset loading errors
   */
  public setErrorCallback(callback: (error: Error, assetName: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Get all loaded texture names
   */
  public getLoadedTextureNames(): string[] {
    return Array.from(this.textures.keys());
  }

  /**
   * Get loading statistics
   */
  public getLoadingStats(): {
    total: number;
    loaded: number;
    failed: number;
    pending: number;
  } {
    const stats = { total: 0, loaded: 0, failed: 0, pending: 0 };
    
    this.assetMetadata.forEach(metadata => {
      stats.total++;
      switch (metadata.state) {
        case AssetLoadState.LOADED:
          stats.loaded++;
          break;
        case AssetLoadState.ERROR:
          stats.failed++;
          break;
        case AssetLoadState.PENDING:
        case AssetLoadState.LOADING:
          stats.pending++;
          break;
      }
    });
    
    return stats;
  }

  /**
   * Clear all loaded assets and reset state
   */
  public clear(): void {
    // Dispose of all textures to free memory
    this.textures.forEach(texture => {
      texture.dispose();
    });
    
    this.textures.clear();
    this.assetMetadata.clear();
    this.loadingProgress = { loaded: 0, total: 0, percentage: 0 };
  }

  /**
   * Preload essential game assets before game start
   * This method defines the core assets needed for the game
   */
  public async preloadGameAssets(): Promise<void> {
    const gameAssets = [
      {
        name: 'baby-crying',
        url: '/baby-crying-sprite.png',
        fallbackColor: 0xFFB6C1 // Light pink
      },
      {
        name: 'baby-happy',
        url: '/baby-happy-sprite.png',
        fallbackColor: 0xFFB6C1 // Light pink
      },
      {
        name: 'diaper',
        url: '/diaper-sprite.png',
        fallbackColor: 0xFFFFFF // White
      },
      {
        name: 'poop-regular',
        url: '/poop-regular.png',
        fallbackColor: 0x8B4513 // Brown
      },
      {
        name: 'poop-fancy',
        url: '/poop-fancy.png',
        fallbackColor: 0xFFD700 // Gold
      },
      {
        name: 'poop-boob',
        url: '/poop-boob.png',
        fallbackColor: 0xFFB6C1 // Pink
      }
    ];

    await this.loadAssets(gameAssets);
  }

  /**
   * Load placeholder textures immediately without network requests
   * This is useful for development and as a fallback when assets are not available
   */
  public loadPlaceholderTextures(): void {
    // console.log('Loading placeholder textures...');
    
    const placeholderTextures = TextureGenerator.createAllGameTextures();
    
    placeholderTextures.forEach((texture, name) => {
      this.textures.set(name, texture);
      
      // Create metadata for tracking
      const metadata: AssetMetadata = {
        name,
        url: `placeholder://${name}`,
        state: AssetLoadState.LOADED,
        retryCount: 0
      };
      this.assetMetadata.set(name, metadata);
    });
    
    // Update loading progress
    this.loadingProgress = {
      loaded: placeholderTextures.size,
      total: placeholderTextures.size,
      percentage: 100
    };
    
    // console.log(`Loaded ${placeholderTextures.size} placeholder textures`);
    
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }
}