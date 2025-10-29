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

// Score persistence endpoints
router.post<{}, SaveScoreResponse | { status: string; message: string }, SaveScoreRequest>(
  '/api/save-score',
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
      const { score, gameTime, username: providedUsername } = req.body;

      // Validate input
      if (typeof score !== 'number' || score < 0) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid score: must be a non-negative number',
        });
        return;
      }

      if (typeof gameTime !== 'number' || gameTime < 0) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid gameTime: must be a non-negative number',
        });
        return;
      }

      // Get current username from Reddit context
      const currentUsername = await reddit.getCurrentUsername();
      const username = providedUsername || currentUsername || 'anonymous';

      // Create score entry
      const scoreEntry: HighScore = {
        username,
        score,
        gameTime,
        timestamp: Date.now(),
        rank: 0, // Will be calculated when retrieving scores
      };

      // Save to Redis
      const userScoreKey = `diaper-defense:user-scores:${postId}:${username}`;
      
      // Save score using a simple counter-based approach
      const scoreCountKey = `diaper-defense:score-count:${postId}`;
      const currentCount = await redis.incrBy(scoreCountKey, 1);
      const scoreKey = `diaper-defense:score:${postId}:${currentCount}`;
      
      await redis.set(scoreKey, JSON.stringify(scoreEntry));
      
      // Save user's best score if this is better
      const existingUserScore = await redis.get(userScoreKey);
      if (!existingUserScore || JSON.parse(existingUserScore).score < score) {
        await redis.set(userScoreKey, JSON.stringify(scoreEntry));
      }

      // For now, we'll calculate rank when retrieving scores
      const userRank = undefined; // Will be calculated in get-high-scores endpoint

      const response: SaveScoreResponse = {
        type: 'save-score',
        success: true,
        message: 'Score saved successfully!',
      };
      if (userRank !== undefined) {
        response.rank = userRank;
        response.message = `You ranked #${userRank}!`;
      }
      res.json(response);

    } catch (error) {
      console.error(`Save Score Error for post ${postId}:`, error);
      let errorMessage = 'Failed to save score';
      if (error instanceof Error) {
        errorMessage = `Save score failed: ${error.message}`;
      }
      res.status(500).json({ status: 'error', message: errorMessage });
    }
  }
);

router.get<{}, GetHighScoresResponse | { status: string; message: string }>(
  '/api/high-scores',
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
      // Get all scores by iterating through the counter
      const scoreCountKey = `diaper-defense:score-count:${postId}`;
      const totalScores = await redis.get(scoreCountKey);
      const scoreCount = totalScores ? parseInt(totalScores) : 0;
      
      const scores: HighScore[] = [];
      for (let i = 1; i <= scoreCount; i++) {
        try {
          const scoreKey = `diaper-defense:score:${postId}:${i}`;
          const scoreData = await redis.get(scoreKey);
          if (scoreData) {
            const parsedScore = JSON.parse(scoreData);
            scores.push(parsedScore);
          }
        } catch (parseError) {
          console.error('Error parsing score data:', parseError);
          // Skip invalid entries
        }
      }

      // Sort by score descending and take top 10
      scores.sort((a, b) => b.score - a.score);
      const topScores = scores.slice(0, 10);
      
      // Add ranks
      topScores.forEach((score, index) => {
        score.rank = index + 1;
      });

      res.json({
        type: 'high-scores',
        scores: topScores,
      });

    } catch (error) {
      console.error(`Get High Scores Error for post ${postId}:`, error);
      let errorMessage = 'Failed to retrieve high scores';
      if (error instanceof Error) {
        errorMessage = `Get high scores failed: ${error.message}`;
      }
      res.status(500).json({ status: 'error', message: errorMessage });
    }
  }
);

router.get<{}, GetUserBestResponse | { status: string; message: string }>(
  '/api/user-best',
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
      const currentUsername = await reddit.getCurrentUsername();
      const username = currentUsername || 'anonymous';
      
      const userScoreKey = `diaper-defense:user-scores:${postId}:${username}`;
      const userScoreData = await redis.get(userScoreKey);
      
      let bestScore: HighScore | undefined;
      if (userScoreData) {
        try {
          bestScore = JSON.parse(userScoreData);
          
          // Calculate user's current rank by getting all scores and sorting
          const scoreCountKey = `diaper-defense:score-count:${postId}`;
          const totalScores = await redis.get(scoreCountKey);
          const scoreCount = totalScores ? parseInt(totalScores) : 0;
          
          const allScores: HighScore[] = [];
          for (let i = 1; i <= scoreCount; i++) {
            try {
              const scoreKey = `diaper-defense:score:${postId}:${i}`;
              const scoreData = await redis.get(scoreKey);
              if (scoreData) {
                allScores.push(JSON.parse(scoreData));
              }
            } catch (e) {
              // Skip invalid entries
            }
          }
          
          // Sort by score descending
          allScores.sort((a, b) => b.score - a.score);
          
          // Find user's rank
          if (bestScore) {
            const userRank = allScores.findIndex(s => s.username === bestScore!.username && s.score === bestScore!.score);
            if (userRank !== -1) {
              bestScore.rank = userRank + 1;
            }
          }
        } catch (parseError) {
          console.error('Error parsing user score data:', parseError);
        }
      }

      const response: GetUserBestResponse = {
        type: 'user-best',
        bestScore,
      };
      res.json(response);

    } catch (error) {
      console.error(`Get User Best Error for post ${postId}:`, error);
      let errorMessage = 'Failed to retrieve user best score';
      if (error instanceof Error) {
        errorMessage = `Get user best failed: ${error.message}`;
      }
      res.status(500).json({ status: 'error', message: errorMessage });
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
