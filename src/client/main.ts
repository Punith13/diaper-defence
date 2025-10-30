import * as THREE from 'three';
import { InputManager } from './input';
import { Diaper, Baby, Poop, PoopType } from './entities';
import { CollisionSystem, ScoreSystem, GameStateManager, GameState, PoopPool, ErrorHandler, ErrorType, ErrorSeverity, PerformanceManager, QualitySettings } from './systems';
import { ParticleSystem, ParticleType } from './effects';
import { GameAudio } from './audio';
import { AssetManager } from './assets';

// Core Game Engine Interface
interface GameEngine {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  gameState: GameState;
  
  init(): void;
  update(deltaTime: number): void;
  render(): void;
  resize(width: number, height: number): void;
}

// Game Configuration
interface GameConfig {
  scene: {
    width: number;
    height: number;
    bounds: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
  };
}

// Game Engine Implementation
class DiaperDefenseEngine implements GameEngine {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  gameState: GameState;
  
  private config: GameConfig;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  
  // Game systems
  private gameStateManager: GameStateManager;
  private collisionSystem: CollisionSystem;
  private scoreSystem: ScoreSystem;
  private inputManager: InputManager;
  private particleSystem: ParticleSystem;
  public gameAudio: GameAudio;
  private assetManager: AssetManager;
  private poopPool: PoopPool;
  private errorHandler: ErrorHandler;
  private performanceManager: PerformanceManager;
  
  // Game entities
  private diaper: Diaper | null = null;
  private baby: Baby | null = null;
  private poops: Poop[] = [];

  constructor(canvas: HTMLCanvasElement) {
    // Initialize game configuration
    this.config = {
      scene: {
        width: 800,
        height: 600,
        bounds: {
          left: -400,
          right: 400,
          top: 300,
          bottom: -300
        }
      }
    };

    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    // Setup OrthographicCamera for 2D-style gameplay
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = this.config.scene.height;
    this.camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      1000
    );
    this.camera.position.z = 10;

    // Initialize performance manager first to get quality settings
    this.errorHandler = ErrorHandler.getInstance();
    this.performanceManager = PerformanceManager.getInstance();
    const qualitySettings = this.performanceManager.getQualitySettings();
    
    // Setup renderer with performance-optimized settings
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: qualitySettings.antialiasing, 
      canvas,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(qualitySettings.pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x87CEEB, 1);

    // Initialize remaining game systems
    this.gameStateManager = GameStateManager.getInstance();
    this.collisionSystem = CollisionSystem.getInstance();
    this.scoreSystem = ScoreSystem.getInstance();
    try {
      this.inputManager = new InputManager(canvas);
    } catch (error) {
      this.errorHandler.handleError(
        ErrorType.INPUT,
        ErrorSeverity.HIGH,
        'Failed to initialize input system',
        error instanceof Error ? error : new Error(String(error)),
        { canvas }
      );
      throw error; // Input is critical, so we need to throw
    }
    this.particleSystem = new ParticleSystem(this.scene);
    try {
      this.gameAudio = GameAudio.getInstance();
    } catch (error) {
      this.errorHandler.handleError(
        ErrorType.AUDIO_CONTEXT,
        ErrorSeverity.MEDIUM,
        'Failed to initialize audio system',
        error instanceof Error ? error : new Error(String(error)),
        { audioContext: (window as any).AudioContext || (window as any).webkitAudioContext }
      );
      // Create a fallback audio instance that does nothing
      this.gameAudio = GameAudio.getInstance(); // This should still work as it has fallbacks
    }
    this.assetManager = AssetManager.getInstance();
    this.poopPool = new PoopPool(this.scene, this.config.scene.bounds.bottom);
    
    // Initialize game state
    this.gameState = this.gameStateManager.getCurrentState();
    
    // Setup system callbacks
    this.setupSystemCallbacks();

