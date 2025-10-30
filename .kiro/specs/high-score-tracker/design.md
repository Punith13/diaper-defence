# Design Document

## Overview

The High Score Tracker is a comprehensive leaderboard system that seamlessly integrates with the existing Diaper Defense game architecture. It leverages Devvit's Redis storage and Reddit authentication to provide persistent, global high score tracking across all players. The system follows the established client-server communication patterns and maintains the game's mobile-first design philosophy.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Devvit Platform                          │
├─────────────────────────────────────────────────────────────┤
│  Client (src/client/)                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Game Engine   │  │ High Score UI   │  │ Score Manager│ │
│  │   (Existing)    │  │   Component     │  │   (New)      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Game Over UI   │  │ Leaderboard UI  │  │ API Client   │ │
│  │   (Enhanced)    │  │     (New)       │  │ (Enhanced)   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Server (src/server/)                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ High Score API  │  │  Score Storage  │  │ Leaderboard  │ │
│  │   (Enhanced)    │  │   (Enhanced)    │  │   Service    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Shared (src/shared/)                                       │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ High Score Types│  │   API Types     │                  │
│  │   (Enhanced)    │  │  (Enhanced)     │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

The High Score Tracker integrates with existing systems at these key points:

1. **Game Over Event**: Automatically triggers score saving when `GameStateManager.endGame()` is called
2. **Score System**: Reads final score from existing `ScoreSystem.getStats()` method
3. **UI System**: Extends the existing game over screen with high score functionality
4. **Server API**: Utilizes existing Redis connection and Reddit authentication
5. **Type System**: Extends existing shared types for type safety

## Components and Interfaces

### Client-Side Components

#### High Score Manager

```typescript
interface HighScoreManager {
  // Core functionality
  saveScore(score: number, gameTime: number): Promise<SaveScoreResponse>;
  getHighScores(): Promise<HighScore[]>;
  getUserBest(): Promise<HighScore | null>;
  
  // UI integration
  showLeaderboard(): void;
  hideLeaderboard(): void;
  updateHighScoreButton(isVisible: boolean): void;
  
  // Event handling
  onScoreSaved(callback: (response: SaveScoreResponse) => void): void;
  onLeaderboardLoaded(callback: (scores: HighScore[]) => void): void;
  onError(callback: (error: string) => void): void;
}
```

#### Leaderboard UI Component

```typescript
interface LeaderboardUI {
  // Display management
  render(scores: HighScore[], currentUser?: string): void;
  show(): void;
  hide(): void;
  
  // State management
  setLoading(isLoading: boolean): void;
  setError(message: string): void;
  clear(): void;
  
  // User interaction
  onClose(callback: () => void): void;
  highlightUserScore(username: string): void;
}
```

#### Enhanced Game Over Screen

```typescript
interface EnhancedGameOverScreen {
  // Existing functionality (preserved)
  show(finalScore: number): void;
  hide(): void;
  onRestart(callback: () => void): void;
  
  // New high score functionality
  showHighScoreButton(): void;
  hideHighScoreButton(): void;
  onHighScoreClick(callback: () => void): void;
  updateScoreStatus(message: string): void;
}
```

### Server-Side Components

#### Enhanced High Score API

The existing high score endpoints will be enhanced with better error handling and performance optimizations:

```typescript
interface HighScoreAPI {
  // Enhanced existing endpoints
  saveScore(req: SaveScoreRequest): Promise<SaveScoreResponse>;
  getHighScores(): Promise<GetHighScoresResponse>;
  getUserBest(): Promise<GetUserBestResponse>;
  
  // New utility methods
  validateScoreData(score: number, gameTime: number): boolean;
  calculateUserRank(username: string, score: number): Promise<number>;
  cleanupOldScores(): Promise<void>;
}
```

#### Score Storage Service

```typescript
interface ScoreStorageService {
  // Core storage operations
  saveUserScore(postId: string, username: string, scoreEntry: HighScore): Promise<void>;
  getUserBestScore(postId: string, username: string): Promise<HighScore | null>;
  getTopScores(postId: string, limit: number): Promise<HighScore[]>;
  
  // Utility operations
  getUserRank(postId: string, username: string, score: number): Promise<number>;
  getScoreCount(postId: string): Promise<number>;
  cleanupExpiredScores(postId: string, maxAge: number): Promise<void>;
}
```

## Data Models

### Enhanced High Score Types

```typescript
// Enhanced HighScore interface with additional metadata
interface HighScore {
  username: string;
  score: number;
  gameTime: number;
  timestamp: number;
  rank: number;
  
  // New fields for enhanced functionality
  isCurrentUser?: boolean;
  achievementLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  scoreImprovement?: number; // Points improved from previous best
}

// Leaderboard display configuration
interface LeaderboardConfig {
  maxEntries: number;
  refreshInterval: number;
  highlightCurrentUser: boolean;
  showAchievements: boolean;
  animateUpdates: boolean;
}

// Score submission metadata
interface ScoreSubmission {
  score: number;
  gameTime: number;
  sessionId: string;
  gameVersion: string;
  timestamp: number;
}
```

