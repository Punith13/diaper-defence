/**
 * Touch input handler for mobile devices in Diaper Defense game
 * Implements requirements 5.2, 5.3 - touch controls for diaper movement
 */

interface TouchState {
  isActive: boolean;
  startX: number;
  currentX: number;
  deltaX: number;
  touchId: number | null;
}

export class TouchHandler {
  private touchState: TouchState = {
    isActive: false,
    startX: 0,
    currentX: 0,
    deltaX: 0,
    touchId: null
  };
  
  private isActive: boolean = false;
  private listeners: Array<() => void> = [];
  private canvas: HTMLCanvasElement;
  private deadZone: number = 10; // Minimum movement threshold in pixels
  private movementScale: number = 1.0; // Scale factor for touch movement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  /**
   * Set up touch event listeners
   */
  private setupEventListeners(): void {
    // Touch start event listener
    const touchStartListener = (event: TouchEvent) => {
      if (!this.isActive) return;
      
      // Prevent default to avoid scrolling and other touch behaviors
      event.preventDefault();
      
      // Only handle single touch for now
      if (event.touches.length === 1 && !this.touchState.isActive) {
        const touch = event.touches[0];
        if (touch) {
          const rect = this.canvas.getBoundingClientRect();
          
          this.touchState.isActive = true;
          this.touchState.touchId = touch.identifier;
          this.touchState.startX = touch.clientX - rect.left;
          this.touchState.currentX = this.touchState.startX;
          this.touchState.deltaX = 0;
        }
      }
    };

    // Touch move event listener
    const touchMoveListener = (event: TouchEvent) => {
      if (!this.isActive || !this.touchState.isActive) return;
      
      event.preventDefault();
      
      // Find the touch we're tracking
      for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        if (touch && touch.identifier === this.touchState.touchId) {
          const rect = this.canvas.getBoundingClientRect();
          const newX = touch.clientX - rect.left;
          
          this.touchState.currentX = newX;
          this.touchState.deltaX = newX - this.touchState.startX;
          break;
        }
      }
    };

    // Touch end event listener
    const touchEndListener = (event: TouchEvent) => {
      if (!this.isActive || !this.touchState.isActive) return;
      
      event.preventDefault();
      
      // Check if our tracked touch ended
      let touchEnded = true;
      for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        if (touch && touch.identifier === this.touchState.touchId) {
          touchEnded = false;
          break;
        }
      }
      
      if (touchEnded) {
        this.resetTouchState();
      }
    };

    // Touch cancel event listener
    const touchCancelListener = (event: TouchEvent) => {
      if (!this.isActive) return;
      
      event.preventDefault();
      this.resetTouchState();
    };

    // Add event listeners to canvas
    this.canvas.addEventListener('touchstart', touchStartListener, { passive: false });
    this.canvas.addEventListener('touchmove', touchMoveListener, { passive: false });
    this.canvas.addEventListener('touchend', touchEndListener, { passive: false });
    this.canvas.addEventListener('touchcancel', touchCancelListener, { passive: false });

    // Store listeners for cleanup
    this.listeners.push(
      () => this.canvas.removeEventListener('touchstart', touchStartListener),
      () => this.canvas.removeEventListener('touchmove', touchMoveListener),
      () => this.canvas.removeEventListener('touchend', touchEndListener),
      () => this.canvas.removeEventListener('touchcancel', touchCancelListener)
    );
  }

  /**
   * Reset touch state to inactive
   */
  private resetTouchState(): void {
    this.touchState.isActive = false;
    this.touchState.startX = 0;
    this.touchState.currentX = 0;
    this.touchState.deltaX = 0;
    this.touchState.touchId = null;
  }

  /**
   * Activate touch input handling
   */
  public activate(): void {
    this.isActive = true;
    this.resetTouchState();
  }

  /**
   * Deactivate touch input handling
   */
  public deactivate(): void {
    this.isActive = false;
    this.resetTouchState();
  }

  /**
   * Check if touch is currently active
   */
  public isTouchActive(): boolean {
    return this.touchState.isActive;
  }

  /**
   * Get touch delta X movement (scaled and with dead zone applied)
   */
  public getTouchDelta(): number {
    if (!this.touchState.isActive) return 0;
    
    // Apply dead zone - ignore small movements
    if (Math.abs(this.touchState.deltaX) < this.deadZone) {
      return 0;
    }
    
    // Apply movement scaling
    return this.touchState.deltaX * this.movementScale;
  }

  /**
   * Get raw touch delta X movement (without dead zone or scaling)
   */
  public getRawTouchDelta(): number {
    return this.touchState.deltaX;
  }

  /**
   * Get current touch position relative to canvas
   */
  public getTouchPosition(): { x: number; y: number } | null {
    if (!this.touchState.isActive) return null;
    
    return {
      x: this.touchState.currentX,
      y: 0 // We only track X for horizontal movement
    };
  }

  /**
   * Get touch start position
   */
  public getTouchStartPosition(): { x: number; y: number } | null {
    if (!this.touchState.isActive) return null;
    
    return {
      x: this.touchState.startX,
      y: 0
    };
  }

  /**
   * Check if touch movement is significant (beyond dead zone)
   */
  public hasSignificantMovement(): boolean {
    return Math.abs(this.touchState.deltaX) >= this.deadZone;
  }

  /**
   * Set dead zone threshold
   * @param pixels Minimum movement threshold in pixels
   */
  public setDeadZone(pixels: number): void {
    this.deadZone = Math.max(0, pixels);
  }

  /**
   * Set movement scale factor
   * @param scale Scale factor for touch movement (1.0 = normal, 0.5 = half speed, 2.0 = double speed)
   */
  public setMovementScale(scale: number): void {
    this.movementScale = Math.max(0.1, scale);
  }

  /**
   * Get current dead zone setting
   */
  public getDeadZone(): number {
    return this.deadZone;
  }

  /**
   * Get current movement scale setting
   */
  public getMovementScale(): number {
    return this.movementScale;
  }

  /**
   * Check if touch input is currently active
   */
  public isTouchHandlerActive(): boolean {
    return this.isActive;
  }

  /**
   * Clean up event listeners
   */
  public destroy(): void {
    this.isActive = false;
    this.resetTouchState();
    
    // Remove all event listeners
    this.listeners.forEach(removeListener => removeListener());
    this.listeners.length = 0;
  }
}