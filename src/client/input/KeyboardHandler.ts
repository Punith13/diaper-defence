/**
 * Keyboard input handler for Diaper Defense game
 * Implements requirements 5.1, 5.3 - keyboard controls for diaper movement
 */
export class KeyboardHandler {
  private keys: Map<string, boolean> = new Map();
  private isActive: boolean = false;
  private listeners: Array<() => void> = [];

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Set up keyboard event listeners
   */
  private setupEventListeners(): void {
    // Keydown event listener
    const keydownListener = (event: KeyboardEvent) => {
      if (!this.isActive) return;
      
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
        event.preventDefault();
      }
      
      this.keys.set(event.code, true);
    };

    // Keyup event listener
    const keyupListener = (event: KeyboardEvent) => {
      if (!this.isActive) return;
      
      this.keys.set(event.code, false);
    };

    // Focus and blur event listeners to handle keyboard focus
    const focusListener = () => {
      // Clear all keys when window gains focus to prevent stuck keys
      this.keys.clear();
    };

    const blurListener = () => {
      // Clear all keys when window loses focus to prevent stuck keys
      this.keys.clear();
    };

    // Add event listeners
    document.addEventListener('keydown', keydownListener);
    document.addEventListener('keyup', keyupListener);
    window.addEventListener('focus', focusListener);
    window.addEventListener('blur', blurListener);

    // Store listeners for cleanup
    this.listeners.push(
      () => document.removeEventListener('keydown', keydownListener),
      () => document.removeEventListener('keyup', keyupListener),
      () => window.removeEventListener('focus', focusListener),
      () => window.removeEventListener('blur', blurListener)
    );
  }

  /**
   * Activate keyboard input handling
   */
  public activate(): void {
    this.isActive = true;
    this.keys.clear(); // Clear any existing key states
  }

  /**
   * Deactivate keyboard input handling
   */
  public deactivate(): void {
    this.isActive = false;
    this.keys.clear(); // Clear all key states
  }

  /**
   * Check if left arrow key is currently pressed
   */
  public isLeftPressed(): boolean {
    return this.keys.get('ArrowLeft') === true;
  }

  /**
   * Check if right arrow key is currently pressed
   */
  public isRightPressed(): boolean {
    return this.keys.get('ArrowRight') === true;
  }

  /**
   * Check if any key is currently pressed
   * @param keyCode The key code to check
   */
  public isKeyPressed(keyCode: string): boolean {
    return this.keys.get(keyCode) === true;
  }

  /**
   * Get all currently pressed keys
   */
  public getPressedKeys(): string[] {
    const pressedKeys: string[] = [];
    this.keys.forEach((pressed, key) => {
      if (pressed) {
        pressedKeys.push(key);
      }
    });
    return pressedKeys;
  }

  /**
   * Check if keyboard input is currently active
   */
  public isKeyboardActive(): boolean {
    return this.isActive;
  }

  /**
   * Clean up event listeners
   */
  public destroy(): void {
    this.isActive = false;
    this.keys.clear();
    
    // Remove all event listeners
    this.listeners.forEach(removeListener => removeListener());
    this.listeners.length = 0;
  }
}