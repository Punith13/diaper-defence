/**
 * Error types for different categories of errors
 */
export enum ErrorType {
  ASSET_LOADING = 'asset_loading',
  AUDIO_CONTEXT = 'audio_context',
  GAME_STATE = 'game_state',
  RENDERING = 'rendering',
  INPUT = 'input',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',        // Non-critical, game can continue
  MEDIUM = 'medium',  // Some functionality affected
  HIGH = 'high',      // Major functionality affected
  CRITICAL = 'critical' // Game cannot continue
}

/**
 * Error information interface
 */
interface ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error;
  context?: any;
  timestamp: number;
  userMessage: string;
  recoveryAction?: () => void;
}

/**
 * Error recovery strategies
 */
interface RecoveryStrategy {
  canRecover: boolean;
  action?: () => void;
  userMessage: string;
}

/**
 * Comprehensive error handling system for the game
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: ErrorInfo[] = [];
  private maxErrorHistory: number = 50;
  private onErrorCallback?: (error: ErrorInfo) => void;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Set callback for when errors occur
   */
  public setErrorCallback(callback: (error: ErrorInfo) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Handle an error with automatic recovery strategies
   */
  public handleError(
    type: ErrorType,
    severity: ErrorSeverity,
    message: string,
    originalError?: Error,
    context?: any
  ): void {
    const errorInfo: ErrorInfo = {
      type,
      severity,
      message,
      originalError,
      context,
      timestamp: Date.now(),
      userMessage: this.generateUserMessage(type, severity, message),
      recoveryAction: this.getRecoveryAction(type, severity, context)
    };

    // Add to error history
    this.errors.push(errorInfo);
    if (this.errors.length > this.maxErrorHistory) {
      this.errors.shift();
    }

    // Log error for debugging
    this.logError(errorInfo);

    // Attempt automatic recovery
    if (errorInfo.recoveryAction) {
      try {
        errorInfo.recoveryAction();
      } catch (recoveryError) {
        console.error('Recovery action failed:', recoveryError);
      }
    }

    // Notify callback
    if (this.onErrorCallback) {
      this.onErrorCallback(errorInfo);
    }

    // Show user message for medium+ severity errors
    if (severity !== ErrorSeverity.LOW) {
      this.showUserError(errorInfo);
    }
  }

  /**
   * Generate user-friendly error messages
   */
  private generateUserMessage(type: ErrorType, severity: ErrorSeverity, message: string): string {
    switch (type) {
      case ErrorType.ASSET_LOADING:
        return severity === ErrorSeverity.CRITICAL 
          ? "Game assets failed to load. Please refresh the page."
          : "Some game assets couldn't load, but the game will continue with fallbacks.";
      
      case ErrorType.AUDIO_CONTEXT:
        return "Audio couldn't be initialized. The game will run silently. Try clicking to enable audio.";
      
      case ErrorType.GAME_STATE:
        return severity === ErrorSeverity.CRITICAL
          ? "Game state corrupted. Restarting the game..."
          : "Minor game state issue detected and recovered.";
      
      case ErrorType.RENDERING:
        return "Graphics rendering issue detected. Performance may be affected.";
      
      case ErrorType.INPUT:
        return "Input system issue detected. Try refreshing if controls don't work.";
      
      case ErrorType.NETWORK:
        return "Network connection issue. Some features may not work properly.";
      
      default:
        return "An unexpected error occurred. The game will try to continue.";
    }
  }

  /**
   * Get recovery action for specific error types
   */
  private getRecoveryAction(type: ErrorType, severity: ErrorSeverity, context?: any): (() => void) | undefined {
    switch (type) {
      case ErrorType.ASSET_LOADING:
        return () => {
          // Fallback to colored geometry if textures fail
          console.log('Falling back to colored geometry for missing assets');
        };
      
      case ErrorType.AUDIO_CONTEXT:
        return () => {
          // Try to resume audio context
          if (context?.audioContext && context.audioContext.state === 'suspended') {
            context.audioContext.resume().catch(() => {
              console.log('Could not resume audio context');
            });
          }
        };
      
      case ErrorType.GAME_STATE:
        if (severity === ErrorSeverity.CRITICAL && context?.gameStateManager) {
          return () => {
            // Reset game state to a known good state
            context.gameStateManager.setState('START');
            console.log('Game state reset due to corruption');
          };
        }
        break;
      
      case ErrorType.RENDERING:
        return () => {
          // Reduce rendering quality
          if (context?.renderer) {
            context.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
            console.log('Reduced rendering quality for performance');
          }
        };
    }
    
    return undefined;
  }

  /**
   * Log error information
   */
  private logError(error: ErrorInfo): void {
    const logLevel = error.severity === ErrorSeverity.CRITICAL ? 'error' : 
                    error.severity === ErrorSeverity.HIGH ? 'warn' : 'log';
    
    console[logLevel](`[${error.type.toUpperCase()}] ${error.message}`, {
      severity: error.severity,
      timestamp: new Date(error.timestamp).toISOString(),
      originalError: error.originalError,
      context: error.context
    });
  }

  /**
   * Show error message to user
   */
  private showUserError(error: ErrorInfo): void {
    // Create or update error display
    let errorDisplay = document.getElementById('error-display');
    
    if (!errorDisplay) {
      errorDisplay = document.createElement('div');
      errorDisplay.id = 'error-display';
      errorDisplay.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        max-width: 80%;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(errorDisplay);
    }

    errorDisplay.textContent = error.userMessage;
    errorDisplay.style.display = 'block';

    // Auto-hide after 5 seconds for non-critical errors
    if (error.severity !== ErrorSeverity.CRITICAL) {
      setTimeout(() => {
        if (errorDisplay) {
          errorDisplay.style.display = 'none';
        }
      }, 5000);
    }
  }

  /**
   * Clear error display
   */
  public clearErrorDisplay(): void {
    const errorDisplay = document.getElementById('error-display');
    if (errorDisplay) {
      errorDisplay.style.display = 'none';
    }
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): { total: number; byType: Record<string, number>; bySeverity: Record<string, number> } {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    this.errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byType,
      bySeverity
    };
  }

  /**
   * Get recent errors
   */
  public getRecentErrors(count: number = 10): ErrorInfo[] {
    return this.errors.slice(-count);
  }

  /**
   * Clear error history
   */
  public clearHistory(): void {
    this.errors = [];
  }

  /**
   * Wrap a function with error handling
   */
  public wrapFunction<T extends (...args: any[]) => any>(
    fn: T,
    errorType: ErrorType,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: any
  ): T {
    return ((...args: any[]) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(
          errorType,
          severity,
          `Function ${fn.name || 'anonymous'} failed: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error : new Error(String(error)),
          context
        );
        return undefined;
      }
    }) as T;
  }

  /**
   * Wrap an async function with error handling
   */
  public wrapAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    errorType: ErrorType,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: any
  ): T {
    return (async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(
          errorType,
          severity,
          `Async function ${fn.name || 'anonymous'} failed: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error : new Error(String(error)),
          context
        );
        return undefined;
      }
    }) as T;
  }
}