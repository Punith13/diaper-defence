# Requirements Document

## Introduction

Diaper Defense is a casual arcade-style mini-game built with Three.js for the Devvit platform. The game features a baby at the top of the screen shooting "poop darts" downward while the player controls a diaper at the bottom to catch them. Players earn points for catching poop and lose when they drop too many or catch forbidden "boob poop."

## Glossary

- **Game_System**: The complete Diaper Defense arcade game application
- **Baby_Entity**: The animated character at the top that shoots projectiles
- **Diaper_Entity**: The player-controlled catcher at the bottom of the screen
- **Poop_Projectile**: Falling objects that can be regular, fancy (golden), or boob poop (pink)
- **Game_State**: Current phase of gameplay (START, PLAY, GAME_OVER)
- **Collision_System**: Detection mechanism for poop-diaper interactions
- **Score_System**: Point tracking and miss counting functionality
- **UI_Overlay**: Interface elements displaying score, misses, and game over screen

## Requirements

### Requirement 1

**User Story:** As a player, I want to control a diaper character to catch falling poop projectiles, so that I can earn points and avoid game over conditions.

#### Acceptance Criteria

1. WHEN the player presses left or right arrow keys, THE Game_System SHALL move the Diaper_Entity horizontally along the bottom region
2. WHEN a Poop_Projectile intersects with the Diaper_Entity, THE Collision_System SHALL trigger a catch event and remove the projectile
3. WHEN the player catches a regular poop, THE Score_System SHALL award 10 points
4. WHEN the player catches a fancy poop, THE Score_System SHALL award 50 points
5. IF the player catches a boob poop, THEN THE Game_System SHALL immediately trigger game over

### Requirement 2

**User Story:** As a player, I want to see a baby character that shoots poop projectiles at varying intervals, so that I have targets to catch and gameplay remains challenging.

#### Acceptance Criteria

1. THE Baby_Entity SHALL be positioned at the top center of the game scene
2. WHEN the game is in PLAY state, THE Baby_Entity SHALL emit Poop_Projectiles downward at random intervals
3. WHILE the game progresses, THE Baby_Entity SHALL increase shooting rate every 15 seconds
4. THE Baby_Entity SHALL oscillate horizontally using sine wave motion
5. WHEN shooting, THE Baby_Entity SHALL trigger a shooting animation event

### Requirement 3

**User Story:** As a player, I want different types of poop projectiles with varying point values, so that I can strategize which ones to prioritize catching.

#### Acceptance Criteria

1. THE Game_System SHALL spawn regular poop projectiles that award 10 points when caught
2. THE Game_System SHALL spawn fancy poop projectiles that award 50 points when caught
3. THE Game_System SHALL spawn boob poop projectiles that cause immediate game over when caught
4. WHILE the game progresses, THE Game_System SHALL increase fancy poop spawn probability based on player score
5. THE Poop_Projectile SHALL move downward with slightly randomized velocity

### Requirement 4

**User Story:** As a player, I want clear game over conditions and miss tracking, so that I understand when the game ends and can improve my performance.

#### Acceptance Criteria

1. WHEN a Poop_Projectile reaches the bottom without being caught, THE Score_System SHALL increment the miss counter
2. IF the player misses 2 poops consecutively or simultaneously, THEN THE Game_System SHALL trigger game over
3. WHEN game over occurs, THE UI_Overlay SHALL display a game over banner with restart option
4. THE UI_Overlay SHALL continuously display current score and miss count during gameplay
5. WHEN the restart option is selected, THE Game_System SHALL reset to START state

### Requirement 5

**User Story:** As a player, I want responsive controls that work on both desktop and mobile devices, so that I can play the game on any platform.

#### Acceptance Criteria

1. WHEN using desktop, THE Game_System SHALL respond to left and right arrow key inputs
2. WHEN using mobile, THE Game_System SHALL respond to touch drag gestures
3. THE Diaper_Entity SHALL move smoothly without lag or stuttering
4. THE Game_System SHALL maintain 60 FPS target frame rate
5. THE Game_System SHALL use OrthographicCamera to simulate 2D gameplay

### Requirement 6

**User Story:** As a player, I want visual and audio feedback for game events, so that the gameplay feels engaging and responsive.

#### Acceptance Criteria

1. WHEN a poop is caught, THE Game_System SHALL play a "plop" sound effect
2. WHEN a poop is missed, THE Game_System SHALL play a "splat" sound effect
3. WHEN the baby shoots, THE Game_System SHALL play a "sploot" sound effect
4. WHEN game over occurs, THE Game_System SHALL play a "fail" tone
5. THE Game_System SHALL play a continuous light background music loop

### Requirement 7

**User Story:** As a player, I want the game to integrate seamlessly with Reddit through Devvit, so that I can play it directly within Reddit posts.

#### Acceptance Criteria

1. THE Game_System SHALL run within the Devvit webview environment
2. THE Game_System SHALL display an engaging splash screen with a "Play" button on the Reddit feed
3. WHEN the Play button is clicked, THE Game_System SHALL open in full screen mode
4. THE Game_System SHALL be optimized for mobile-first design considering Reddit's mobile user base
5. THE Game_System SHALL handle network failures gracefully with appropriate fallbacks