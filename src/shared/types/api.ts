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
};

export type SaveScoreResponse = {
  type: "save-score";
  success: boolean;
  rank?: number;
  message?: string;
};

export type GetHighScoresResponse = {
  type: "high-scores";
  scores: HighScore[];
};

export type HighScore = {
  username: string;
  score: number;
  gameTime: number;
  timestamp: number;
  rank: number;
};

export type GetUserBestResponse = {
  type: "user-best";
  bestScore?: HighScore | undefined;
};

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
