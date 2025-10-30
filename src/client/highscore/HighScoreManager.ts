import { HighScore, SaveScoreResponse } from '../../shared/types/api';
import { HighScoreAPIClient } from './HighScoreAPIClient';
import { LeaderboardUI } from './LeaderboardUI';
import { GameStateManager, GameState } from '../systems/GameStateManager';
import { ScoreSystem } from '../systems/ScoreSystem';
import { ErrorHandler, ErrorType, ErrorSeverity } from '../systems/ErrorHandler';

/**
 * Event types for high score manager
 */
export enum HighScoreEvent {
  SCORE_SAVED = 'score_saved',
  LEADERBOARD_LOADED = 'leaderboard_loaded',
  ERROR = 'error',
  USER_BEST_LOADED = 'user_best_loaded'
}

/**
 * Event callback types
 */
export type ScoreSavedCallback = (response: SaveScoreResponse) => void;
export type LeaderboardLoadedCallback = (scores: HighScore[]) => void;
export type UserBestLoadedCallback = (userBest: HighScore | null) => void;
export type ErrorCallback = (error: string) => void;

/**
 * High score manager for coordinating high score functionality
 * Implements requirements 1.1, 1.2, 1.4, 6.4
 */
export class HighScoreManager {
  private static instance: HighScoreManager;
  
  private apiClient: HighScoreAPIClient;
  private leaderboardUI: LeaderboardUI;
  private gameStateManager: GameStateManager;
  private scoreSystem: ScoreSystem;
  private errorHandler: ErrorHandler;
  
  // Event callbacks
  private scoreSavedCallbacks: ScoreSavedCallback[] = [];
  private leaderboardLoadedCallbacks: LeaderboardLoadedCallback[] = [];
  private userBestLoadedCallbacks: UserBestLoadedCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  
  // State management
  private isInitialized = false;
  private lastSavedScore: number | null = null;
  private currentLeaderboard: HighScore[] = [];
  private currentUserBest: HighScore | null = null;
  private isSubmittingScore = false;

  private constructor() {
    this.apiClient = new HighScoreAPIClient();
    this.leaderboardUI = new LeaderboardUI();
    this.gameStateManager = GameStateManager.getInstance();
    this.scoreSystem = ScoreSystem.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
  }

  /**
   * Get singleton instance of high score manager
   */
  public static getInstance(): HighScoreManager {
    if (!HighScoreManager.instance) {
      HighScoreManager.instance = new HighScoreManager();
    }
    return HighScoreManager.instance;
  }

  /**
   * Initialize the high score manager and set up game integration
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set up game state callbacks for automatic score saving
      this.setupGameStateIntegration();
      
      // Set up leaderboard UI
      this.setupLeaderboardUI();
      
      // Check API availability
      const isAPIAvailable = await this.apiClient.isAPIAvailable();
      if (!isAPIAvailable) {
        console.warn('High score API is not available, running in offline mode');
      }

      this.isInitialized = true;
      console.log('High score manager initialized successfully');

    } catch (error) {
      this.handleError('Failed to initialize high score manager', error);
      throw error;
    }
  }

  /**
   * Set up integration with game state manager for automatic score saving
   */
  private setupGameStateIntegration(): void {
    // Listen for game over events to automatically save scores
    this.gameStateManager.onStateChange(GameState.GAME_OVER, () => {
      this.handleGameOver();
    });

    // Listen for game start events to reset state
    this.gameStateManager.onStateChange(GameState.PLAY, () => {
      this.handleGameStart();
    });

    // Listen for game reset events to clear temporary state
    this.gameStateManager.onReset(() => {
      this.handleGameReset();
    });

    console.log('Game state integration set up for automatic score saving');
  }

  /**
   * Handle game over event - automatically save the score
   */
  private async handleGameOver(): Promise<void> {
    try {
      const stats = this.scoreSystem.getStats();
      const gameTime = this.gameStateManager.getGameTime();

      // Only save if we have a valid score and haven't already saved this score
      if (stats.score > 0 && stats.score !== this.lastSavedScore && !this.isSubmittingScore) {
        console.log(`Game over detected, saving score: ${stats.score}, time: ${gameTime}ms`);
        // Note: The actual saving is handled by the main game engine to maintain UI consistency
        // This method serves as a backup and for logging/state management
      } else if (stats.score === 0) {
        console.log('Game over with zero score, skipping save');
      } else if (stats.score === this.lastSavedScore) {
        console.log('Score already saved, skipping duplicate save');
      } else if (this.isSubmittingScore) {
        console.log('Score submission already in progress, skipping');
      }
    } catch (error) {
      this.handleError('Failed to handle game over event', error);
    }
  }

