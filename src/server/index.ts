import express from 'express';
import { 
  InitResponse, 
  IncrementResponse, 
  DecrementResponse,
  SaveScoreRequest,
  SaveScoreResponse,
  GetHighScoresResponse,
  GetUserBestResponse,
  HighScore,
  GameStateData,
  SaveGameStateRequest,
  SaveGameStateResponse,
  LoadGameStateResponse
} from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

// Debug endpoint for leaderboard
router.get('/api/debug/leaderboard', async (_req, res) => {
  try {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({ error: 'Missing postId' });
      return;
    }

    console.log('=== LEADERBOARD DEBUG ===');
    
    const leaderboardKey = `diaper-defense:leaderboard:${postId}`;
    const totalPlayersKey = `diaper-defense:total-players:${postId}`;
    
    const [leaderboardData, totalPlayersData] = await Promise.all([
      redis.get(leaderboardKey),
      redis.get(totalPlayersKey)
    ]);
    
    console.log('Leaderboard key:', leaderboardKey);
    console.log('Leaderboard data:', leaderboardData);
    console.log('Total players data:', totalPlayersData);
    
    // Try to get current user's best score
    let userBestData = null;
    try {
      const currentUsername = await reddit.getCurrentUsername();
      if (currentUsername) {
        const userBestKey = `diaper-defense:user-best:${postId}:${currentUsername}`;
        userBestData = await redis.get(userBestKey);
        console.log('User best key:', userBestKey);
        console.log('User best data:', userBestData);
      }
    } catch (error) {
      console.log('Failed to get user best:', error);
    }
    
    res.json({
      postId,
      leaderboardKey,
      leaderboardData: leaderboardData ? JSON.parse(leaderboardData) : null,
      totalPlayers: totalPlayersData ? parseInt(totalPlayersData) : 0,
      userBestData: userBestData ? JSON.parse(userBestData) : null,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Leaderboard debug failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    });
  }
});

// Debug endpoint to test Redis operations
router.get('/api/debug/redis', async (_req, res) => {
  try {
    console.log('=== REDIS DEBUG TEST ===');
    
    const testKey = 'debug-test';
    const testValue = 'hello-world';
    
    console.log('Setting test value...');
    await redis.set(testKey, testValue);
    console.log('Test value set successfully');
    
    console.log('Getting test value...');
    const retrievedValue = await redis.get(testKey);
    console.log('Retrieved value:', retrievedValue);
    
    console.log('Deleting test value...');
    await redis.del(testKey);
    console.log('Test value deleted');
    
    res.json({
      status: 'success',
      message: 'Redis operations completed successfully',
      testValue: retrievedValue,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Redis debug test failed:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    });
  }
});

// Health check endpoint for debugging
router.get('/api/health', async (_req, res) => {
  try {
    console.log('Health check requested');
    
    // Test Redis connection by trying a simple operation
    let redisStatus = 'unknown';
    try {
      await redis.set('health-check', 'test');
      const testValue = await redis.get('health-check');
      redisStatus = testValue === 'test' ? 'connected' : 'error';
      await redis.del('health-check');
    } catch (redisError) {
      console.error('Redis test failed:', redisError);
      redisStatus = 'disconnected';
    }
    
    // Test Reddit context
    const postId = context.postId;
    console.log('Post ID from context:', postId);
    
    // Test current user
    let currentUser = 'unknown';
    try {
      currentUser = await reddit.getCurrentUsername() || 'anonymous';
    } catch (userError) {
      console.error('Failed to get current user:', userError);
      currentUser = 'error';
    }
    
    console.log('Health check results:', { redisStatus, postId, currentUser });
    
    res.json({
      status: 'healthy',
      redis: redisStatus,
      postId: postId || 'missing',
      currentUser,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    });
  }
});