    this.init();
  }

  init(): void {
    // Setup lighting for 2D-style rendering
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(0, 0, 1);
    this.scene.add(directionalLight);

    // Initialize asset management system
    this.initializeAssets();

    // Initialize game entities
    this.initializeEntities();

    // Initialize audio system (will be activated on user interaction)
    this.initializeAudio();

    // console.log('Diaper Defense game engine initialized');
  }

  /**
   * Initialize asset management system
   */
  private initializeAssets(): void {
    // Set up asset loading callbacks
    this.assetManager.setProgressCallback((progress) => {
      // console.log(`Asset loading progress: ${progress.percentage.toFixed(1)}% (${progress.loaded}/${progress.total})`);
      if (progress.currentAsset) {
        // console.log(`Loading: ${progress.currentAsset}`);
      }
    });

    this.assetManager.setCompleteCallback(() => {
      // console.log('All assets loaded successfully');
    });

    this.assetManager.setErrorCallback((error, assetName) => {
      this.errorHandler.handleError(
        ErrorType.ASSET_LOADING,
        ErrorSeverity.MEDIUM,
        `Failed to load asset: ${assetName}`,
        error,
        { assetName, assetManager: this.assetManager }
      );
    });

    // Load placeholder textures immediately for development
    // In production, this could be replaced with actual asset loading
    this.assetManager.loadPlaceholderTextures();
  }

  /**
   * Initialize audio system
   */
  private async initializeAudio(): Promise<void> {
    try {
      await this.gameAudio.init();
      // console.log('Audio system initialized');
    } catch (error) {
      console.error('Failed to initialize audio system:', error);
    }
  }

  /**
   * Setup callbacks between game systems
   */
  private setupSystemCallbacks(): void {
    // Score system callbacks
    this.scoreSystem.onGameOver(() => {
      this.gameStateManager.endGame();
    });

    this.scoreSystem.onScoreUpdate((score) => {
      this.updateScoreDisplay(score);
    });

    this.scoreSystem.onMissUpdate((misses, consecutive) => {
      this.updateMissDisplay(misses, consecutive);
    });

    // Game state manager callbacks
    this.gameStateManager.onStateChange(GameState.PLAY, () => {
      this.onGameStart();
    });

    this.gameStateManager.onStateChange(GameState.GAME_OVER, () => {
      this.onGameOver();
    });

    this.gameStateManager.onReset(() => {
      this.resetGameEntities();
    });

    // Performance manager callbacks
    this.performanceManager.setQualityChangeCallback((settings) => {
      this.applyQualitySettings(settings);
    });
  }

  private initializeEntities(): void {
    // Add a simple ground line
    const groundGeometry = new THREE.PlaneGeometry(this.config.scene.width, 20);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown ground
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = this.config.scene.bounds.bottom + 10;
    this.scene.add(ground);

    // Initialize baby entity with shooting callback - positioned below score display
    this.baby = new Baby(
      this.scene,
      0, // X position (center)
      this.config.scene.bounds.top - 120, // Y position - moved down to be visible below score
      (baby: Baby) => this.onBabyShoot(baby) // Shooting callback
    );

    // Initialize diaper entity with proper bounds
    this.diaper = new Diaper(
      this.scene,
      0, // Start at center
      this.config.scene.bounds.bottom + 60, // Y position
      { 
        left: this.config.scene.bounds.left + 40, // Leave some margin
        right: this.config.scene.bounds.right - 40 
      }
    );
  }

  update(deltaTime: number): void {
    try {
      // Update game state from manager
      this.gameState = this.gameStateManager.getCurrentState();
      
      // Clear error display when game is running normally
      this.errorHandler.clearErrorDisplay();
      
      // Update input system and validate state
      this.inputManager.update();
      this.inputManager.validateInputState();
      
      // Only update game entities during PLAY state
      if (this.gameState === GameState.PLAY) {
        this.updateGameEntities(deltaTime);
        this.checkCollisions();
        this.cleanupEntities();
      }
    } catch (error) {
      this.errorHandler.handleError(
        ErrorType.GAME_STATE,
        ErrorSeverity.HIGH,
        'Game update error occurred',
        error instanceof Error ? error : new Error(String(error)),
        { gameState: this.gameState, deltaTime }
      );
    }
  }

  /**
   * Update all game entities
   */
  private updateGameEntities(deltaTime: number): void {
    // Update diaper based on input
    if (this.diaper) {
      this.updateDiaperMovement(deltaTime);
      this.diaper.update(deltaTime);
    }

    // Update baby
    if (this.baby) {
      this.baby.update(deltaTime);
    }

    // Update all poop entities
    this.poops.forEach(poop => {
      if (poop.isActive) {
        poop.update(deltaTime);
      }
    });
    
    // Update particle system
    this.particleSystem.update(deltaTime);
  }

  /**
   * Check collisions between game entities
   */
  private checkCollisions(): void {
    if (!this.diaper) return;

    // Check diaper-poop collisions
    const collidingPoop = this.collisionSystem.checkDiaperPoopCollisions(this.diaper, this.poops);
    
    if (collidingPoop) {
      this.handlePoopCatch(collidingPoop);
    }

    // Check for missed poops (fallen off screen)
    this.checkMissedPoops();
  }

  /**
   * Handle when a poop is caught by the diaper with enhanced visual effects
   */
  private handlePoopCatch(poop: Poop): void {
    // console.log(`Caught ${poop.type} poop!`);
    
    // Trigger visual effects
    this.diaper?.triggerCatchAnimation();
    poop.triggerCatchAnimation();
    
    // Play appropriate sound effects
    if (poop.type === PoopType.FANCY) {
      this.gameAudio.playFancyCatchSound();
    } else if (poop.type === PoopType.REGULAR) {
      this.gameAudio.playPlopSound();
    } else if (poop.type === PoopType.BOMB) {
      this.gameAudio.playWarningSound();
    }
    
    // Create enhanced particle effects based on poop type
    if (poop.type === PoopType.FANCY) {
      // Fancy poop gets spectacular effects
      this.particleSystem.createEffect(ParticleType.CATCH_SPARKLE, poop.position, 12, 80);
      this.particleSystem.createEffect(ParticleType.SCORE_POP, poop.position, 6, 50);
      
      // Additional sparkle burst after a delay
      setTimeout(() => {
        this.particleSystem.createEffect(ParticleType.CATCH_SPARKLE, poop.position, 8, 60);
      }, 200);
      
    } else if (poop.type === PoopType.REGULAR) {
      // Regular poop gets standard effects
      this.particleSystem.createEffect(ParticleType.CATCH_SPARKLE, poop.position, 6, 50);
      this.particleSystem.createEffect(ParticleType.SCORE_POP, poop.position, 4, 35);
      
    } else if (poop.type === PoopType.BOMB) {
      // Bomb poop gets ominous effects before game over
      this.particleSystem.createEffect(ParticleType.MISS_SPLASH, poop.position, 10, 70);
      
      // Create warning effect with red particles
      setTimeout(() => {
        this.particleSystem.createEffect(ParticleType.MISS_SPLASH, poop.position, 8, 60);
      }, 100);
    }
    
    // Add score based on poop type
    const points = this.scoreSystem.addScore(poop.type);
    
    // Create additional score celebration effects for high-value catches
    if (points >= 50) {
      // Create a delayed celebration burst
      setTimeout(() => {
        this.particleSystem.createEffect(ParticleType.SCORE_POP, 
          new THREE.Vector3(poop.position.x, poop.position.y + 30, poop.position.z), 
          5, 40);
      }, 300);
    }
    
    // Check if catching this poop causes game over (bomb poop)
    if (this.scoreSystem.shouldGameOverOnCatch(poop.type)) {
      // console.log('Game over: Caught bomb poop!');
      
      // Create dramatic game over particle effect
      setTimeout(() => {
        this.particleSystem.createEffect(ParticleType.MISS_SPLASH, 
          new THREE.Vector3(0, 0, 0), 15, 150);
      }, 500);
      
      this.gameStateManager.endGame();
      return; // Don't destroy poop here, let the animation handle it
    }
    
    // console.log(`Earned ${points} points! Total score: ${this.scoreSystem.getScore()}`);
    
    // Note: poop.destroy() is now called by the catch animation
  }

  /**
   * Check for poops that have fallen off screen (misses) with enhanced effects
   */
  private checkMissedPoops(): void {
    this.poops.forEach(poop => {
      if (poop.isActive && poop.isOffScreen()) {
        // console.log(`POOP MISSED! Type: ${poop.type}, Position Y: ${poop.position.y}, Screen Bottom: ${this.config.scene.bounds.bottom}`);
        
        // Play splat sound for missed poop
        this.gameAudio.playSplatSound();
        
        // Trigger visual effects for miss
        this.diaper?.triggerMissAnimation();
        
        // Create enhanced miss effects based on poop type
        const splashPosition = new THREE.Vector3(poop.position.x, this.config.scene.bounds.bottom + 20, 0);
        
        if (poop.type === PoopType.FANCY) {
          // Missing fancy poop is more dramatic
          this.particleSystem.createEffect(ParticleType.MISS_SPLASH, splashPosition, 10, 70);
          
          // Additional splash effect for emphasis
          setTimeout(() => {
            this.particleSystem.createEffect(ParticleType.MISS_SPLASH, splashPosition, 6, 50);
          }, 150);
          
        } else if (poop.type === PoopType.REGULAR) {
          // Standard miss effect
          this.particleSystem.createEffect(ParticleType.MISS_SPLASH, splashPosition, 7, 55);
          
        } else if (poop.type === PoopType.BOMB) {
          // Missing bomb poop creates a different effect (relief?)
          this.particleSystem.createEffect(ParticleType.SHOOT_PUFF, splashPosition, 8, 60);
        }
        
        // Only count misses for regular and fancy poop (missing bomb poop is actually good!)
        let gameOver = false;
        if (poop.type === PoopType.REGULAR || poop.type === PoopType.FANCY) {
          // console.log(`BEFORE MISS: Total misses: ${this.scoreSystem.getMisses()}, Consecutive: ${this.scoreSystem.getConsecutiveMisses()}`);
          gameOver = this.scoreSystem.addMiss();
          // console.log(`AFTER MISS: Type: ${poop.type}, Total misses: ${this.scoreSystem.getMisses()}, Consecutive: ${this.scoreSystem.getConsecutiveMisses()}, Game Over: ${gameOver}`);
        } else if (poop.type === PoopType.BOMB) {
          // Missing bomb poop is good - reset consecutive misses
          // console.log('Bomb poop missed - that\'s good! Resetting consecutive misses.');
          // console.log(`BEFORE RESET: Consecutive misses: ${this.scoreSystem.getConsecutiveMisses()}`);
          this.scoreSystem.resetConsecutiveMisses();
          // console.log(`AFTER RESET: Consecutive misses: ${this.scoreSystem.getConsecutiveMisses()}`);
        }
        
        // Remove the missed poop
        poop.destroy();
        
        // Check if this miss causes game over
        if (gameOver) {
          // console.log('Game over: Too many consecutive misses!');
          
          // Create dramatic game over effect
          setTimeout(() => {
            this.particleSystem.createEffect(ParticleType.MISS_SPLASH, 
              new THREE.Vector3(0, this.config.scene.bounds.bottom + 50, 0), 
              20, 200);
          }, 200);
          
          this.gameStateManager.endGame();
        }
      }
    });
  }

  /**
   * Clean up destroyed entities
   */
  private cleanupEntities(): void {
    // Remove inactive poops from array
    this.poops = this.poops.filter(poop => poop.isActive);
  }

  /**
   * Callback when baby shoots a poop with enhanced visual effects
   */
  private onBabyShoot(baby: Baby): void {
    if (this.gameState !== GameState.PLAY) return;

    // Determine poop type first to set baby expression
    const poopType = Poop.createRandomType(this.scoreSystem.getScore());
    
    // Set baby expression based on poop type
    baby.setExpressionForPoopType(poopType);

    // Play shooting sound effect
    this.gameAudio.playSplootSound();

    // Create enhanced shooting particle effect
    this.particleSystem.createEffect(ParticleType.SHOOT_PUFF, baby.position, 6, 40);
    
    // Additional puff effect slightly delayed for more dramatic shooting
    setTimeout(() => {
      this.particleSystem.createEffect(ParticleType.SHOOT_PUFF, 
        new THREE.Vector3(baby.position.x, baby.position.y - 15, baby.position.z), 
        4, 25);
    }, 100);

    // Create new poop at baby's position with predetermined type using object pool
    const poop = this.poopPool.getPoop(
      baby.position.x,
      baby.position.y - 30, // Slightly below baby
      poopType as PoopType
    );

    // Check entity limits for performance
    const qualitySettings = this.performanceManager.getQualitySettings();
    if (this.poops.length >= qualitySettings.maxEntities) {
      // Remove oldest poop to make room
      const oldestPoop = this.poops.shift();
      if (oldestPoop) {
        oldestPoop.destroy();
      }
    }
    
    this.poops.push(poop);
    
    // Create special effects based on poop type when shot
    if (poop.type === PoopType.FANCY) {
      // Fancy poop gets a golden trail effect
      setTimeout(() => {
        this.particleSystem.createEffect(ParticleType.CATCH_SPARKLE, 
          new THREE.Vector3(poop.position.x, poop.position.y + 20, poop.position.z), 
          3, 20);
      }, 200);
    } else if (poop.type === PoopType.BOMB) {
      // Bomb poop gets an ominous effect
      setTimeout(() => {
        this.particleSystem.createEffect(ParticleType.MISS_SPLASH, 
          new THREE.Vector3(poop.position.x, poop.position.y + 15, poop.position.z), 
          2, 15);
      }, 300);
    }
    
    // Reset baby expression after a short delay
    setTimeout(() => {
      if (baby.isActive) {
        baby.resetExpression();
      }
    }, 1000);
    
    // console.log(`Baby shot ${poop.type} poop! Total poops: ${this.poops.length}`);
  }

  /**
   * Callback when game starts
   */
  private onGameStart(): void {
    // console.log('Game started!');
    this.scoreSystem.reset();
    this.resetGameEntities();
    
    // Start background music
    this.gameAudio.startBackgroundMusic().catch(console.error);
  }

  /**
   * Callback when game ends
   */
  private onGameOver(): void {
    // console.log('Game over!');
    const stats = this.scoreSystem.getStats();
    // console.log('Final stats:', stats);
    
    // Play game over sound and stop background music
    this.gameAudio.playFailSound();
    this.gameAudio.stopBackgroundMusic();
    
    // Update final score display
    const finalScoreElement = document.getElementById('final-score-value');
    if (finalScoreElement) {
      finalScoreElement.textContent = stats.score.toString();
    }
    
    // Show game over screen
    showGameOver();
  }

  /**
   * Reset all game entities to initial state
   */
  private resetGameEntities(): void {
    // console.log('Resetting game entities');
    
    // Reset diaper
    if (this.diaper) {
      this.diaper.reset();
    }

    // Reset baby
    if (this.baby) {
      this.baby.reset();
    }

    // Clear all poops
    this.poops.forEach(poop => poop.destroy());
    this.poops = [];
    
    // Clear object pool (returns all objects to inactive state)
    // Note: We don't clear the pool entirely to maintain performance benefits
    
    // Clear all particles
    this.particleSystem.clear();
  }

  /**
   * Apply quality settings to renderer and systems
   */
  private applyQualitySettings(settings: QualitySettings): void {
    try {
      // Apply renderer settings
      this.renderer.setPixelRatio(settings.pixelRatio);
      
      // Update particle system settings
      this.particleSystem.setMaxParticles(settings.particleCount);
      
      // Apply entity limits (this would be used in entity spawning logic)
      // The maxEntities setting is used by the game logic to limit concurrent entities
      
      console.log('Applied quality settings:', settings);
    } catch (error) {
      this.errorHandler.handleError(
        ErrorType.RENDERING,
        ErrorSeverity.MEDIUM,
        'Failed to apply quality settings',
        error instanceof Error ? error : new Error(String(error)),
        { settings }
      );
    }
  }

  /**
   * Update score display in UI
   */
  private updateScoreDisplay(score: number): void {
    const scoreElement = document.getElementById('score-value');
    if (scoreElement) {
      scoreElement.textContent = score.toString();
    }
  }

  /**
   * Update miss display in UI
   */
  private updateMissDisplay(misses: number, consecutive: number): void {
    // console.log(`UI UPDATE: Updating miss display - Total: ${misses}, Consecutive: ${consecutive}`);
    const missElement = document.getElementById('miss-value');
    if (missElement) {
      missElement.textContent = `${misses} (${consecutive} consecutive)`;
      // console.log(`UI UPDATE: Miss element updated to: ${missElement.textContent}`);
    } else {
      // console.log('UI UPDATE: Miss element not found!');
    }
  }
  
  private updateDiaperMovement(_deltaTime: number): void {
    if (!this.diaper || !this.inputManager.isInputActive()) return;
    
    // Input validation - ensure input manager is properly initialized
    if (!this.inputManager.hasActiveInput()) return;
    
    // Get movement direction and intensity from input manager
    const movementDirection = this.inputManager.getMovementDirection();
    const movementIntensity = this.inputManager.getMovementIntensity();
    
    // Handle continuous movement based on input type
    if (this.inputManager.isTouchActive()) {
      // Touch input - use absolute positioning with smooth interpolation
      const touchPosition = this.inputManager.getTouchPosition();
      if (touchPosition && this.validateTouchInput(touchPosition)) {
        const worldX = this.screenToWorldX(touchPosition.x);
        this.diaper.setTargetX(worldX);
      }
    } else if (this.inputManager.isKeyboardActive() && movementDirection !== 0) {
      // Keyboard input - use relative movement with smooth interpolation
      const currentTargetX = this.diaper.getTargetX();
      const movementAmount = this.inputManager.getKeyboardMovementAmount() * movementIntensity;
      const newTargetX = currentTargetX + (movementDirection * movementAmount);
      
      // Apply boundary checking before setting target
      const bounds = this.diaper.getMovementBounds();
      const clampedTargetX = Math.max(bounds.left, Math.min(bounds.right, newTargetX));
      
      this.diaper.setTargetX(clampedTargetX);
    }
    
    // Additional boundary validation - ensure diaper stays within scene bounds
    this.validateDiaperPosition();
  }
  
  /**
   * Validate touch input to prevent invalid movements
   * @param touchPosition Touch position to validate
   * @returns True if touch input is valid
   */
  private validateTouchInput(touchPosition: { x: number; y: number }): boolean {
    // Ensure touch position is within canvas bounds
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    
    return touchPosition.x >= 0 && 
           touchPosition.x <= rect.width && 
           touchPosition.y >= 0 && 
           touchPosition.y <= rect.height;
  }
  
  /**
   * Validate and correct diaper position to ensure it stays within bounds
   */
  private validateDiaperPosition(): void {
    if (!this.diaper) return;
    
    const bounds = this.diaper.getMovementBounds();
    const currentX = this.diaper.position.x;
    const targetX = this.diaper.getTargetX();
    
    // Ensure current position is within bounds
    if (currentX < bounds.left || currentX > bounds.right) {
      const clampedX = Math.max(bounds.left, Math.min(bounds.right, currentX));
      this.diaper.setTargetX(clampedX);
    }
    
    // Ensure target position is within bounds
    if (targetX < bounds.left || targetX > bounds.right) {
      const clampedTargetX = Math.max(bounds.left, Math.min(bounds.right, targetX));
      this.diaper.setTargetX(clampedTargetX);
    }
  }
  
  private screenToWorldX(screenX: number): number {
    // Convert screen X coordinate to world X coordinate
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const normalizedX = (screenX / rect.width) * 2 - 1; // Convert to -1 to 1 range
    
    // Convert to world coordinates using camera frustum
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = this.config.scene.height;
    const worldX = normalizedX * (frustumSize * aspect) / 2;
    
    return worldX;
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number): void {
    const aspect = width / height;
    const frustumSize = this.config.scene.height;
    
    this.camera.left = (frustumSize * aspect) / -2;
    this.camera.right = (frustumSize * aspect) / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = frustumSize / -2;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }

  start(): void {
    this.isRunning = true;
    
    // Start game through state manager
    this.gameStateManager.startGame();
    this.gameState = this.gameStateManager.getCurrentState();
    
    // Configure and activate input handling when game starts
    this.configureInputSystem();
    this.inputManager.activate();
    
    this.gameLoop(0);
  }
  
  /**
   * Configure input system for optimal diaper movement
   */
  private configureInputSystem(): void {
    // Configure keyboard movement speed based on diaper speed
    if (this.diaper) {
      const diaperSpeed = this.diaper.getSpeed();
      const keyboardMovementAmount = Math.max(30, diaperSpeed * 0.15); // 15% of diaper speed per key press
      this.inputManager.setKeyboardMovementSpeed(keyboardMovementAmount);
    }
    
    // Configure touch sensitivity for responsive movement
    this.inputManager.setTouchSensitivity(1.5);
    
    // Validate input configuration
    // const config = this.inputManager.getConfiguration();
    // console.log('Input system configured:', config);
  }

  stop(): void {
    this.isRunning = false;
    
    // Deactivate input handling when game stops
    this.inputManager.deactivate();
  }

  /**
   * Reset and restart the game
   */
  public resetGame(): void {
    this.gameStateManager.resetGame();
  }

  private gameLoop = (currentTime: number): void => {
    if (!this.isRunning) return;

    try {
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      const updateStart = performance.now();
      this.update(deltaTime);
      const updateTime = performance.now() - updateStart;

      const renderStart = performance.now();
      this.render();
      const renderTime = performance.now() - renderStart;

      // Update performance metrics
      this.performanceManager.updateMetrics(deltaTime, renderTime, updateTime);

      requestAnimationFrame(this.gameLoop);
    } catch (error) {
      this.errorHandler.handleError(
        ErrorType.RENDERING,
        ErrorSeverity.HIGH,
        'Game loop error occurred',
        error instanceof Error ? error : new Error(String(error)),
        { gameState: this.gameState, currentTime, deltaTime: currentTime - this.lastTime }
      );
      
      // Try to continue the game loop after a brief delay
      setTimeout(() => {
        if (this.isRunning) {
          requestAnimationFrame(this.gameLoop);
        }
      }, 100);
    }
  };
}