  /**
   * Handle game start event - reset temporary state
   */
  private handleGameStart(): void {
    try {
      // Reset submission state when starting a new game
      this.isSubmittingScore = false;
      console.log('Game started, high score manager ready for new session');
    } catch (error) {
      this.handleError('Failed to handle game start event', error);
    }
  }

  /**
   * Handle game reset event - clear temporary state
   */
  private handleGameReset(): void {
    try {
      // Clear temporary state but keep cached data
      this.isSubmittingScore = false;
      this.lastSavedScore = null;
      console.log('Game reset, high score manager state cleared');
    } catch (error) {
      this.handleError('Failed to handle game reset event', error);
    }
  }

  /**
   * Save the current game score with graceful fallback and retry logic
   */
  public async saveCurrentScore(): Promise<SaveScoreResponse | null> {
    if (this.isSubmittingScore) {
      console.warn('Score submission already in progress');
      return null;
    }

    // Check if manager is ready before attempting save
    if (!this.isInitialized) {
      console.warn('High score manager not initialized, cannot save score');
      return this.createFallbackResponse('High score system not initialized');
    }

    try {
      this.isSubmittingScore = true;
      
      const stats = this.scoreSystem.getStats();
      const gameTime = this.gameStateManager.getGameTime();

      // Validate score data before sending
      if (stats.score < 0 || gameTime < 0) {
        throw new Error('Invalid score or game time data');
      }

      console.log(`Saving score: ${stats.score}, game time: ${gameTime}ms`);

      // Attempt to save with retry logic
      const response = await this.saveScoreWithRetry(stats.score, gameTime);
      
      if (response && response.success) {
        this.lastSavedScore = stats.score;
        
        // Notify callbacks
        this.scoreSavedCallbacks.forEach(callback => {
          try {
            callback(response);
          } catch (error) {
            console.error('Error in score saved callback:', error);
          }
        });

        console.log('Score saved successfully:', response);
        return response;
      } else {
        // API returned unsuccessful response
        console.warn('Score save was unsuccessful:', response);
        return response || this.createFallbackResponse('Score save was unsuccessful');
      }

    } catch (error) {
      this.handleError('Failed to save score', error);
      return this.createFallbackResponse('Score could not be saved at this time');
    } finally {
      this.isSubmittingScore = false;
    }
  }

  /**
   * Attempt to save score with retry logic
   */
  private async saveScoreWithRetry(score: number, gameTime: number, maxRetries: number = 2): Promise<SaveScoreResponse | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        // Check API availability before each attempt
        if (attempt === 1) {
          const isAPIAvailable = await this.apiClient.isAPIAvailable();
          if (!isAPIAvailable) {
            throw new Error('High score API is currently unavailable');
          }
        }

        const response = await this.apiClient.saveScore(score, gameTime);
        
        // Success on any attempt
        if (attempt > 1) {
          console.log(`Score save succeeded on attempt ${attempt}`);
        }
        
        return response;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on certain error types
        if (this.isNonRetryableError(lastError)) {
          console.log(`Non-retryable error, stopping attempts: ${lastError.message}`);
          break;
        }