// Enhanced score validation function
function validateScoreData(score: number, gameTime: number): { isValid: boolean; error?: string } {
  // Basic type and range validation
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return { isValid: false, error: 'Score must be a valid number' };
  }
  
  if (score < 0) {
    return { isValid: false, error: 'Score cannot be negative' };
  }
  
  if (typeof gameTime !== 'number' || !Number.isFinite(gameTime)) {
    return { isValid: false, error: 'Game time must be a valid number' };
  }
  
  if (gameTime < 0) {
    return { isValid: false, error: 'Game time cannot be negative' };
  }
  
  // Enhanced validation to prevent impossible scores
  const maxReasonableScore = 1000000; // 1 million points max
  if (score > maxReasonableScore) {
    return { isValid: false, error: 'Score exceeds maximum reasonable limit' };
  }
  
  // Validate score vs game time ratio (prevent impossibly high scores for short game times)
  const minGameTimeForScore = Math.max(1, score / 10000); // At least 1 second per 10k points
  if (gameTime > 0 && gameTime < minGameTimeForScore) {
    return { isValid: false, error: 'Score too high for the given game time' };
  }
  
  // Maximum reasonable game time (24 hours)
  const maxGameTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  if (gameTime > maxGameTime) {
    return { isValid: false, error: 'Game time exceeds maximum reasonable duration' };
  }
  
  return { isValid: true };
}

// Calculate achievement level based on score
function calculateAchievementLevel(score: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (score >= 100000) return 'platinum';
  if (score >= 50000) return 'gold';
  if (score >= 25000) return 'silver';
  return 'bronze';
}

// Calculate user rank by comparing with leaderboard scores
async function calculateUserRank(postId: string, score: number): Promise<number> {
  const leaderboardKey = `diaper-defense:leaderboard:${postId}`;
  const leaderboardData = await redis.get(leaderboardKey);
  
  let leaderboardEntries: HighScore[] = [];
  if (leaderboardData) {
    try {
      leaderboardEntries = JSON.parse(leaderboardData);
    } catch (e) {
      leaderboardEntries = [];
    }
  }
  
  // Count scores higher than current score
  const higherScoresCount = leaderboardEntries.filter(entry => entry.score > score).length;
  
  return higherScoresCount + 1;
}