// Initialize the game
const canvas = document.getElementById('bg') as HTMLCanvasElement;
const gameEngine = new DiaperDefenseEngine(canvas);

// UI Elements
const splashScreen = document.getElementById('splash-screen') as HTMLDivElement;
const playButton = document.getElementById('play-button') as HTMLButtonElement;
const gameHud = document.getElementById('game-hud') as HTMLDivElement;
const gameOverScreen = document.getElementById('game-over-screen') as HTMLDivElement;
const restartButton = document.getElementById('restart-button') as HTMLButtonElement;

// Enhanced Game State Management with sophisticated smooth transitions
function showSplashScreen(): void {
  // console.log('Transitioning to splash screen');
  
  // Add exit animations to other screens
  gameHud.classList.remove('fade-in', 'slide-in-right');
  gameHud.classList.add('fade-out', 'slide-out-left');
  gameOverScreen.classList.remove('fade-in', 'scale-in', 'bounce-in');
  gameOverScreen.classList.add('fade-out');
  
  setTimeout(() => {
    // Hide other screens and show splash
    splashScreen.style.display = 'flex';
    gameHud.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    // Clear previous animations and add entrance animation
    splashScreen.classList.remove('fade-out', 'slide-out-right');
    splashScreen.classList.add('fade-in', 'scale-in');
    
    // Start ambient music for splash screen (if audio is ready)
    if (gameEngine.gameAudio.isReady()) {
      gameEngine.gameAudio.startAmbientMusic().catch(console.error);
    }
    
    // Add pulse animation to play button after entrance
    setTimeout(() => {
      playButton.classList.add('pulse');
    }, 400);
    
  }, 300);
}

