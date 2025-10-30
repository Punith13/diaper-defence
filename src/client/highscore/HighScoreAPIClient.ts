import { 
  SaveScoreRequest, 
  SaveScoreResponse, 
  GetHighScoresResponse, 
  GetUserBestResponse, 
  HighScore 
} from '../../shared/types/api';
import { ErrorHandler, ErrorType, ErrorSeverity } from '../systems/ErrorHandler';

/**
 * API client for high score operations
 * Implements requirements 1.1, 1.5, 2.5, 6.2
 */
export class HighScoreAPIClient {
  private baseURL = '/api';
  private errorHandler: ErrorHandler;
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  constructor() {
    this.errorHandler = ErrorHandler.getInstance();
  }

  /**
   * Save a player's score to the server
   * @param score Final game score
   * @param gameTime Game duration in milliseconds
   * @returns Promise with save response
   */
  public async saveScore(score: number, gameTime: number): Promise<SaveScoreResponse> {
    const request: SaveScoreRequest = {
      score,
      gameTime,
      sessionId: this.generateSessionId(),
      gameVersion: '1.0.0',
      timestamp: Date.now()
    };

    console.log('Sending save score request:', request);

    return this.makeRequestWithRetry<SaveScoreResponse>(
      `${this.baseURL}/save-score`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      },
      'save-score'
    );
  }

  /**
   * Get the top high scores from the server
   * @returns Promise with high scores array
   */
  public async getHighScores(): Promise<HighScore[]> {
    const response = await this.makeRequestWithRetry<GetHighScoresResponse>(
      `${this.baseURL}/high-scores`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      },
      'get-high-scores'
    );

    return response.scores || [];
  }

  /**
   * Get the current user's best score
   * @returns Promise with user's best score or null
   */
  public async getUserBest(): Promise<HighScore | null> {
    const response = await this.makeRequestWithRetry<GetUserBestResponse>(
      `${this.baseURL}/user-best`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      },
      'get-user-best'
    );

    return response.bestScore || null;
  }

  /**
   * Make HTTP request with retry logic and error handling
   * @param url Request URL
   * @param options Fetch options
   * @param operation Operation name for error reporting
   * @returns Promise with response data
   */
  private async makeRequestWithRetry<T>(
    url: string, 
    options: RequestInit, 
    operation: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: T = await response.json();
        
        // Log successful request after retries
        if (attempt > 1) {
          console.log(`${operation} succeeded on attempt ${attempt}`);
        }

        return data;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on certain error types
        if (this.isNonRetryableError(lastError)) {
          break;
        }

        // Log retry attempt
        if (attempt < this.retryAttempts) {
          console.warn(`${operation} failed on attempt ${attempt}, retrying in ${this.retryDelay}ms...`, lastError.message);
          await this.delay(this.retryDelay);
          
          // Exponential backoff
          this.retryDelay *= 1.5;
        }
      }
    }

    // All retries failed, handle the error
    this.handleAPIError(lastError!, operation);
    throw lastError;
  }

  /**
   * Check if an error should not be retried
   * @param error Error to check
   * @returns True if error should not be retried
   */
  private isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Don't retry client errors (4xx) except for 408 (timeout) and 429 (rate limit)
    if (message.includes('http 4') && 
        !message.includes('408') && 
        !message.includes('429')) {
      return true;
    }

    // Don't retry on abort/timeout if it's a user-initiated abort
    if (message.includes('aborted') && !message.includes('timeout')) {
      return true;
    }

    return false;
  }

  /**
   * Handle API errors with appropriate error reporting
   * @param error Error that occurred
   * @param operation Operation that failed
   */
  private handleAPIError(error: Error, operation: string): void {
    let severity = ErrorSeverity.MEDIUM;
    let errorType = ErrorType.NETWORK;

    // Determine error severity and type
    if (error.message.includes('timeout') || error.message.includes('aborted')) {
      severity = ErrorSeverity.MEDIUM;
      errorType = ErrorType.NETWORK;
    } else if (error.message.includes('HTTP 5')) {
      severity = ErrorSeverity.HIGH;
      errorType = ErrorType.NETWORK;
    } else if (error.message.includes('HTTP 4')) {
      severity = ErrorSeverity.MEDIUM;
      errorType = ErrorType.NETWORK;
    } else {
      severity = ErrorSeverity.MEDIUM;
      errorType = ErrorType.UNKNOWN;
    }

    this.errorHandler.handleError(
      errorType,
      severity,
      `High score ${operation} failed: ${error.message}`,
      error,
      { operation, url: this.baseURL }
    );
  }

  /**
   * Generate a unique session ID for score validation
   * @returns Session ID string
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay execution for specified milliseconds
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset retry delay to initial value
   */
  public resetRetryDelay(): void {
    this.retryDelay = 1000;
  }

  /**
   * Set custom retry configuration
   * @param attempts Number of retry attempts
   * @param delay Initial delay between retries in milliseconds
   */
  public setRetryConfig(attempts: number, delay: number): void {
    this.retryAttempts = Math.max(1, attempts);
    this.retryDelay = Math.max(100, delay);
  }

  /**
   * Check if the API is available (health check)
   * @returns Promise that resolves to true if API is available
   */
  public async isAPIAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout for health check
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}