// Score persistence endpoints
router.post<{}, SaveScoreResponse | { status: string; message: string }, SaveScoreRequest>(
  '/api/save-score',
  async (req, res): Promise<void> => {
    console.log('=== SAVE SCORE REQUEST START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { postId } = context;
    console.log('Context postId:', postId);
    
    if (!postId) {
      console.error('ERROR: Missing postId from context');
      res.status(400).json({
        status: 'error',
        message: 'Post ID is required but missing from context',
      });
      return;
    }

    try {
      const { score, gameTime, username: providedUsername, sessionId, gameVersion } = req.body;
      console.log('Extracted data:', { score, gameTime, providedUsername, sessionId, gameVersion });
      console.log('Game time in seconds:', Math.floor(gameTime / 1000));

      // Enhanced score validation
      const validation = validateScoreData(score, gameTime);
      if (!validation.isValid) {
        res.status(400).json({
          status: 'error',
          message: validation.error || 'Invalid score data',
        });
        return;
      }

      // Get current username from Reddit context
      console.log('Getting current username from Reddit...');
      let currentUsername: string | null = null;
      try {
        const redditUsername = await reddit.getCurrentUsername();
        currentUsername = redditUsername || null;
        console.log('Reddit getCurrentUsername() returned:', currentUsername);
      } catch (usernameError) {
        console.error('Failed to get username from Reddit:', usernameError);
        currentUsername = null;
      }
      
      const username = providedUsername || currentUsername || 'anonymous';
      console.log('Final username decision:', {
        providedUsername,
        currentUsername,
        finalUsername: username
      });

      // Check for existing user best score to detect improvement
      const userBestKey = `diaper-defense:user-best:${postId}:${username}`;
      console.log('Checking existing best score with key:', userBestKey);
      const existingBestData = await redis.get(userBestKey);
      console.log('Existing best data:', existingBestData);
      let previousBest = 0;
      let isNewBest = false;
      let scoreImprovement = 0;

      if (existingBestData) {
        try {
          const existingBest = JSON.parse(existingBestData);
          previousBest = existingBest.score || 0;
        } catch (parseError) {
          console.warn(`Failed to parse existing best score for user ${username}:`, parseError);
        }
      }

      if (score > previousBest) {
        isNewBest = true;
        scoreImprovement = score - previousBest;
      }

      // Create enhanced score entry
      const timestamp = Date.now();
      const achievementLevel = calculateAchievementLevel(score);
      
      const scoreEntry: HighScore = {
        username,
        score,
        gameTime,
        timestamp,
        rank: 0, // Will be calculated below
        achievementLevel,
        ...(isNewBest && scoreImprovement > 0 && { scoreImprovement }),
      };

      // Update leaderboard with this score
      const leaderboardKey = `diaper-defense:leaderboard:${postId}`;
      console.log('Getting leaderboard with key:', leaderboardKey);
      const leaderboardData = await redis.get(leaderboardKey);
      console.log('Leaderboard data:', leaderboardData);
      
      let leaderboardEntries: HighScore[] = [];
      if (leaderboardData) {
        try {
          leaderboardEntries = JSON.parse(leaderboardData);
          console.log('Parsed leaderboard entries:', leaderboardEntries.length);
        } catch (e) {
          console.error('Failed to parse leaderboard data:', e);
          leaderboardEntries = [];
        }
      }
      
      // Remove any existing entry for this user (to avoid duplicates)
      leaderboardEntries = leaderboardEntries.filter(entry => entry.username !== username);
      
      // Add new score entry if it's a new best (only new bests go on leaderboard)
      if (isNewBest) {
        leaderboardEntries.push(scoreEntry);
        console.log(`Added new leaderboard entry for ${username} with score ${score}`);
      } else {
        // If not a new best, but user has a best score, make sure it's in the leaderboard
        if (existingBestData) {
          try {
            const existingBest = JSON.parse(existingBestData);
            // Add the existing best score to leaderboard if it's not already there
            const existingEntry = leaderboardEntries.find(entry => entry.username === username);
            if (!existingEntry) {
              leaderboardEntries.push(existingBest);
              console.log(`Added existing best score for ${username} to leaderboard: ${existingBest.score}`);
            }
          } catch (parseError) {
            console.warn('Failed to parse existing best score for leaderboard:', parseError);
          }
        }
      }
      
      // Sort by score descending and keep only top 100 to prevent unlimited growth
      leaderboardEntries.sort((a, b) => b.score - a.score);
      if (leaderboardEntries.length > 100) {
        leaderboardEntries = leaderboardEntries.slice(0, 100);
      }
      
      console.log('Saving updated leaderboard to Redis...');
      await redis.set(leaderboardKey, JSON.stringify(leaderboardEntries));
      console.log('Leaderboard saved successfully');

      // Update user's best score if this is better
      if (isNewBest) {
        console.log('Saving new best score for user:', username);
        console.log('Score entry:', JSON.stringify(scoreEntry, null, 2));
        await redis.set(userBestKey, JSON.stringify(scoreEntry));
        console.log('New best score saved successfully');
      } else {
        console.log('Score is not a new best, skipping user best update');
      }
      
      // Update user's score history for improvement tracking
      const userHistoryKey = `diaper-defense:user-history:${postId}:${username}`;
      const historyData = await redis.get(userHistoryKey);
      
      let history: number[] = [];
      if (historyData) {
        try {
          history = JSON.parse(historyData);
        } catch (e) {
          history = [];
        }
      }
      
      history.push(score);
      // Keep only last 10 scores to prevent unlimited growth
      if (history.length > 10) {
        history = history.slice(-10);
      }
      
      await redis.set(userHistoryKey, JSON.stringify(history));

      // Calculate user's current rank
      const userRank = await calculateUserRank(postId, score);
      
      // Get total number of unique players by counting user-best keys
      const totalPlayersKey = `diaper-defense:total-players:${postId}`;
      let totalPlayers = 0;
      const totalPlayersData = await redis.get(totalPlayersKey);
      if (totalPlayersData) {
        totalPlayers = parseInt(totalPlayersData);
      }
      
      // Increment total players if this is a new user
      if (isNewBest && previousBest === 0) {
        totalPlayers = await redis.incrBy(totalPlayersKey, 1);
      }

      // Prepare enhanced response
      const response: SaveScoreResponse = {
        type: 'save-score',
        success: true,
        rank: userRank,
        isNewBest,
        achievementLevel,
        totalPlayers,
        message: isNewBest 
          ? (userRank <= 10 ? `New personal best! You ranked #${userRank}!` : `New personal best! Score: ${score.toLocaleString()}`)
          : (userRank <= 10 ? `You ranked #${userRank}!` : 'Score saved successfully!'),
      };

      if (isNewBest && scoreImprovement > 0) {
        response.scoreImprovement = scoreImprovement;
      }

      res.json(response);

    } catch (error) {
      console.error(`Save Score Error for post ${postId}:`, error);
      
      // Enhanced error handling with more specific messages
      let errorMessage = 'Failed to save score due to an internal error';
      let statusCode = 500;
      
      if (error instanceof Error) {
        if (error.message.includes('Redis')) {
          errorMessage = 'Database temporarily unavailable. Please try again.';
          statusCode = 503;
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
          statusCode = 408;
        } else if (error.message.includes('validation')) {
          errorMessage = `Validation error: ${error.message}`;
          statusCode = 400;
        } else {
          errorMessage = `Save operation failed: ${error.message}`;
        }
      }
      
      res.status(statusCode).json({ 
        status: 'error', 
        message: errorMessage 
      });
    }
  }
);

// Cache management for leaderboard
const LEADERBOARD_CACHE_TTL = 30; // 30 seconds cache
const leaderboardCache = new Map<string, { data: HighScore[]; timestamp: number; totalPlayers: number }>();

// Get user metadata efficiently
async function getUserMetadata(postId: string, username: string): Promise<{ bestScore?: HighScore }> {
  const userBestKey = `diaper-defense:user-best:${postId}:${username}`;
  const bestScoreData = await redis.get(userBestKey);
  
  if (bestScoreData) {
    try {
      const bestScore = JSON.parse(bestScoreData);
      return { bestScore };
    } catch (parseError) {
      console.warn(`Failed to parse user best score for ${username}:`, parseError);
    }
  }
  
  return {};
}

// Optimized leaderboard retrieval using user best scores
async function getOptimizedLeaderboard(postId: string, limit: number = 10, offset: number = 0): Promise<{ scores: HighScore[]; totalPlayers: number }> {
  console.log(`Getting leaderboard for postId: ${postId}, limit: ${limit}, offset: ${offset}`);
  
  const totalPlayersKey = `diaper-defense:total-players:${postId}`;
  const totalPlayersData = await redis.get(totalPlayersKey);
  const totalPlayers = totalPlayersData ? parseInt(totalPlayersData) : 0;
  
  console.log(`Total players: ${totalPlayers}`);
  
  // Get the leaderboard
  const leaderboardKey = `diaper-defense:leaderboard:${postId}`;
  const leaderboardData = await redis.get(leaderboardKey);
  
  let leaderboardEntries: HighScore[] = [];
  if (leaderboardData) {
    try {
      leaderboardEntries = JSON.parse(leaderboardData);
      console.log(`Found ${leaderboardEntries.length} leaderboard entries`);
    } catch (e) {
      console.error('Failed to parse leaderboard data:', e);
      leaderboardEntries = [];
    }
  }
  
  // If leaderboard is empty but we have players, rebuild it from user best scores
  if (leaderboardEntries.length === 0 && totalPlayers > 0) {
    console.log('Leaderboard is empty but we have players, rebuilding from user best scores...');
    await rebuildLeaderboardFromUserBests(postId);
    
    // Try to get the leaderboard again after rebuilding
    const rebuiltLeaderboardData = await redis.get(leaderboardKey);
    if (rebuiltLeaderboardData) {
      try {
        leaderboardEntries = JSON.parse(rebuiltLeaderboardData);
        console.log(`Rebuilt leaderboard with ${leaderboardEntries.length} entries`);
      } catch (e) {
        console.error('Failed to parse rebuilt leaderboard data:', e);
        leaderboardEntries = [];
      }
    }
  }
  
  // Sort by score descending
  leaderboardEntries.sort((a, b) => b.score - a.score);
  
  // Apply pagination
  const paginatedEntries = leaderboardEntries.slice(offset, offset + limit);
  
  // Add ranks
  const scores: HighScore[] = paginatedEntries.map((entry, index) => ({
    ...entry,
    rank: offset + index + 1,
    isCurrentUser: false, // Will be set later
  }));
  
  console.log(`Returning ${scores.length} scores for leaderboard`);
  
  return { scores, totalPlayers };
}

// Rebuild leaderboard from existing user best scores
async function rebuildLeaderboardFromUserBests(postId: string): Promise<void> {
  console.log('Rebuilding leaderboard from user best scores...');
  
  // This is a simplified approach - in a real system you'd want to scan for all user-best keys
  // For now, we'll try to get the current user's best score and add it to the leaderboard
  try {
    const currentUsername = await reddit.getCurrentUsername();
    if (currentUsername) {
      const userBestKey = `diaper-defense:user-best:${postId}:${currentUsername}`;
      const userBestData = await redis.get(userBestKey);
      
      if (userBestData) {
        try {
          const userBest = JSON.parse(userBestData);
          const leaderboardKey = `diaper-defense:leaderboard:${postId}`;
          
          // Create a new leaderboard with this user's best score
          const leaderboardEntries = [userBest];
          await redis.set(leaderboardKey, JSON.stringify(leaderboardEntries));
          
          console.log(`Rebuilt leaderboard with user ${currentUsername}'s best score: ${userBest.score}`);
        } catch (parseError) {
          console.error('Failed to parse user best score during rebuild:', parseError);
        }
      }
    }
  } catch (error) {
    console.error('Failed to rebuild leaderboard:', error);
  }
}

router.get<{}, GetHighScoresResponse | { status: string; message: string }>(
  '/api/high-scores',
  async (req, res): Promise<void> => {
    const { postId } = context;
    
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'Post ID is required but missing from context',
      });
      return;
    }

    try {
      // Parse query parameters for pagination
      const query = req.query || {};
      const limit = Math.min(parseInt((query.limit as string) || '10'), 50); // Max 50 entries
      const offset = Math.max(parseInt((query.offset as string) || '0'), 0);
      
      // Check cache first (only for first page with default limit)
      const cacheKey = `${postId}:${limit}:${offset}`;
      const now = Date.now();
      const cached = leaderboardCache.get(cacheKey);
      
      if (cached && (now - cached.timestamp) < (LEADERBOARD_CACHE_TTL * 1000)) {
        // Get current user's rank if authenticated
        let currentUserRank: number | undefined;
        try {
          const currentUsername = await reddit.getCurrentUsername();
          if (currentUsername) {
            const userBestKey = `diaper-defense:user-best:${postId}:${currentUsername}`;
            const userBestData = await redis.get(userBestKey);
            if (userBestData) {
              const userBest = JSON.parse(userBestData);
              currentUserRank = await calculateUserRank(postId, userBest.score);
            }
          }
        } catch (userError) {
          // Continue without user rank if there's an error
          console.warn('Failed to get current user rank:', userError);
        }
        
        res.json({
          type: 'high-scores',
          scores: cached.data,
          totalPlayers: cached.totalPlayers,
          lastUpdated: cached.timestamp,
          ...(currentUserRank !== undefined && { currentUserRank }),
        });
        return;
      }

      // Get optimized leaderboard data
      const { scores, totalPlayers } = await getOptimizedLeaderboard(postId, limit, offset);
      
      // Get current user's rank and highlight their score
      let currentUserRank: number | undefined;
      try {
        const currentUsername = await reddit.getCurrentUsername();
        if (currentUsername) {
          // Mark current user's scores
          scores.forEach(score => {
            if (score.username === currentUsername) {
              score.isCurrentUser = true;
            }
          });
          
          // Get user's rank if they have a best score
          const userMetadata = await getUserMetadata(postId, currentUsername);
          if (userMetadata.bestScore) {
            currentUserRank = await calculateUserRank(postId, userMetadata.bestScore.score);
          }
        }
      } catch (userError) {
        // Continue without user-specific data if there's an error
        console.warn('Failed to get current user data:', userError);
      }

      // Cache the result (only cache first page with default settings)
      if (offset === 0 && limit <= 10) {
        leaderboardCache.set(cacheKey, {
          data: scores,
          timestamp: now,
          totalPlayers,
        });
        
        // Clean up old cache entries (keep only last 10)
        if (leaderboardCache.size > 10) {
          const oldestKey = leaderboardCache.keys().next().value;
          if (oldestKey) {
            leaderboardCache.delete(oldestKey);
          }
        }
      }

      const response: GetHighScoresResponse = {
        type: 'high-scores',
        scores,
        totalPlayers,
        lastUpdated: now,
        ...(currentUserRank !== undefined && { currentUserRank }),
      };

      res.json(response);

    } catch (error) {
      console.error(`Get High Scores Error for post ${postId}:`, error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to retrieve high scores due to an internal error';
      let statusCode = 500;
      
      if (error instanceof Error) {
        if (error.message.includes('Redis')) {
          errorMessage = 'Leaderboard temporarily unavailable. Please try again.';
          statusCode = 503;
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out while loading leaderboard. Please try again.';
          statusCode = 408;
        } else {
          errorMessage = `Leaderboard retrieval failed: ${error.message}`;
        }
      }
      
      res.status(statusCode).json({ 
        status: 'error', 
        message: errorMessage 
      });
    }
  }
);