function showGameHud(): void {
  // console.log('Transitioning to game HUD');
  
  // Add exit animations to other screens
  splashScreen.classList.remove('fade-in', 'scale-in');
  splashScreen.classList.add('fade-out', 'slide-out-left');
  gameOverScreen.classList.remove('fade-in', 'scale-in', 'bounce-in');
  gameOverScreen.classList.add('fade-out');
  
  // Remove pulse from play button
  playButton.classList.remove('pulse');
  
  setTimeout(() => {
    // Hide other screens and show game HUD
    splashScreen.style.display = 'none';
    gameHud.style.display = 'flex';
    gameOverScreen.style.display = 'none';
    
    // Clear previous animations and add entrance animation
    gameHud.classList.remove('fade-out', 'slide-out-right');
    gameHud.classList.add('fade-in', 'slide-in-right');
    
  }, 300);
}

function showGameOver(): void {
  // console.log('Transitioning to game over screen');
  
  // Add exit animations to other screens
  splashScreen.classList.remove('fade-in', 'scale-in');
  splashScreen.classList.add('fade-out');
  gameHud.classList.remove('fade-in', 'slide-in-right');
  gameHud.classList.add('fade-out', 'shake'); // Add shake effect for dramatic game over
  
  setTimeout(() => {
    // Hide other screens and show game over
    splashScreen.style.display = 'none';
    gameHud.style.display = 'none';
    gameOverScreen.style.display = 'flex';
    
    // Clear previous animations and add dramatic entrance animation
    gameOverScreen.classList.remove('fade-out');
    gameOverScreen.classList.add('fade-in', 'bounce-in');
    
    // Add pulse animation to restart button after entrance
    setTimeout(() => {
      restartButton.classList.add('pulse');
    }, 600);
    
    // Deactivate input when game is over
    gameEngine.stop();
    
  }, 400); // Slightly longer delay for dramatic effect
}

