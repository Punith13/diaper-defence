/**
 * Game state enumeration
 * Implements requirement 4.2 for game state transitions
 */
export enum GameState {
  START = 'start',
  PLAY = 'play',
  GAME_OVER = 'game_over'
}

/**
 * Game state data interface
 */
export interface GameStateData {
  currentState: GameState;
  score: number;
  misses: number;
  gameTime: number;
  isTransitioning: boolean;
}

/**
 * Game state manager for handling state transitions and game flow
 * Implements requirements 4.2, 4.5 for game state management and reset functionality
 */
export class GameStateManager {
  private static instance: GameStateManager;
  
  private currentState: GameState = GameState.START;
  private previousState: GameState = GameState.START;
  private isTransitioning: boolean = false;
  private gameTime: number = 0;
  private startTime: number = 0;
  
  // State transition callbacks
  private stateChangeCallbacks: Map<GameState, Array<() => void>> = new Map();
  private stateExitCallbacks: Map<GameState, Array<() => void>> = new Map();
  private stateEnterCallbacks: Map<GameState, Array<() => void>> = new Map();
  private resetCallbacks: Array<() => void> = [];

  private constructor() {
    this.initializeCallbackMaps();
  }

  /**
   * Get singleton instance of game state manager
   */
  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  /**
   * Initialize callback maps for all states
   */
  private initializeCallbackMaps(): void {
    Object.values(GameState).forEach(state => {
      this.stateChangeCallbacks.set(state, []);
      this.stateExitCallbacks.set(state, []);
      this.stateEnterCallbacks.set(state, []);
    });
  }

  /**
   * Transition to a new game state
   * @param newState The state to transition to
   * @param force Force transition even if already in that state
   */
  public transitionTo(newState: GameState, force: boolean = false): void {
    if (this.currentState === newState && !force) {
      // console.log(`Already in state ${newState}, skipping transition`);
      return;
    }

    if (this.isTransitioning) {
      console.warn(`State transition in progress, cannot transition to ${newState}`);
      return;
    }

    // console.log(`Transitioning from ${this.currentState} to ${newState}`);
    
    this.isTransitioning = true;
    this.previousState = this.currentState;

    // Call exit callbacks for current state
    this.callStateCallbacks(this.stateExitCallbacks.get(this.currentState) || []);

    // Update state
    this.currentState = newState;

    // Handle state-specific logic
    this.handleStateTransition(newState);

    // Call enter callbacks for new state
    this.callStateCallbacks(this.stateEnterCallbacks.get(newState) || []);

    // Call general state change callbacks
    this.callStateCallbacks(this.stateChangeCallbacks.get(newState) || []);

    this.isTransitioning = false;
  }

  /**
   * Handle state-specific transition logic
   * @param newState The state being transitioned to
   */
  private handleStateTransition(newState: GameState): void {
    switch (newState) {
      case GameState.START:
        this.handleStartState();
        break;
      case GameState.PLAY:
        this.handlePlayState();
        break;
      case GameState.GAME_OVER:
        this.handleGameOverState();
        break;
    }
  }

  /**
   * Handle transition to START state
   */
  private handleStartState(): void {
    this.gameTime = 0;
    this.startTime = 0;
    // console.log('Game state: START - Ready to begin');
  }

  /**
   * Handle transition to PLAY state
   */
  private handlePlayState(): void {
    this.startTime = Date.now();
    this.gameTime = 0;
    // console.log('Game state: PLAY - Game started');
  }

  /**
   * Handle transition to GAME_OVER state
   */
  private handleGameOverState(): void {
    const endTime = Date.now();
    if (this.startTime > 0) {
      this.gameTime = endTime - this.startTime;
    }
    // console.log(`Game state: GAME_OVER - Game ended after ${this.gameTime}ms`);
  }