// Calculate score improvement from previous sessions
async function getScoreImprovement(postId: string, username: string, currentScore: number): Promise<number> {
  // Get user's score history (simplified approach)
  const userHistoryKey = `diaper-defense:user-history:${postId}:${username}`;
  const historyData = await redis.get(userHistoryKey);
  
  let previousBest = 0;
  if (historyData) {
    try {
      const history = JSON.parse(historyData);
      if (Array.isArray(history)) {
        // Find the highest score that's less than current score
        for (const score of history) {
          if (score < currentScore && score > previousBest) {
            previousBest = score;
          }
        }
      }
    } catch (e) {
      // If parsing fails, assume no previous best
    }
  }
  
  return currentScore - previousBest;
}

router.get<{}, GetUserBestResponse | { status: string; message: string }>(
  '/api/user-best',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'Post ID is required but missing from context',
      });
      return;
    }

    try {
      const currentUsername = await reddit.getCurrentUsername();
      const username = currentUsername || 'anonymous';
      
      // Get user's best score efficiently
      const userBestKey = `diaper-defense:user-best:${postId}:${username}`;
      const userBestData = await redis.get(userBestKey);
      
      let bestScore: HighScore | undefined;
      
      if (userBestData) {
        try {
          bestScore = JSON.parse(userBestData);
          
          // Calculate user's current rank efficiently using Redis sorted sets
          if (bestScore) {
            const userRank = await calculateUserRank(postId, bestScore.score);
            bestScore.rank = userRank;
            
            // Mark as current user
            bestScore.isCurrentUser = true;
            
            // Ensure achievement level is set
            if (!bestScore.achievementLevel) {
              bestScore.achievementLevel = calculateAchievementLevel(bestScore.score);
            }
            
            // Calculate score improvement from previous best (if not already set)
            if (bestScore.scoreImprovement === undefined) {
              const improvement = await getScoreImprovement(postId, username, bestScore.score);
              if (improvement > 0) {
                bestScore.scoreImprovement = improvement;
              }
            }
          }
          
        } catch (parseError) {
          console.error(`Error parsing user best score data for ${username}:`, parseError);
          bestScore = undefined;
        }
      }

      // Enhanced response with additional metadata
      const response: GetUserBestResponse = {
        type: 'user-best',
        bestScore,
      };
      
      res.json(response);

    } catch (error) {
      console.error(`Get User Best Error for post ${postId}:`, error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to retrieve user best score due to an internal error';
      let statusCode = 500;
      
      if (error instanceof Error) {
        if (error.message.includes('Redis')) {
          errorMessage = 'User data temporarily unavailable. Please try again.';
          statusCode = 503;
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out while loading user data. Please try again.';
          statusCode = 408;
        } else if (error.message.includes('authentication')) {
          errorMessage = 'Authentication required to view personal best score.';
          statusCode = 401;
        } else {
          errorMessage = `User best score retrieval failed: ${error.message}`;
        }
      }
      
      res.status(statusCode).json({ 
        status: 'error', 
        message: errorMessage 
      });
    }
  }
);

