import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      // Splash Screen Configuration
      appDisplayName: 'diaper-defense',
      backgroundUri: 'default-splash.png',
      buttonLabel: 'Tap to Start',
      description: 'An exciting interactive experience',
      // entryUri: 'index.html', // This property doesn't exist in the current API
      heading: 'Welcome to the Game!',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameState: 'initial',
      score: 0,
    },
    subredditName: subredditName,
    title: 'diaper-defense',
  });
};
