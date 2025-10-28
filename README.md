# Diaper Defense 🍼💩

A hilarious arcade-style mini-game built for Reddit using Three.js and Devvit. Control a diaper to catch falling poop projectiles while avoiding the dreaded "boob poop" that ends your game instantly!

## What is Diaper Defense?

Diaper Defense is a fully playable, fast-paced arcade game where players control a diaper at the bottom of the screen to catch various types of falling poop projectiles shot by a crying baby at the top. This absurdly entertaining game combines strategic gameplay with Reddit's signature humor, creating an addictive experience that's perfect for quick gaming sessions within Reddit posts.

### Core Game Features

- **Complete Gameplay Loop**: Fully functional game with precise AABB collision detection, comprehensive scoring system, miss tracking, and balanced game over conditions
- **Dynamic Difficulty Scaling**: Baby shooting rate increases by 10% every 15 seconds (minimum 500ms), and fancy poop probability scales with score (5% increase per 100 points)
- **Three Distinct Poop Types**: 
  - Regular brown poop (10 points, 70% spawn rate)
  - Fancy golden poop (50 points, 25% base spawn rate, increases with score)
  - Dangerous pink boob poop (instant game over, constant 5% spawn rate)
- **Advanced Movement System**: Exponential smoothing interpolation with enhanced input validation, boundary checking, and responsive cross-platform controls
- **Sophisticated Input Handling**: Optimized keyboard controls (arrow keys) and touch controls with 15-pixel dead zones, sensitivity scaling, and input prioritization
- **Rich Visual Effects**: Three.js animations including baby sine wave oscillation, diaper bobbing, enhanced shooting animations with multi-phase effects, particle effects for catches/misses, and smooth 2D-style rendering
- **Polished UI System**: Animated splash screen with gradient backgrounds, real-time HUD with live score/miss updates, and game over screen with restart functionality
- **Advanced Particle System**: Visual feedback with sparkle effects for catches, splash effects for misses, puff effects for shooting, and score pop animations with different patterns based on poop types
- **Immersive Audio Experience**: Complete Web Audio API integration with contextual sound effects (plop, splat, sploot, fail), procedural background music system, and dynamic audio generation

## What Makes This Game Innovative?

1. **Reddit-Native Gaming Experience**: Built specifically for the Devvit platform, allowing seamless play within Reddit posts with automatic post creation and Reddit user integration - no external links or downloads required

2. **Strategic Risk-Reward Mechanics**: Players must make split-second decisions whether to go for high-value fancy poop while avoiding the instant-death boob poop, creating intense moment-to-moment gameplay

3. **Intelligent Adaptive Difficulty**: The game becomes progressively more challenging with faster shooting rates and increasing fancy poop probability, creating a natural skill curve that keeps players engaged

4. **Mobile-First Design Philosophy**: Optimized for Reddit's mobile-heavy user base with touch drag controls, dead zones, responsive design, and viewport handling that works flawlessly across devices

5. **Absurdist Humor with Heart**: A lighthearted, ridiculous concept that perfectly matches Reddit's community culture and meme-friendly environment while delivering genuinely engaging gameplay

6. **Technical Innovation**: Uses Three.js orthographic camera to create buttery-smooth 2D-style gameplay with 3D rendering capabilities, advanced particle systems, and procedural audio generation

7. **Enhanced Animation System**: Multi-phase baby shooting animations with anticipation, burst, shake, and recovery phases create dramatic visual feedback that makes every action feel impactful

8. **Procedural Audio Design**: Complete Web Audio API integration with contextual sound effects, procedural audio generation, and dynamic background music that responds to game events without requiring external audio files

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

#### 1. **Starting Your Adventure**
   - Click the animated "Play Now" button on the splash screen to begin your poop-catching journey
   - The splash screen welcomes you with "Diaper Defense: The Ultimate Baby Poop Catching Game!"
   - Feature badges showcase "🍼 Arcade Action", "📱 Mobile Friendly", and "🏆 High Scores"
   - The game smoothly transitions to full gameplay with the HUD displaying your score and miss count
   - Audio system automatically initializes with upbeat background music and sound effects
   - You'll see your white diaper at the bottom and the pink baby oscillating at the top
   - The sky blue background and brown ground line create your poop-catching arena

