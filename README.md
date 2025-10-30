# Diaper Defense 🍼💩

A hilarious arcade-style mini-game built for Reddit using Three.js and Devvit. Control a diaper to catch falling poop projectiles while avoiding the dreaded "boob poop" that ends your game instantly!

## What is Diaper Defense?

Diaper Defense is a production-ready, fast-paced arcade game built specifically for Reddit using Three.js and the Devvit platform. Players control a white diaper at the bottom of the screen to catch various types of falling poop projectiles shot by an expressive baby at the top. The baby oscillates smoothly across the screen using sine wave motion and displays contextual emotions - crying when shooting regular or dangerous poop, and happy when shooting valuable golden poop.

This absurdly entertaining game combines strategic risk-reward gameplay with Reddit's signature humor, creating an addictive experience perfect for quick gaming sessions within Reddit posts. The game features a complete gameplay loop with precise AABB collision detection, progressive difficulty scaling that increases baby shooting speed every 15 seconds, and rich visual effects including particle systems and multi-phase animations.

Players must make split-second strategic decisions about which poop to catch while avoiding the pink "boob poop" that instantly ends the game. The innovative miss system adds depth - missing regular/golden poop counts against you, but missing boob poop is actually beneficial and resets your consecutive miss counter. With its mobile-first responsive design, cross-platform input handling, and seamless Reddit integration, Diaper Defense delivers a uniquely entertaining experience that perfectly captures the platform's playful spirit.

### Core Game Features

- **Complete Gameplay Loop**: Production-ready game with precise AABB collision detection, comprehensive scoring system (10/50 points for regular/fancy poop), intelligent miss tracking (total and consecutive), and balanced game over conditions (2 consecutive misses or catching boob poop)

- **Dynamic Difficulty Scaling**: Progressive challenge system where baby shooting rate increases by 10% every 15 seconds (minimum 500ms interval), and fancy poop probability scales with score (5% increase per 100 points, max 40%)