// Game state synchronization endpoints
router.post<{}, SaveGameStateResponse | { status: string; message: string }, SaveGameStateRequest>(
  '/api/save-game-state',
  async (req, res): Promise<void> => {
    const { postId } = context;
    
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const { gameState } = req.body;

      // Validate game state data
      if (!gameState || typeof gameState !== 'object') {
        res.status(400).json({
          status: 'error',
          message: 'Invalid game state: gameState object is required',
        });
        return;
      }

      const { score, misses, gameTime, currentState } = gameState;

      // Validate individual fields
      if (typeof score !== 'number' || score < 0) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid game state: score must be a non-negative number',
        });
        return;
      }

      if (typeof misses !== 'number' || misses < 0) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid game state: misses must be a non-negative number',
        });
        return;
      }

      if (typeof gameTime !== 'number' || gameTime < 0) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid game state: gameTime must be a non-negative number',
        });
        return;
      }

      if (!['START', 'PLAY', 'GAME_OVER'].includes(currentState)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid game state: currentState must be START, PLAY, or GAME_OVER',
        });
        return;
      }

      // Get current username from Reddit context
      const currentUsername = await reddit.getCurrentUsername();
      const username = currentUsername || 'anonymous';

      // Create validated game state with timestamp
      const validatedGameState: GameStateData = {
        score,
        misses,
        gameTime,
        currentState,
        lastUpdated: Date.now(),
      };

      // Save to Redis
      const gameStateKey = `diaper-defense:game-state:${postId}:${username}`;
      await redis.set(gameStateKey, JSON.stringify(validatedGameState));

      // Set expiration to 24 hours to prevent stale data accumulation
      await redis.expire(gameStateKey, 86400);

      res.json({
        type: 'save-game-state',
        success: true,
        message: 'Game state saved successfully',
      });

    } catch (error) {
      console.error(`Save Game State Error for post ${postId}:`, error);
      let errorMessage = 'Failed to save game state';
      if (error instanceof Error) {
        errorMessage = `Save game state failed: ${error.message}`;
      }
      res.status(500).json({ status: 'error', message: errorMessage });
    }
  }
);

