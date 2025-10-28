# Diaper Defense 🍼💩

A hilarious arcade-style mini-game built for Reddit using Three.js and Devvit. Control a diaper to catch falling poop projectiles while avoiding the dreaded "boob poop" that ends your game instantly!

## What is Diaper Defense?

Diaper Defense is a fully playable, fast-paced arcade game where players control a diaper at the bottom of the screen to catch various types of falling poop projectiles shot by a baby at the top. The game features:

- **Complete Gameplay Loop**: Fully functional game with AABB collision detection, comprehensive scoring system, miss tracking, and proper game over conditions
- **Dynamic Difficulty Scaling**: Baby shooting rate increases by 10% every 15 seconds (minimum 500ms), and fancy poop probability scales with score (5% increase per 100 points)
- **Three Distinct Poop Types**: Regular brown poop (10 points), fancy golden poop (50 points), and dangerous pink boob poop (instant game over)
- **Advanced Movement System**: Exponential smoothing interpolation with enhanced input validation, boundary checking, and responsive cross-platform controls
- **Sophisticated Input Handling**: Optimized keyboard controls (arrow keys) and touch controls with 15-pixel dead zones, sensitivity scaling, and input prioritization
- **Rich Visual Effects**: Three.js animations including baby sine wave oscillation, diaper bobbing, enhanced shooting animations with multi-phase effects, particle effects for catches/misses, and smooth 2D-style rendering
- **Polished UI System**: Animated splash screen with gradient backgrounds, real-time HUD with live score/miss updates, and game over screen with restart functionality
- **Advanced Particle System**: Visual feedback with sparkle effects for catches, splash effects for misses, puff effects for shooting, and score pop animations with different patterns based on poop types

## What Makes This Game Unique?

1. **Reddit-Native Gaming**: Built specifically for the Devvit platform, allowing seamless play within Reddit posts with automatic post creation and Reddit user integration
2. **Strategic Risk-Reward Mechanics**: Players must make split-second decisions whether to go for high-value fancy poop while avoiding the instant-death boob poop
3. **Intelligent Adaptive Difficulty**: The game becomes progressively more challenging with faster shooting rates and increasing fancy poop probability, creating a natural skill curve
4. **Mobile-First Design Philosophy**: Optimized for Reddit's mobile-heavy user base with touch drag controls, dead zones, responsive design, and viewport handling
5. **Absurdist Humor**: A lighthearted, ridiculous concept that perfectly matches Reddit's community culture and meme-friendly environment
6. **Technical Innovation**: Uses Three.js orthographic camera to create buttery-smooth 2D-style gameplay with 3D rendering capabilities and advanced particle systems
7. **Enhanced Animation System**: Multi-phase baby shooting animations with anticipation, burst, shake, and recovery phases create dramatic visual feedback