// Export for future use in game logic
(window as any).showGameOver = showGameOver;

// Enhanced Event Listeners with animation management
playButton.addEventListener('click', async () => {
  // Remove pulse animation when clicked
  playButton.classList.remove('pulse');
  
  // Add click feedback animation
  playButton.classList.add('scale-in');
  
  // Activate audio on user interaction
  await gameEngine.gameAudio.resumeAudio();
  
  setTimeout(() => {
    showGameHud();
    gameEngine.start();
    // console.log('Game started from splash screen');
    
    // Clean up button animation
    playButton.classList.remove('scale-in');
  }, 100);
});

restartButton.addEventListener('click', async () => {
  // Remove pulse animation when clicked
  restartButton.classList.remove('pulse');
  
  // Add click feedback animation
  restartButton.classList.add('bounce-in');
  
  // Ensure audio is active
  await gameEngine.gameAudio.resumeAudio();
  
  setTimeout(() => {
    showGameHud();
    gameEngine.resetGame();
    gameEngine.start();
    // console.log('Game restarted');
    
    // Clean up button animation
    restartButton.classList.remove('bounce-in');
  }, 100);
});

// Handle window resize
window.addEventListener('resize', () => {
  gameEngine.resize(window.innerWidth, window.innerHeight);
});

// Initialize with splash screen
showSplashScreen();

// console.log('Diaper Defense game initialized');