        // Log retry attempt
        if (attempt <= maxRetries) {
          console.warn(`Score save attempt ${attempt} failed, retrying...`, lastError.message);
          await this.delay(1000 * attempt); // Exponential backoff
        }
      }
    }

    // All attempts failed
    console.error('All score save attempts failed:', lastError);
    throw lastError;
  }

  /**
   * Check if an error should not be retried
   */
  private isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Don't retry validation errors or client errors (except timeouts)
    if (message.includes('invalid') || 
        message.includes('validation') ||
        (message.includes('http 4') && !message.includes('408') && !message.includes('429'))) {
      return true;
    }

    return false;
  }

  /**
   * Create a fallback response for when save fails
   */
  private createFallbackResponse(message: string): SaveScoreResponse {
    return {
      type: 'save-score',
      success: false,
      message,
      rank: 0
    };
  }

  /**
   * Delay execution for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Load the current leaderboard with fallback to cached data
   */
  public async loadLeaderboard(): Promise<HighScore[]> {
    try {
      console.log('Loading leaderboard...');
      
      // Check if API is available
      const isAPIAvailable = await this.apiClient.isAPIAvailable();
      if (!isAPIAvailable) {
        console.warn('API unavailable, returning cached leaderboard data');
        return this.getCachedLeaderboard();
      }
      
      const scores = await this.apiClient.getHighScores();
      this.currentLeaderboard = scores;
      
      // Notify callbacks
      this.leaderboardLoadedCallbacks.forEach(callback => {
        try {
          callback(scores);
        } catch (error) {
          console.error('Error in leaderboard loaded callback:', error);
        }
      });

      console.log(`Leaderboard loaded with ${scores.length} scores`);
      return scores;

    } catch (error) {
      this.handleError('Failed to load leaderboard', error);
      
      // Fallback to cached data if available
      if (this.currentLeaderboard.length > 0) {
        console.log('Returning cached leaderboard data due to error');
        return this.getCachedLeaderboard();
      }
      
      // Return empty array as final fallback
      return [];
    }
  }

  /**
   * Load the current user's best score
   */
  public async loadUserBest(): Promise<HighScore | null> {
    try {
      console.log('Loading user best score...');
      
      const userBest = await this.apiClient.getUserBest();
      this.currentUserBest = userBest;
      
      // Notify callbacks
      this.userBestLoadedCallbacks.forEach(callback => {
        try {
          callback(userBest);
        } catch (error) {
          console.error('Error in user best loaded callback:', error);
        }
      });

      console.log('User best score loaded:', userBest);
      return userBest;

    } catch (error) {
      this.handleError('Failed to load user best score', error);
      return null;
    }
  }

  /**
   * Get cached leaderboard data
   */
  public getCachedLeaderboard(): HighScore[] {
    return [...this.currentLeaderboard];
  }

  /**
   * Get cached user best score
   */
  public getCachedUserBest(): HighScore | null {
    return this.currentUserBest;
  }

  /**
   * Check if currently submitting a score
   */
  public isSubmitting(): boolean {
    return this.isSubmittingScore;
  }

  /**
   * Check if manager is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Register callback for score saved events
   */
  public onScoreSaved(callback: ScoreSavedCallback): void {
    this.scoreSavedCallbacks.push(callback);
  }

  /**
   * Register callback for leaderboard loaded events
   */
  public onLeaderboardLoaded(callback: LeaderboardLoadedCallback): void {
    this.leaderboardLoadedCallbacks.push(callback);
  }

  /**
   * Register callback for user best loaded events
   */
  public onUserBestLoaded(callback: UserBestLoadedCallback): void {
    this.userBestLoadedCallbacks.push(callback);
  }

  /**
   * Register callback for error events
   */
  public onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Remove all event callbacks
   */
  public clearCallbacks(): void {
    this.scoreSavedCallbacks = [];
    this.leaderboardLoadedCallbacks = [];
    this.userBestLoadedCallbacks = [];
    this.errorCallbacks = [];
  }

  /**
   * Handle errors with proper error reporting
   */
  private handleError(message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = `${message}: ${errorMessage}`;
    
    console.error(fullMessage, error);
    
    // Report to error handler
    this.errorHandler.handleError(
      ErrorType.NETWORK,
      ErrorSeverity.MEDIUM,
      fullMessage,
      error instanceof Error ? error : new Error(String(error)),
      { highScoreManager: this }
    );

    // Notify error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(fullMessage);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  /**
   * Reset manager state (useful for testing or cleanup)
   */
  public reset(): void {
    this.lastSavedScore = null;
    this.currentLeaderboard = [];
    this.currentUserBest = null;
    this.isSubmittingScore = false;
    console.log('High score manager state reset');
  }

  /**
   * Get manager status for debugging
   */
  public getStatus(): {
    isInitialized: boolean;
    isSubmitting: boolean;
    lastSavedScore: number | null;
    leaderboardSize: number;
    hasUserBest: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      isSubmitting: this.isSubmittingScore,
      lastSavedScore: this.lastSavedScore,
      leaderboardSize: this.currentLeaderboard.length,
      hasUserBest: this.currentUserBest !== null
    };
  }

  /**
   * Force save score (bypasses duplicate check)
   */
  public async forceSaveScore(): Promise<SaveScoreResponse | null> {
    this.lastSavedScore = null; // Reset to allow saving
    return this.saveCurrentScore();
  }

  /**
   * Refresh all high score data
   */
  public async refreshAll(): Promise<void> {
    try {
      await Promise.all([
        this.loadLeaderboard(),
        this.loadUserBest()
      ]);
      console.log('All high score data refreshed');
    } catch (error) {
      this.handleError('Failed to refresh high score data', error);
    }
  }

  /**
   * Show the leaderboard modal with current scores and graceful error handling
   */
  public async showLeaderboard(): Promise<void> {
    try {
      // Check if manager is ready
      if (!this.isInitialized) {
        throw new Error('High score manager not initialized');
      }

      // Show loading state
      this.leaderboardUI.setLoading(true);
      this.leaderboardUI.show();

      // Load leaderboard data with timeout
      const loadPromise = this.loadLeaderboard();
      const timeoutPromise = new Promise<HighScore[]>((_, reject) => {
        setTimeout(() => reject(new Error('Leaderboard load timeout')), 10000);
      });

      const scores = await Promise.race([loadPromise, timeoutPromise]);
      
      // Get current user for highlighting
      const currentUser = await this.getCurrentUsername();
      
      // Render the leaderboard
      this.leaderboardUI.render(scores, currentUser);
      
      // If no scores available, show appropriate message
      if (scores.length === 0) {
        console.log('No scores available to display');
      }
      
    } catch (error) {
      console.error('Failed to show leaderboard:', error);
      
      // Determine appropriate error message
      let errorMessage = 'Failed to load leaderboard. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (error.message.includes('unavailable') || error.message.includes('offline')) {
          errorMessage = 'High scores are currently unavailable. Please try again later.';
        } else if (error.message.includes('not initialized')) {
          errorMessage = 'High score system is not available.';
        }
      }
      
      this.leaderboardUI.setError(errorMessage);
      this.handleError('Failed to show leaderboard', error);
    }
  }

  /**
   * Hide the leaderboard modal
   */
  public hideLeaderboard(): void {
    this.leaderboardUI.hide();
  }

  /**
   * Check if leaderboard is currently visible
   */
  public isLeaderboardVisible(): boolean {
    return this.leaderboardUI.isVisible();
  }

  /**
   * Get current username for highlighting user scores
   */
  private async getCurrentUsername(): Promise<string | undefined> {
    try {
      // Try to get username from a recent API call or make a health check call
      console.log('Attempting to get current username...');
      
      // Make a health check call to get the current username
      const response = await fetch('/api/health');
      if (response.ok) {
        const healthData = await response.json();
        console.log('Health check response:', healthData);
        
        if (healthData.currentUser && healthData.currentUser !== 'unknown' && healthData.currentUser !== 'error') {
          console.log('Got username from health check:', healthData.currentUser);
          return healthData.currentUser;
        }
      }
      
      console.log('No username available from health check');
      return undefined;
    } catch (error) {
      console.warn('Failed to get current username:', error);
      return undefined;
    }
  }

  /**
   * Set up leaderboard UI event handlers
   */
  private setupLeaderboardUI(): void {
    // Set up close callback
    this.leaderboardUI.onClose(() => {
      console.log('Leaderboard closed by user');
    });
  }

  /**
   * Check if high score system is functioning properly
   */
  public async performHealthCheck(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }

      // Quick API availability check
      const isAPIAvailable = await this.apiClient.isAPIAvailable();
      return isAPIAvailable;
      
    } catch (error) {
      console.warn('High score system health check failed:', error);
      return false;
    }
  }

  /**
   * Enable graceful degradation mode when high score system fails
   */
  public enableGracefulDegradation(): void {
    console.log('Enabling graceful degradation mode for high score system');
    
    // Clear callbacks to prevent errors
    this.clearCallbacks();
    
    // Mark as not initialized to prevent further API calls
    this.isInitialized = false;
    
    // Reset submission state
    this.isSubmittingScore = false;
  }

  /**
   * Get system status for debugging and monitoring
   */
  public getSystemStatus(): {
    isInitialized: boolean;
    isSubmitting: boolean;
    hasCache: boolean;
    lastError: string | null;
  } {
    return {
      isInitialized: this.isInitialized,
      isSubmitting: this.isSubmittingScore,
      hasCache: this.currentLeaderboard.length > 0,
      lastError: null // Could be enhanced to track last error
    };
  }
}