#### 2. **Mastering the Controls**
   - **Desktop Players**: Use left (←) and right (→) arrow keys to move your diaper
     - Smooth exponential movement provides natural, responsive control
     - Enhanced boundary validation keeps you in the play area
     - Optimized for rapid movements without overshooting
   - **Mobile Players**: Touch and drag anywhere on screen to move your diaper
     - 15-pixel dead zone prevents accidental movements
     - Sensitivity scaling ensures responsive touch control
     - Smooth positioning maps your touch to precise diaper movement
   - The diaper features a gentle bobbing animation and moves with buttery-smooth interpolation

#### 3. **Know Your Poop Types**
   - **🟤 Brown Poop (Regular)**: 10 points each, 70% spawn rate
     - Your reliable source of points - safe to catch
     - Creates sparkle effects and plays satisfying "plop" sound
   - **🟡 Golden Poop (Fancy)**: 50 points each, 25% base rate (increases with score)
     - High-value targets worth the risk
     - Creates spectacular particle bursts and special sound effects
     - Becomes more common as you score higher (5% increase per 100 points)
   - **🩷 Pink Poop (Boob)**: INSTANT GAME OVER, 5% spawn rate
     - Avoid at all costs! Catching one immediately ends your game
     - Creates ominous effects and warning sounds
     - Constant threat throughout the game

#### 4. **Understanding Game Mechanics**
   - **Baby Behavior**: The baby oscillates smoothly across the top using sine wave motion
     - Shoots poop at random intervals (starting at 1-3 seconds)
     - Features dramatic 4-phase shooting animation: anticipation → burst → shake → recovery
   - **Progressive Difficulty**: Every 15 seconds, shooting speed increases by 10%
     - Creates natural difficulty curve from casual to intense
     - Minimum 500ms interval ensures maximum challenge is still playable
   - **Miss System**: You can miss up to 2 consecutive poop projectiles
     - Total misses and consecutive misses are tracked separately
     - Catching any poop resets your consecutive miss counter
     - HUD shows: "Misses: X (Y consecutive)"
   - **Collision Detection**: Precise AABB system ensures fair gameplay

#### 5. **Game Over Scenarios**
   - **Instant Death**: Catch a pink boob poop (immediate game over)
   - **Miss Limit**: Miss 2 poop projectiles in a row
   - **Recovery**: Click "Play Again" to restart immediately with full audio-visual experience

#### 6. **Pro Tips for High Scores**
   - **Stay Centered**: Position yourself under the baby's oscillation path
   - **Risk Management**: Always avoid pink poop, even if it means missing golden ones
   - **Read Animations**: Use the baby's 4-phase shooting sequence to predict trajectories
   - **Adapt to Speed**: Focus on survival over score maximization in later stages
   - **Platform Optimization**:
     - Desktop: Use quick, precise key taps for better control
     - Mobile: Use smooth drag movements for accurate positioning

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

- **Complete Audio System**: 
  - Web Audio API integration with AudioManager singleton for optimal performance
  - Comprehensive sound effects: "plop" for catches, "splat" for misses, "sploot" for baby shooting, "fail" for game over
  - Background music system with looping capabilities and volume controls
  - Audio context management with user interaction handling for browser compatibility
  - Procedural sound generation with MusicGenerator and SoundGenerator for dynamic audio
  - Master volume, SFX volume, and music volume controls with real-time adjustment
  - Graceful fallback system with silent buffers for failed audio loads
  - Audio state tracking and context resumption after user interaction

🚧 **Future Enhancement Opportunities:**
- Asset management system with custom textures and sprites
- Performance optimizations including object pooling for projectiles
- Server-side score persistence and community leaderboards
- Additional visual effects and screen shake feedback

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.
