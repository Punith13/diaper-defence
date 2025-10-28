import { KeyboardHandler } from './KeyboardHandler';
import { TouchHandler } from './TouchHandler';

/**
 * Unified input manager that handles both keyboard and touch input
 * Implements requirements 1.1, 5.1, 5.2 - unified input handling for diaper movement
 */
export class InputManager {
  private keyboardHandler: KeyboardHandler;
  private touchHandler: TouchHandler;
  private isActive: boolean = false;
  
  // Movement state
  private leftPressed: boolean = false;
  private rightPressed: boolean = false;
  private touchDelta: number = 0;
  
  // Configuration
  private keyboardMovementSpeed: number = 50; // Units to move per key press
  private touchSensitivity: number = 2.0; // Touch movement sensitivity multiplier

  constructor(canvas: HTMLCanvasElement) {
    this.keyboardHandler = new KeyboardHandler();
    this.touchHandler = new TouchHandler(canvas);
    
    // Configure touch handler
    this.touchHandler.setDeadZone(15); // 15 pixel dead zone
    this.touchHandler.setMovementScale(this.touchSensitivity);
  }

  /**
   * Activate input handling
   */
  public activate(): void {
    this.isActive = true;
    this.keyboardHandler.activate();
    this.touchHandler.activate();
  }

  /**
   * Deactivate input handling
   */
  public deactivate(): void {
    this.isActive = false;
    this.keyboardHandler.deactivate();
    this.touchHandler.deactivate();
    this.resetInputState();
  }

  /**
   * Update input state - should be called every frame
   */
  public update(): void {
    if (!this.isActive) return;

    // Update keyboard input state
    this.leftPressed = this.keyboardHandler.isLeftPressed();
    this.rightPressed = this.keyboardHandler.isRightPressed();
    
    // Update touch input state
    this.touchDelta = this.touchHandler.getTouchDelta();
  }

  /**
   * Check if left movement is active (keyboard or touch)
   */
  public isLeftActive(): boolean {
    return this.leftPressed || this.touchDelta < -this.touchHandler.getDeadZone();
  }

  /**
   * Check if right movement is active (keyboard or touch)
   */
  public isRightActive(): boolean {
    return this.rightPressed || this.touchDelta > this.touchHandler.getDeadZone();
  }

  /**
   * Get movement direction (-1 for left, 0 for none, 1 for right)
   */
  public getMovementDirection(): number {
    // Keyboard input takes priority over touch
    if (this.leftPressed && !this.rightPressed) {
      return -1;
    } else if (this.rightPressed && !this.leftPressed) {
      return 1;
    }
    
    // If no keyboard input, check touch
    if (Math.abs(this.touchDelta) > this.touchHandler.getDeadZone()) {
      return Math.sign(this.touchDelta);
    }
    
    return 0;
  }

  /**
   * Get movement intensity (0 to 1, where 1 is maximum movement)
   */
  public getMovementIntensity(): number {
    // For keyboard, it's either 0 or 1
    if (this.leftPressed || this.rightPressed) {
      return 1.0;
    }
    
    // For touch, calculate based on delta and screen width
    if (Math.abs(this.touchDelta) > this.touchHandler.getDeadZone()) {
      // Normalize touch delta to 0-1 range (assuming max useful delta is 200 pixels)
      const normalizedDelta = Math.min(Math.abs(this.touchDelta) / 200, 1.0);
      return normalizedDelta;
    }
    
    return 0;
  }

  /**
   * Get keyboard movement amount for discrete movement
   */
  public getKeyboardMovementAmount(): number {
    return this.keyboardMovementSpeed;
  }

  /**
   * Get touch position for absolute positioning
   * Returns null if touch is not active
   */
  public getTouchPosition(): { x: number; y: number } | null {
    return this.touchHandler.getTouchPosition();
  }

  /**
   * Get touch delta for relative movement
   */
  public getTouchDelta(): number {
    return this.touchDelta;
  }

  /**
   * Check if touch is currently active
   */
  public isTouchActive(): boolean {
    return this.touchHandler.isTouchActive();
  }

  /**
   * Check if keyboard input is active
   */
  public isKeyboardActive(): boolean {
    return this.keyboardHandler.isKeyboardActive();
  }

  /**
   * Check if any input is currently active
   */
  public hasActiveInput(): boolean {
    return this.isLeftActive() || this.isRightActive() || this.isTouchActive();
  }

  /**
   * Reset input state
   */
  private resetInputState(): void {
    this.leftPressed = false;
    this.rightPressed = false;
    this.touchDelta = 0;
  }

  /**
   * Set keyboard movement speed
   * @param speed Movement speed in units per key press
   */
  public setKeyboardMovementSpeed(speed: number): void {
    this.keyboardMovementSpeed = Math.max(1, speed);
  }

  /**
   * Set touch sensitivity
   * @param sensitivity Touch movement sensitivity multiplier
   */
  public setTouchSensitivity(sensitivity: number): void {
    this.touchSensitivity = Math.max(0.1, sensitivity);
    this.touchHandler.setMovementScale(this.touchSensitivity);
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): {
    keyboardMovementSpeed: number;
    touchSensitivity: number;
    touchDeadZone: number;
  } {
    return {
      keyboardMovementSpeed: this.keyboardMovementSpeed,
      touchSensitivity: this.touchSensitivity,
      touchDeadZone: this.touchHandler.getDeadZone()
    };
  }

  /**
   * Check if input manager is active
   */
  public isInputActive(): boolean {
    return this.isActive;
  }
  
  /**
   * Get normalized movement value (-1 to 1) for smooth interpolation
   * Combines keyboard and touch input with proper prioritization
   */
  public getNormalizedMovement(): number {
    if (!this.isActive) return 0;
    
    // Keyboard input takes priority and returns discrete values
    if (this.leftPressed && !this.rightPressed) {
      return -1.0;
    } else if (this.rightPressed && !this.leftPressed) {
      return 1.0;
    }
    
    // Touch input provides continuous values
    if (Math.abs(this.touchDelta) > this.touchHandler.getDeadZone()) {
      // Normalize touch delta to -1 to 1 range
      const maxTouchDelta = 200; // Maximum useful touch delta in pixels
      return Math.max(-1, Math.min(1, this.touchDelta / maxTouchDelta));
    }
    
    return 0;
  }
  
  /**
   * Check if input is providing continuous movement (touch)
   */
  public isContinuousInput(): boolean {
    return this.isTouchActive() && Math.abs(this.touchDelta) > this.touchHandler.getDeadZone();
  }
  
  /**
   * Check if input is providing discrete movement (keyboard)
   */
  public isDiscreteInput(): boolean {
    return (this.leftPressed || this.rightPressed) && !this.isTouchActive();
  }
  
  /**
   * Validate input state and reset if inconsistent
   */
  public validateInputState(): boolean {
    if (!this.isActive) {
      this.resetInputState();
      return false;
    }
    
    // Check if touch handler is in valid state
    if (this.touchHandler.isTouchActive() && !this.touchHandler.isTouchHandlerActive()) {
      this.touchHandler.deactivate();
      this.touchHandler.activate();
    }
    
    // Check if keyboard handler is in valid state
    if (!this.keyboardHandler.isKeyboardActive() && this.isActive) {
      this.keyboardHandler.deactivate();
      this.keyboardHandler.activate();
    }
    
    return true;
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.isActive = false;
    this.keyboardHandler.destroy();
    this.touchHandler.destroy();
    this.resetInputState();
  }
}