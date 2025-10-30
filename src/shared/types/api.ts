export type InitResponse = {
  type: "init";
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: "increment";
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: "decrement";
  postId: string;
  count: number;
};

// Game Score API Types
export type SaveScoreRequest = {
  score: number;
  gameTime: number;
  username?: string;
  // Enhanced fields for better score validation
  sessionId?: string;
  gameVersion?: string;
  timestamp?: number;
};

export type SaveScoreResponse = {
  type: "save-score";
  success: boolean;
  rank?: number;
  message?: string;
  // Enhanced fields for better user feedback
  isNewBest?: boolean;
  scoreImprovement?: number;
  achievementLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalPlayers?: number;
};

export type GetHighScoresResponse = {
  type: "high-scores";
  scores: HighScore[];
  // Enhanced fields for better leaderboard functionality
  totalPlayers?: number;
  lastUpdated?: number;
  currentUserRank?: number;
};

export type HighScore = {
  username: string;
  score: number;
  gameTime: number;
  timestamp: number;
  rank: number;
  
  // Enhanced optional fields for UI enhancements
  isCurrentUser?: boolean;
  achievementLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  scoreImprovement?: number; // Points improved from previous best
};

export type GetUserBestResponse = {
  type: "user-best";
  bestScore?: HighScore | undefined;
};

// Leaderboard display configuration
export interface LeaderboardConfig {
  maxEntries: number;
  refreshInterval: number;
  highlightCurrentUser: boolean;
  showAchievements: boolean;
  animateUpdates: boolean;
}

// Score submission metadata for enhanced validation
export interface ScoreSubmission {
  score: number;
  gameTime: number;
  sessionId: string;
  gameVersion: string;
  timestamp: number;
}

// UI state management for high score components
export interface HighScoreUIState {
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

// Game State Synchronization Types
export type GameStateData = {
  score: number;
  misses: number;
  gameTime: number;
  currentState: 'START' | 'PLAY' | 'GAME_OVER';
  lastUpdated: number;
};

export type SaveGameStateRequest = {
  gameState: GameStateData;
};

export type SaveGameStateResponse = {
  type: "save-game-state";
  success: boolean;
  message?: string;
};

export type LoadGameStateResponse = {
  type: "load-game-state";
  gameState?: GameStateData | undefined;
};