router.get<{}, LoadGameStateResponse | { status: string; message: string }>(
  '/api/load-game-state',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      // Get current username from Reddit context
      const currentUsername = await reddit.getCurrentUsername();
      const username = currentUsername || 'anonymous';

      const gameStateKey = `diaper-defense:game-state:${postId}:${username}`;
      const gameStateData = await redis.get(gameStateKey);
      
      let gameState: GameStateData | undefined;
      if (gameStateData) {
        try {
          const parsedState = JSON.parse(gameStateData);
          
          // Validate the loaded state structure
          if (
            typeof parsedState.score === 'number' &&
            typeof parsedState.misses === 'number' &&
            typeof parsedState.gameTime === 'number' &&
            ['START', 'PLAY', 'GAME_OVER'].includes(parsedState.currentState) &&
            typeof parsedState.lastUpdated === 'number'
          ) {
            gameState = parsedState;
          } else {
            console.warn(`Invalid game state structure for user ${username}, ignoring`);
          }
        } catch (parseError) {
          console.error('Error parsing game state data:', parseError);
          // Delete corrupted data
          await redis.del(gameStateKey);
        }
      }

      const response: LoadGameStateResponse = {
        type: 'load-game-state',
        gameState,
      };
      res.json(response);

    } catch (error) {
      console.error(`Load Game State Error for post ${postId}:`, error);
      let errorMessage = 'Failed to load game state';
      if (error instanceof Error) {
        errorMessage = `Load game state failed: ${error.message}`;
      }
      res.status(500).json({ status: 'error', message: errorMessage });
    }
  }
);

router.delete<{}, { status: string; message: string }>(
  '/api/clear-game-state',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      // Get current username from Reddit context
      const currentUsername = await reddit.getCurrentUsername();
      const username = currentUsername || 'anonymous';

      const gameStateKey = `diaper-defense:game-state:${postId}:${username}`;
      await redis.del(gameStateKey);

      res.json({
        status: 'success',
        message: 'Game state cleared successfully',
      });

    } catch (error) {
      console.error(`Clear Game State Error for post ${postId}:`, error);
      let errorMessage = 'Failed to clear game state';
      if (error instanceof Error) {
        errorMessage = `Clear game state failed: ${error.message}`;
      }
      res.status(500).json({ status: 'error', message: errorMessage });
    }
  }
);

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

app.use(router);

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(getServerPort());