## Technology Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for immersive games
- **[Three.js](https://threejs.org/)**: 3D graphics library used for 2D-style gameplay with smooth animations
- **[Vite](https://vite.dev/)**: Fast build tool for the webview
- **[Express](https://expressjs.com/)**: Backend API for score persistence and game state
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development with strict checking

## How to Play

### Game Objective
Catch as many falling poop projectiles as possible with your diaper while avoiding the pink "boob poop" that will instantly end your game. Survive the increasingly challenging waves and rack up the highest score possible!

### Step-by-Step Instructions

1. **Starting the Game**
   - Click the animated "Play Now" button on the splash screen to begin
   - The splash screen features an engaging title "Diaper Defense" with subtitle "The Ultimate Baby Poop Catching Game!"
   - Feature badges highlight "🍼 Arcade Action", "📱 Mobile Friendly", and "🏆 High Scores"
   - The game smoothly transitions to full gameplay mode with the HUD visible at the top
   - You'll see your diaper (white rectangle) at the bottom and the baby (light pink square) oscillating at the top
   - The sky blue background (#87CEEB) and brown ground line create the game arena

2. **Mastering the Controls**
   - **Desktop Controls**: Use the left (←) and right (→) arrow keys to move your diaper horizontally
     - Exponential smoothing interpolation provides natural, responsive movement with 8.0 smoothing factor
     - Enhanced boundary validation prevents the diaper from moving outside the play area
     - Keys are optimized with proper focus management and prevent unwanted page scrolling
     - Movement speed automatically adapts to diaper speed (15% per key press) for optimal control precision
     - Maximum speed limit prevents overshooting during rapid movement
   - **Mobile Controls**: Touch and drag left or right anywhere on the screen to move your diaper
     - Advanced touch handling with 15-pixel dead zone prevents accidental movements
     - Sensitivity scaling (1.5x multiplier) ensures responsive touch control
     - Input validation prevents invalid movements outside canvas bounds
     - Smooth absolute positioning maps touch coordinates to world coordinates for precise control
     - Touch input takes priority when both keyboard and touch are active
   - The diaper moves with buttery-smooth exponential smoothing and includes enhanced bobbing animation with multiple wave components for visual appeal

3. **Understanding the Poop Arsenal**
   - **Brown Poop (Regular)**: Worth 10 points each - starts at 70% spawn probability
     - The bread and butter of your score - safe to catch and reliable points
     - Brown color (#8B4513) makes them easy to identify
     - Creates standard sparkle and score pop particle effects when caught
   - **Golden Poop (Fancy)**: Worth 50 points each - starts at 25% probability, increases by 5% every 100 points you score
     - High-value targets that become more common as you improve
     - Shimmering gold color (#FFD700) makes them stand out
     - Creates spectacular particle effects with multiple sparkle bursts and delayed celebration effects
     - Risk vs reward: worth going for, but don't compromise your safety
   - **Pink Poop (Boob)**: Instant game over - constant 5% spawn probability throughout the game
     - Hot pink color (#FF69B4) serves as a danger warning
     - Avoid at all costs - catching one immediately ends your game regardless of your miss count
     - Creates ominous splash effects and warning particles before triggering game over
   - All poop projectiles fall at slightly randomized speeds (±25 unit variation) with rotation animation for visual variety

4. **Advanced Game Mechanics**
   - **Baby Behavior**: The baby oscillates horizontally using smooth sine wave motion across the top of the screen
     - Oscillation amplitude of 150 units with speed of 2 units creates predictable but dynamic movement
     - Baby shoots poop at random intervals starting at 2000ms, with ±50% variation (1000-3000ms range)
     - Enhanced shooting animation with 4 phases: anticipation (scale down), burst (scale up + crying), intense shake with rotation, and recovery bounce-back
   - **Progressive Difficulty**: Every 15 seconds, the shooting interval decreases by 10% (minimum 500ms for maximum challenge)
     - This creates a natural difficulty curve that rewards survival and skill development
     - Advanced players will face rapid-fire poop barrages in later stages
   - **Enhanced Visual Feedback System**: 
     - Baby plays multi-phase shooting animations with anticipation, crying effects, variable intensity shaking, and rotation
     - Diaper responds with simplified catch animations (brief scale and brightness flash) and miss animations (red flash feedback)
     - Particle effects provide immediate feedback with different patterns: sparkles for catches, splashes for misses, puffs for shooting
   - **Miss Tracking System**: You can miss up to 2 poop projectiles before the game ends
     - Consecutive misses are tracked separately from total misses for strategic gameplay
     - Successfully catching any poop resets your consecutive miss counter
     - HUD displays both total misses and consecutive misses: "Misses: X (Y consecutive)"
   - **Real-time HUD**: Score and detailed miss information are displayed live in the top corners with smooth animations
   - **Precision Collision Detection**: AABB (Axis-Aligned Bounding Box) collision detection ensures fair and responsive gameplay

5. **Game Over Conditions & Recovery**
   - **Instant Death Scenario**: Catch a pink boob poop (immediate game over regardless of your current miss count)
     - Creates dramatic particle effects with multiple splash bursts
   - **Miss Limit Scenario**: Miss 2 poop projectiles consecutively (they fall off the bottom of the screen)
     - Enhanced miss effects with different particle patterns based on poop type
   - **Game Over Experience**: Smooth transition to game over screen with brown semi-transparent background
     - Shows final score with "Game Over!" title in light pink and "Play Again" button
     - Includes shake animation effects for dramatic game over presentation
   - **Quick Restart**: The restart system preserves your momentum - click "Play Again" to immediately jump back into action

6. **Pro Strategy Guide**
   - **Optimal Positioning**: Stay centered under the baby's oscillation path for maximum coverage area
     - The baby's sine wave motion is predictable - learn the pattern to anticipate poop trajectories
   - **Risk Management Philosophy**: Always prioritize avoiding pink boob poop over catching any other type
     - Better to miss a golden poop than accidentally catch a boob poop
   - **Animation Reading**: Watch for the baby's enhanced 4-phase shooting animation to predict incoming projectiles
     - Anticipation phase (scale down) gives early warning
     - Burst phase (scale up + crying) indicates imminent poop launch
     - Use the shake and recovery phases to position for the next shot
   - **High-Value Target Acquisition**: Actively pursue golden poop when the path is clear
     - The 50-point bonus becomes increasingly common (5% increase per 100 points), making late-game golden poop very frequent
     - Golden poop creates spectacular visual rewards with multiple particle bursts
   - **Speed Adaptation Strategy**: As the game accelerates, shift focus from catching everything to selective, high-value catches
     - Survival becomes more important than score maximization in later stages
   - **Platform-Specific Tips**:
     - **Desktop**: Use quick, precise arrow key taps rather than holding keys for better control
     - **Mobile**: Use smooth drag movements rather than rapid tapping for more accurate positioning
     - **Cross-Platform**: Learn to read the enhanced particle effects - they provide crucial feedback about your performance and poop types

## Getting Started

> Make sure you have Node 22 downloaded on your machine before running!

1. Run `npm create devvit@latest --template=threejs`
2. Go through the installation wizard. You will need to create a Reddit account and connect it to Reddit developers
3. Copy the command on the success page into your terminal

## Development Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

## Game Architecture

### Entity System
The game uses a modular entity-component architecture:

- **Entity Base Class**: Common functionality for all game objects (position, velocity, collision detection)
- **Baby Entity**: Oscillates horizontally and shoots poop at increasing rates
- **Diaper Entity**: Player-controlled catcher with smooth movement and bounds checking
- **Poop Entity**: Projectiles with different types, colors, and point values

### Game States
- **START**: Splash screen with play button
- **PLAY**: Active gameplay with HUD showing score and misses
- **GAME_OVER**: End screen with final score and restart option

### Current Implementation Status
✅ **Fully Implemented & Playable:**
- **Core Game Engine**: Three.js scene setup with orthographic camera for buttery-smooth 2D-style gameplay
- **Complete Entity System**: 
  - Baby entity with sine wave oscillation (150 unit amplitude) and progressive shooting mechanics (10% rate increase every 15 seconds)
  - Enhanced multi-phase shooting animations with anticipation, burst, intense shake with rotation, and recovery phases
  - Diaper entity with exponential smoothing movement (8.0 smoothing factor), comprehensive bounds checking, and enhanced bobbing animation with multiple wave components
  - Poop entity system with three distinct types, randomized velocities (±25 variation), rotation animations, and intelligent score-based probability scaling
- **Sophisticated Input System**: 
  - Keyboard handler with optimized arrow key controls, focus management, and scroll prevention
  - Touch handler with 15-pixel dead zones, 1.5x sensitivity scaling, and multi-touch support
  - Unified InputManager with enhanced movement validation, boundary checking, input prioritization, and continuous/discrete input detection
- **Advanced Game Systems**:
  - AABB collision detection system with precise intersection testing and performance optimization
  - Comprehensive scoring system with miss tracking (total and consecutive), game over conditions, and real-time updates
  - Robust game state management (START/PLAY/GAME_OVER) with proper entity lifecycle handling and smooth transitions
- **Complete Gameplay Experience**:
  - Baby shoots poop projectiles at randomized intervals (1000-3000ms) with progressive difficulty scaling
  - Enhanced visual feedback with multi-phase baby animations and diaper response animations
  - Player catches poop for points or misses trigger carefully balanced game over conditions
  - Real-time collision detection, entity cleanup, and memory management
  - Seamless game reset and restart functionality with state preservation
- **Rich Visual Effects System**: 
  - Advanced particle system with four effect types: catch sparkles, miss splashes, shoot puffs, and score pops
  - Different particle patterns based on poop types (spectacular effects for fancy poop, ominous effects for boob poop)
  - Enhanced entity animations including baby's 4-phase shooting sequence and diaper catch/miss feedback with spin effects
  - Smooth interpolated movement with visual polish throughout
- **Polished UI Experience**: 
  - Engaging animated splash screen with gradient backgrounds, floating particles, bouncing title, and feature badges
  - Real-time HUD showing score and detailed miss information (total and consecutive) with live updates
  - Professional game over screen with semi-transparent brown background, final score display, and prominent restart functionality
  - Comprehensive CSS animations including fade, scale, slide, bounce, shake, and pulse effects
- **Cross-Platform Excellence**: Mobile-first responsive design with touch-optimized controls, viewport handling, and responsive breakpoints

🚧 **Future Enhancement Opportunities:**
- Audio system with immersive sound effects and background music
- Asset management system with custom textures and sprites
- Performance optimizations including object pooling for projectiles
- Server-side score persistence and community leaderboards
- Additional visual effects and screen shake feedback

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.