### UI State Management

```typescript
interface HighScoreUIState {
  // Display states
  isLeaderboardVisible: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  
  // Data states
  scores: HighScore[];
  userBest?: HighScore;
  lastUpdated: number;
  
  // User interaction states
  selectedEntry?: number;
  isSubmittingScore: boolean;
}
```

## User Interface Design

### Game Over Screen Enhancement

The existing game over screen will be enhanced with a high score button:

```html
<div class="game-over-screen" id="game-over-screen">
  <h2 class="game-over-title">Game Over!</h2>
  <p class="final-score">Final Score: <span id="final-score-value">0</span></p>
  <p class="score-status" id="score-status"></p> <!-- New: Score save status -->
  
  <div class="game-over-buttons">
    <button class="restart-button" id="restart-button">Play Again</button>
    <button class="high-score-button" id="high-score-button">High Scores</button> <!-- New -->
  </div>
</div>
```

### Leaderboard Modal

A new modal component for displaying the leaderboard:

```html
<div class="leaderboard-modal" id="leaderboard-modal" style="display: none;">
  <div class="leaderboard-content">
    <div class="leaderboard-header">
      <h3>High Scores</h3>
      <button class="close-button" id="leaderboard-close">×</button>
    </div>
    
    <div class="leaderboard-body">
      <div class="loading-indicator" id="leaderboard-loading">Loading...</div>
      <div class="error-message" id="leaderboard-error" style="display: none;"></div>
      
      <div class="leaderboard-list" id="leaderboard-list">
        <!-- Dynamic content populated by JavaScript -->
      </div>
    </div>
    
    <div class="leaderboard-footer">
      <p class="last-updated">Last updated: <span id="last-updated-time"></span></p>
    </div>
  </div>
</div>
```

### Leaderboard Entry Template

```html
<div class="leaderboard-entry" data-rank="{rank}">
  <div class="rank-badge rank-{achievementLevel}">{rank}</div>
  <div class="player-info">
    <span class="username">{username}</span>
    <span class="score">{formattedScore}</span>
  </div>
  <div class="meta-info">
    <span class="game-time">{formattedGameTime}</span>
    <span class="date">{formattedDate}</span>
  </div>
</div>
```

## API Integration

### Enhanced Client-Server Communication

The system will use the existing fetch-based API pattern:

```typescript
class HighScoreAPIClient {
  private baseURL = '/api';
  
  async saveScore(score: number, gameTime: number): Promise<SaveScoreResponse> {
    const response = await fetch(`${this.baseURL}/save-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, gameTime })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save score: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async getHighScores(): Promise<HighScore[]> {
    const response = await fetch(`${this.baseURL}/high-scores`);
    
    if (!response.ok) {
      throw new Error(`Failed to get high scores: ${response.statusText}`);
    }
    
    const data: GetHighScoresResponse = await response.json();
    return data.scores;
  }
  
  async getUserBest(): Promise<HighScore | null> {
    const response = await fetch(`${this.baseURL}/user-best`);
    
    if (!response.ok) {
      throw new Error(`Failed to get user best: ${response.statusText}`);
    }
    
    const data: GetUserBestResponse = await response.json();
    return data.bestScore || null;
  }
}
```

### Server-Side Enhancements

The existing server endpoints will be enhanced with better validation and performance:

```typescript
// Enhanced save-score endpoint with better validation
router.post('/api/save-score', async (req, res) => {
  try {
    const { score, gameTime } = req.body;
    
    // Enhanced validation
    if (!validateScoreData(score, gameTime)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid score data'
      });
    }
    
    // Get authenticated user
    const username = await reddit.getCurrentUsername() || 'anonymous';
    
    // Save score with enhanced metadata
    const scoreEntry = await saveScoreWithMetadata(postId, username, score, gameTime);
    
    // Calculate rank efficiently
    const rank = await calculateUserRank(postId, username, score);
    
    res.json({
      type: 'save-score',
      success: true,
      rank,
      message: rank <= 10 ? `You ranked #${rank}!` : 'Score saved successfully!'
    });
    
  } catch (error) {
    handleAPIError(res, error, 'save-score');
  }
});
```

## Error Handling

### Client-Side Error Handling

```typescript
class HighScoreErrorHandler {
  static handleAPIError(error: Error, operation: string): void {
    console.error(`High Score ${operation} Error:`, error);
    
    // Show user-friendly error message
    const errorMessage = this.getUserFriendlyMessage(error, operation);
    this.showErrorToUser(errorMessage);
    
    // Log for debugging
    this.logError(error, operation);
  }
  