  /**
   * Call an array of callbacks safely
   * @param callbacks Array of callback functions
   */
  private callStateCallbacks(callbacks: Array<() => void>): void {
    callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in state callback:', error);
      }
    });
  }

  /**
   * Get current game state
   */
  public getCurrentState(): GameState {
    return this.currentState;
  }

  /**
   * Get previous game state
   */
  public getPreviousState(): GameState {
    return this.previousState;
  }

  /**
   * Check if currently transitioning between states
   */
  public isInTransition(): boolean {
    return this.isTransitioning;
  }

  /**
   * Get current game time in milliseconds
   */
  public getGameTime(): number {
    if (this.currentState === GameState.PLAY && this.startTime > 0) {
      return Date.now() - this.startTime;
    }
    return this.gameTime;
  }

  /**
   * Get game time in seconds
   */
  public getGameTimeSeconds(): number {
    return Math.floor(this.getGameTime() / 1000);
  }

  /**
   * Check if game is currently active (in PLAY state)
   */
  public isGameActive(): boolean {
    return this.currentState === GameState.PLAY && !this.isTransitioning;
  }

  /**
   * Check if game is over
   */
  public isGameOver(): boolean {
    return this.currentState === GameState.GAME_OVER;
  }

  /**
   * Check if game is at start screen
   */
  public isAtStart(): boolean {
    return this.currentState === GameState.START;
  }

  /**
   * Reset game to initial state
   * Implements requirement 4.5 for game reset functionality
   */
  public resetGame(): void {
    // console.log('Resetting game state');
    
    // Call all reset callbacks
    this.resetCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in reset callback:', error);
      }
    });

    // Reset internal state
    this.gameTime = 0;
    this.startTime = 0;
    
    // Transition to START state
    this.transitionTo(GameState.START, true);
  }

  /**
   * Start a new game
   */
  public startGame(): void {
    this.transitionTo(GameState.PLAY);
  }

  /**
   * End the current game
   */
  public endGame(): void {
    this.transitionTo(GameState.GAME_OVER);
  }

  /**
   * Restart the game (reset and start)
   */
  public restartGame(): void {
    this.resetGame();
    // Small delay to ensure reset is complete before starting
    setTimeout(() => {
      this.startGame();
    }, 100);
  }

  /**
   * Register callback for when entering a specific state
   * @param state Game state to listen for
   * @param callback Function to call when entering the state
   */
  public onStateEnter(state: GameState, callback: () => void): void {
    const callbacks = this.stateEnterCallbacks.get(state);
    if (callbacks) {
      callbacks.push(callback);
    }
  }

  /**
   * Register callback for when exiting a specific state
   * @param state Game state to listen for
   * @param callback Function to call when exiting the state
   */
  public onStateExit(state: GameState, callback: () => void): void {
    const callbacks = this.stateExitCallbacks.get(state);
    if (callbacks) {
      callbacks.push(callback);
    }
  }

  /**
   * Register callback for when transitioning to a specific state
   * @param state Game state to listen for
   * @param callback Function to call when transitioning to the state
   */
  public onStateChange(state: GameState, callback: () => void): void {
    const callbacks = this.stateChangeCallbacks.get(state);
    if (callbacks) {
      callbacks.push(callback);
    }
  }

  /**
   * Register callback for game reset
   * @param callback Function to call when game is reset
   */
  public onReset(callback: () => void): void {
    this.resetCallbacks.push(callback);
  }

  /**
   * Remove all callbacks (useful for cleanup)
   */
  public clearCallbacks(): void {
    this.stateChangeCallbacks.clear();
    this.stateExitCallbacks.clear();
    this.stateEnterCallbacks.clear();
    this.resetCallbacks = [];
    this.initializeCallbackMaps();
  }

  /**
   * Get current game state data
   */
  public getStateData(): GameStateData {
    return {
      currentState: this.currentState,
      score: 0, // Will be populated by external systems
      misses: 0, // Will be populated by external systems
      gameTime: this.getGameTime(),
      isTransitioning: this.isTransitioning
    };
  }

  /**
   * Validate state transition
   * @param fromState Current state
   * @param toState Target state
   * @returns True if transition is valid
   */
  public isValidTransition(fromState: GameState, toState: GameState): boolean {
    // Define valid state transitions
    const validTransitions: Record<GameState, GameState[]> = {
      [GameState.START]: [GameState.PLAY],
      [GameState.PLAY]: [GameState.GAME_OVER, GameState.START],
      [GameState.GAME_OVER]: [GameState.START, GameState.PLAY]
    };

    return validTransitions[fromState]?.includes(toState) || false;
  }

  /**
   * Force transition (bypasses validation)
   * @param newState State to transition to
   */
  public forceTransition(newState: GameState): void {
    this.transitionTo(newState, true);
  }
}