- **Three Strategic Poop Types**: 
  - **🟤 Regular Poop**: 10 points, 60% spawn rate - reliable scoring opportunity with brown color (#8B4513)
  - **🟡 Fancy Golden Poop**: 50 points, 25% base rate (increases with score) - high-value risk/reward with gold color (#FFD700)
  - **🩷 Boob Poop**: Instant game over if caught, 15% spawn rate - strategic avoidance required with hot pink color (#FF69B4)

- **Advanced Movement System**: Exponential smoothing interpolation (8.0 smoothing factor) with comprehensive input validation, boundary checking, and responsive cross-platform controls that prevent overshooting and jittering

- **Sophisticated Input Handling**: 
  - **Keyboard**: Optimized arrow key controls with configurable movement speed and focus management
  - **Touch**: Drag controls with 15-pixel dead zones, 1.5x sensitivity scaling, and multi-touch support
  - **Unified System**: InputManager with enhanced movement validation, boundary checking, and input prioritization

- **Rich Visual Effects**: Three.js orthographic camera rendering with baby sine wave oscillation (150 unit amplitude), diaper bobbing with multiple wave components, enhanced 4-phase shooting animations (anticipation → burst → shake → recovery), and contextual baby facial expressions

- **Advanced Particle System**: Dynamic visual feedback with sparkle effects for catches, splash effects for misses, puff effects for shooting, and score pop animations with different intensities based on poop types (spectacular effects for fancy poop)

- **Polished UI Experience**: Animated splash screen with gradient backgrounds and floating particles, real-time HUD showing score and detailed miss information ("X (Y consecutive)"), and professional game over screen with restart functionality

- **Immersive Audio Experience**: Complete Web Audio API integration with contextual sound effects (plop, splat, sploot, fail, fancy catch, warning), procedural background music system, and graceful fallback handling for audio failures

## What Makes This Game Innovative?

1. **Reddit-Native Gaming Experience**: Built specifically for the Devvit platform, allowing seamless play within Reddit posts with automatic post creation and Reddit user integration - no external links or downloads required

2. **Strategic Risk-Reward Mechanics**: Players must make split-second decisions whether to go for high-value fancy poop while avoiding the instant-death boob poop, creating intense moment-to-moment gameplay

3. **Intelligent Adaptive Difficulty**: The game becomes progressively more challenging with faster shooting rates (10% increase every 15 seconds) and increasing fancy poop probability (5% per 100 points), creating a natural skill curve that keeps players engaged

4. **Mobile-First Design Philosophy**: Optimized for Reddit's mobile-heavy user base with touch drag controls, 15-pixel dead zones, 1.5x sensitivity scaling, responsive design, and viewport handling that works flawlessly across devices

5. **Absurdist Humor with Heart**: A lighthearted, ridiculous concept that perfectly matches Reddit's community culture and meme-friendly environment while delivering genuinely engaging gameplay

6. **Technical Innovation**: Uses Three.js orthographic camera to create buttery-smooth 2D-style gameplay with 3D rendering capabilities, advanced particle systems, and procedural audio generation

7. **Enhanced Animation System**: Multi-phase baby shooting animations with anticipation, burst, intense shake with rotation, and recovery phases create dramatic visual feedback, plus dynamic facial expressions that change based on poop type for enhanced emotional engagement

8. **Procedural Audio Design**: Complete Web Audio API integration with contextual sound effects, procedural audio generation using MusicGenerator and SoundGenerator, and dynamic background music that responds to game events without requiring external audio files

9. **Procedural Asset Generation**: Advanced TextureGenerator system creates all game sprites programmatically using HTML5 Canvas, eliminating external asset dependencies while providing rich visual detail including baby expressions (crying/happy), poop variations, and diaper textures

10. **Smart Miss System**: Innovative miss tracking where missing pink "boob poop" is actually beneficial and resets consecutive misses, adding strategic depth to the avoidance mechanics

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
   - The sky blue background (#87CEEB) and brown ground line create your poop-catching arena

#### 2. **Mastering the Controls**
   - **Desktop Players**: Use left (←) and right (→) arrow keys to move your diaper
     - Smooth exponential movement (8.0 smoothing factor) provides natural, responsive control
     - Enhanced boundary validation keeps you in the play area
     - Optimized for rapid movements without overshooting
   - **Mobile Players**: Touch and drag anywhere on screen to move your diaper
     - 15-pixel dead zone prevents accidental movements
     - 1.5x sensitivity scaling ensures responsive touch control
     - Smooth positioning maps your touch to precise diaper movement
   - The diaper features a gentle bobbing animation with multiple wave components and moves with buttery-smooth interpolation

#### 3. **Know Your Poop Types**
   - **🟤 Brown Poop (Regular)**: 10 points each, 60% spawn rate
     - Your reliable source of points - safe to catch
     - Falls at base speed (200 units/second) with ±25 variation for unpredictability
     - Creates sparkle effects and plays satisfying "plop" sound
     - Features rotation animation while falling for visual appeal
   - **🟡 Golden Poop (Fancy)**: 50 points each, 25% base rate (increases with score)
     - High-value targets worth the risk - probability increases 5% per 100 points (max 40%)
     - Falls with same physics as regular poop but with golden visual effects
     - Creates spectacular particle bursts and special sound effects
     - Triggers enhanced catch animations with scale-up and spin effects
   - **🩷 Pink Poop (Boob)**: INSTANT GAME OVER if caught, 15% spawn rate
     - **Catching it = Game Over**: Touching this poop immediately ends your game with dramatic effects
     - **Missing it = Good**: Letting boob poop fall actually helps by resetting consecutive misses!
     - Falls with same physics but creates ominous particle effects when shot
     - Features fade-out animation when caught before triggering game over
     - Strategic decision: sometimes it's better to let it fall than risk catching it

#### 4. **Understanding Game Mechanics**
   - **Baby Behavior**: The baby oscillates smoothly across the top using sine wave motion (150 unit amplitude)
     - Shoots poop at random intervals (starting at 2000ms base, with 0.5-1.5x randomization)
     - Shooting rate increases by 10% every 15 seconds (minimum 500ms interval for maximum challenge)
     - Features dramatic 4-phase shooting animation: anticipation → burst → intense shake with rotation → recovery
     - **Dynamic Expressions**: Baby shows different emotions based on poop type being shot
       - 😢 Crying face for regular and boob poop (default state)
       - 😊 Happy face when shooting golden fancy poop
       - Expression changes before shooting, then returns to crying after 1 second
     - Poop is shot from slightly below baby position (30 units down) for realistic trajectory
   - **Progressive Difficulty**: Every 15 seconds, shooting speed increases by 10%
     - Creates natural difficulty curve from casual to intense
     - Minimum 500ms interval ensures maximum challenge is still playable
   - **Smart Miss System**: You can miss up to 2 consecutive poop projectiles
     - **Important**: Missing pink boob poop is actually GOOD and resets your consecutive miss counter!
     - Only brown and golden poop count as actual misses
     - Total misses and consecutive misses are tracked separately
     - Catching any poop resets your consecutive miss counter
     - HUD shows: "Misses: X (Y consecutive)" with real-time updates
   - **Collision Detection**: Precise AABB (Axis-Aligned Bounding Box) system ensures fair gameplay

#### 5. **Game Over Scenarios**
   - **Instant Death**: Catch a pink boob poop (immediate game over with dramatic particle effects)
   - **Miss Limit**: Miss 2 brown or golden poop projectiles in a row (pink poop misses don't count!)
   - **Recovery**: Click "Play Again" to restart immediately with full audio-visual experience
   - **Final Score**: Your score is displayed prominently on the game over screen with semi-transparent brown background

#### 6. **Pro Tips for High Scores**
   - **Stay Centered**: Position yourself under the baby's oscillation path for optimal coverage
   - **Master the Miss System**: Remember that missing pink boob poop is actually beneficial!
     - Let boob poop fall to reset your consecutive miss counter
     - Only worry about catching brown and golden poop
   - **Risk Management**: Always avoid pink poop, even if it means missing golden ones nearby
   - **Read Baby Expressions**: Watch for the happy face - it means valuable golden poop is coming!
   - **Use Animation Cues**: The baby's 4-phase shooting sequence helps predict trajectories
   - **Adapt to Speed**: Focus on survival over score maximization as difficulty increases
   - **Platform Optimization**:
     - Desktop: Use quick, precise key taps for better control and rapid repositioning
     - Mobile: Use smooth drag movements for accurate positioning without overshooting

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
✅ **Fully Implemented & Production Ready:**
- **Core Game Engine**: Three.js scene setup with orthographic camera for buttery-smooth 2D-style gameplay with comprehensive debug logging for miss detection and collision systems
- **Complete Entity System**: 
  - Baby entity with sine wave oscillation (150 unit amplitude) and progressive shooting mechanics (10% rate increase every 15 seconds, minimum 500ms)
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
  - Baby shoots poop projectiles at randomized intervals (1000-3000ms base) with progressive difficulty scaling
  - Enhanced visual feedback with multi-phase baby animations, dynamic facial expressions, and diaper response animations
  - Baby displays contextual emotions: crying for regular/boob poop, happy for golden fancy poop (resets after 1 second)
  - Player catches poop for points or misses trigger carefully balanced game over conditions
  - Real-time collision detection, entity cleanup, and memory management
  - Seamless game reset and restart functionality with state preservation
- **Rich Visual Effects System**: 
  - Advanced particle system with four effect types: catch sparkles, miss splashes, shoot puffs, and score pops
  - Different particle patterns based on poop types (spectacular effects for fancy poop, ominous effects for boob poop)
  - Enhanced entity animations including baby's 4-phase shooting sequence with contextual facial expressions
  - Dynamic baby emotions: crying texture for regular/boob poop, happy texture for golden fancy poop
  - Diaper catch/miss feedback with spin effects and smooth interpolated movement with visual polish throughout
- **Polished UI Experience**: 
  - Engaging animated splash screen with gradient backgrounds (#87CEEB to #B0E0E6), floating particles, bouncing title, and feature badges
  - Real-time HUD showing score and detailed miss information (total and consecutive) with live updates
  - Professional game over screen with semi-transparent brown background, final score display, and prominent restart functionality
  - Comprehensive CSS animations including fade, scale, slide, bounce, shake, and pulse effects with cubic-bezier transitions
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

- **Advanced Asset Management System**: 
  - Comprehensive AssetManager with progressive loading, retry logic, and fallback systems
  - Procedural texture generation using TextureGenerator for all game sprites
  - Dynamic baby expressions: crying texture (default) and happy texture (for golden poop)
  - Optimized texture settings for 2D sprite rendering with proper filtering and wrapping
  - Memory management with texture disposal and asset state tracking

- **Performance Optimization Systems**:
  - Advanced object pooling system for Poop entities with configurable pool sizes (15 initial, 100 maximum)
  - Generic ObjectPool class supporting any poolable entity with automatic lifecycle management
  - PoopPool specialized implementation with factory functions and memory optimization
  - Performance monitoring with PerformanceManager tracking FPS, render time, and update time
  - Quality settings system with automatic adjustment based on device capabilities
  - Comprehensive error handling with ErrorHandler singleton providing graceful fallbacks and user-friendly error messages

- **Server Integration & Persistence**:
  - Complete Express server with Redis integration for score persistence and game state synchronization
  - RESTful API endpoints: `/api/save-score`, `/api/high-scores`, `/api/user-best`, `/api/save-game-state`, `/api/load-game-state`
  - Reddit user authentication integration with automatic username detection
  - High score leaderboards with ranking system and user best score tracking
  - Game state persistence allowing players to resume sessions across browser refreshes
  - Comprehensive input validation and error handling for all API endpoints

🚧 **Future Enhancement Opportunities:**
- Additional visual effects and screen shake feedback
- Custom sprite artwork to replace procedural textures
- Multiplayer features and real-time competitions
- Achievement system and unlockable content

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.