  private static getUserFriendlyMessage(error: Error, operation: string): string {
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    switch (operation) {
      case 'save-score':
        return 'Failed to save your score. Your progress is still recorded locally.';
      case 'load-leaderboard':
        return 'Unable to load high scores. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
  
  private static showErrorToUser(message: string): void {
    // Update UI to show error message
    const errorElement = document.getElementById('score-status');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.className = 'score-status error';
    }
  }
}
```

### Server-Side Error Handling

```typescript
function handleAPIError(res: express.Response, error: unknown, operation: string): void {
  console.error(`High Score API ${operation} Error:`, error);
  
  let statusCode = 500;
  let message = 'Internal server error';
  
  if (error instanceof ValidationError) {
    statusCode = 400;
    message = error.message;
  } else if (error instanceof NetworkError) {
    statusCode = 503;
    message = 'Service temporarily unavailable';
  }
  
  res.status(statusCode).json({
    status: 'error',
    message,
    operation
  });
}
```

## Performance Optimizations

### Client-Side Optimizations

1. **Caching Strategy**: Cache leaderboard data for 30 seconds to reduce API calls
2. **Lazy Loading**: Only load leaderboard when user clicks the button
3. **Debounced Updates**: Prevent rapid successive API calls
4. **Progressive Enhancement**: Core game works without high scores if API fails

### Server-Side Optimizations

1. **Efficient Ranking**: Use Redis sorted sets for O(log N) ranking operations
2. **Batch Operations**: Group multiple Redis operations where possible
3. **Data Cleanup**: Automatically remove old scores to prevent storage bloat
4. **Connection Pooling**: Reuse Redis connections efficiently

### Redis Storage Strategy

```typescript
// Optimized Redis key structure
const REDIS_KEYS = {
  // Sorted set for efficient ranking (score as value, timestamp as tie-breaker)
  LEADERBOARD: (postId: string) => `diaper-defense:leaderboard:${postId}`,
  
  // Hash for user metadata
  USER_METADATA: (postId: string, username: string) => 
    `diaper-defense:user:${postId}:${username}`,
  
  // Simple counter for total games played
  GAME_COUNT: (postId: string) => `diaper-defense:games:${postId}`,
  
  // TTL key for cache invalidation
  CACHE_VERSION: (postId: string) => `diaper-defense:cache:${postId}`
};
```

## Mobile Responsiveness

### Touch-Friendly Design

1. **Large Touch Targets**: Minimum 44px touch targets for all interactive elements
2. **Swipe Gestures**: Support swipe-to-close for leaderboard modal
3. **Responsive Layout**: Adapt to various screen sizes and orientations
4. **Performance**: Optimize animations for mobile devices

### CSS Media Queries

```css
/* Mobile-first responsive design */
.leaderboard-modal {
  /* Base mobile styles */
  width: 95vw;
  height: 80vh;
  max-height: 600px;
}

@media (min-width: 768px) {
  .leaderboard-modal {
    width: 500px;
    height: auto;
    max-height: 70vh;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .leaderboard-modal {
    height: 90vh;
    width: 80vw;
  }
}
```

## Security Considerations

### Data Validation

1. **Score Validation**: Implement server-side validation to prevent impossible scores
2. **Rate Limiting**: Prevent spam submissions with rate limiting
3. **Input Sanitization**: Sanitize all user inputs to prevent injection attacks
4. **Authentication**: Use Devvit's built-in Reddit authentication

### Privacy Protection

1. **Username Handling**: Respect Reddit privacy settings for username display
2. **Data Retention**: Implement reasonable data retention policies
3. **Anonymous Users**: Handle anonymous users gracefully
4. **GDPR Compliance**: Ensure compliance with data protection regulations

## Testing Strategy

### Unit Testing

1. **API Client Testing**: Test all API client methods with mocked responses
2. **UI Component Testing**: Test leaderboard rendering and interactions
3. **Error Handling Testing**: Verify proper error handling for all failure scenarios
4. **Data Validation Testing**: Test score validation logic

### Integration Testing

1. **End-to-End Flow**: Test complete score submission and leaderboard display flow
2. **Redis Integration**: Test Redis operations with test database
3. **Authentication Testing**: Test with various Reddit authentication states
4. **Performance Testing**: Verify performance under load

### Manual Testing

1. **Cross-Browser Testing**: Test on major browsers (Chrome, Safari, Firefox)
2. **Mobile Device Testing**: Test on various mobile devices and screen sizes
3. **Network Conditions**: Test with slow/intermittent network connections
4. **User Experience Testing**: Verify intuitive user interactions

## Implementation Notes

### Integration with Existing Code

1. **Minimal Changes**: Preserve existing game functionality completely
2. **Event-Driven**: Use existing game events to trigger high score functionality
3. **Graceful Degradation**: Game works normally if high score system fails
4. **Type Safety**: Maintain strict TypeScript typing throughout

### Development Approach

1. **Incremental Development**: Implement features incrementally with testing
2. **Backward Compatibility**: Ensure existing saved games continue to work
3. **Feature Flags**: Use feature flags for gradual rollout if needed
4. **Documentation**: Maintain comprehensive code documentation

### Deployment Considerations

1. **Database Migration**: Handle existing Redis data gracefully
2. **Version Compatibility**: Ensure compatibility with existing game versions
3. **Rollback Plan**: Maintain ability to rollback changes if needed
4. **Monitoring**: Implement monitoring for high score system health