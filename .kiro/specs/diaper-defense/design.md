# Design Document

## Overview

Diaper Defense is a 2D-style arcade game built with Three.js that runs within the Devvit platform on Reddit. The game uses an orthographic camera to simulate 2D gameplay while leveraging Three.js's 3D capabilities for smooth animations and effects. The architecture follows a modular entity-component pattern with clear separation between game logic, rendering, and platform integration.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Devvit Platform                          │
├─────────────────────────────────────────────────────────────┤
│  Client (src/client/)                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Game Engine   │  │   UI Overlay    │  │ Asset Loader │ │
│  │   (Three.js)    │  │    (HTML/CSS)   │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │    Entities     │  │  Input Handler  │  │ Audio System │ │
│  │ (Baby, Diaper,  │  │ (Keyboard/Touch)│  │              │ │
│  │     Poop)       │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Server (src/server/)                                       │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  Score API      │  │  Game State     │                  │
│  │  Endpoints      │  │  Persistence    │                  │
│  └─────────────────┘  └─────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│  Shared (src/shared/)                                       │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Game Types    │  │   API Types     │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Core Systems

1. **Game Engine**: Three.js-based rendering and game loop
2. **Entity System**: Modular game objects (Baby, Diaper, Poop)
3. **Input System**: Cross-platform input handling
4. **Collision System**: AABB-based collision detection
5. **Audio System**: Web Audio API for sound effects
6. **UI System**: HTML overlay for game interface
7. **State Management**: Game state transitions and persistence

## Components and Interfaces

### Game Engine Core

```typescript
interface GameEngine {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  gameState: GameState;
  
  init(): void;
  update(deltaTime: number): void;
  render(): void;
  resize(width: number, height: number): void;
}

enum GameState {
  START = 'start',
  PLAY = 'play',
  GAME_OVER = 'game_over'
}
```

### Entity System

```typescript
interface Entity {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  
  update(deltaTime: number): void;
  destroy(): void;
}

interface Baby extends Entity {
  shootTimer: number;
  shootInterval: number;
  oscillationPhase: number;
  
  shoot(): Poop;
  updateShootingRate(gameTime: number): void;
}

interface Diaper extends Entity {
  speed: number;
  bounds: { left: number; right: number };
  
  moveLeft(): void;
  moveRight(): void;
  checkBounds(): void;
}

interface Poop extends Entity {
  type: PoopType;
  points: number;
  fallSpeed: number;
  
  checkCollision(diaper: Diaper): boolean;
  isOffScreen(): boolean;
}

enum PoopType {
  REGULAR = 'regular',
  FANCY = 'fancy',
  BOOB = 'boob'
}
```

### Input System

```typescript
interface InputHandler {
  keys: Map<string, boolean>;
  touch: TouchState;
  
  init(): void;
  update(): void;
  isLeftPressed(): boolean;
  isRightPressed(): boolean;
  getTouchDelta(): number;
}

interface TouchState {
  isActive: boolean;
  startX: number;
  currentX: number;
  deltaX: number;
}
```

### Audio System

```typescript
interface AudioManager {
  context: AudioContext;
  sounds: Map<string, AudioBuffer>;
  backgroundMusic: AudioBufferSourceNode;
  
  loadSound(name: string, url: string): Promise<void>;
  playSound(name: string, volume?: number): void;
  playBackgroundMusic(loop: boolean): void;
  stopBackgroundMusic(): void;
}
```

## Data Models

### Game Configuration

```typescript
interface GameConfig {
  scene: {
    width: number;
    height: number;
    bounds: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
  };
  
  baby: {
    position: { x: number; y: number };
    oscillationSpeed: number;
    oscillationAmplitude: number;
    initialShootInterval: number;
    shootIntervalDecrease: number;
  };
  
  diaper: {
    position: { x: number; y: number };
    speed: number;
    size: { width: number; height: number };
  };
  
  poop: {
    types: {
      regular: { points: number; probability: number; color: string };
      fancy: { points: number; probability: number; color: string };
      boob: { points: number; probability: number; color: string };
    };
    fallSpeed: number;
    fallSpeedIncrease: number;
    size: { width: number; height: number };
  };
  
  gameplay: {
    maxMisses: number;
    difficultyIncreaseInterval: number;
    fancyPoopProbabilityIncrease: number;
  };
}
```

### Game State

```typescript
interface GameStateData {
  score: number;
  misses: number;
  gameTime: number;
  currentState: GameState;
  entities: {
    baby: Baby;
    diaper: Diaper;
    poops: Poop[];
  };
  
  reset(): void;
  updateScore(points: number): void;
  incrementMisses(): void;
  checkGameOver(): boolean;
}
```

### Asset Management

```typescript
interface AssetManager {
  textures: Map<string, THREE.Texture>;
  sounds: Map<string, AudioBuffer>;
  
  loadTexture(name: string, url: string): Promise<THREE.Texture>;
  loadSound(name: string, url: string): Promise<AudioBuffer>;
  getTexture(name: string): THREE.Texture;
  getSound(name: string): AudioBuffer;
}
```

## Error Handling

### Client-Side Error Handling

1. **Asset Loading Failures**
   - Fallback to colored geometry if textures fail to load
   - Display loading error message to user
   - Graceful degradation with basic shapes

2. **Audio Context Issues**
   - Handle browsers that require user interaction for audio
   - Fallback to silent mode if Web Audio API unavailable
   - Display audio permission prompts when needed

3. **Performance Issues**
   - Monitor frame rate and reduce visual effects if needed
   - Implement object pooling for projectiles
   - Automatic quality adjustment based on device capabilities

4. **Input Handling Errors**
   - Validate touch events and handle edge cases
   - Prevent default browser behaviors that interfere with game
   - Handle keyboard focus loss gracefully

### Server-Side Error Handling

1. **API Endpoint Errors**
   - Validate all incoming requests
   - Return appropriate HTTP status codes
   - Log errors for debugging while maintaining user privacy

2. **Redis Connection Issues**
   - Implement retry logic for database operations
   - Fallback to local storage for temporary data
   - Handle connection timeouts gracefully

## Testing Strategy

### Unit Testing

1. **Entity Logic Testing**
   - Test collision detection algorithms
   - Verify scoring calculations
   - Test game state transitions

2. **Input System Testing**
   - Mock keyboard and touch events
   - Test input validation and sanitization
   - Verify cross-platform compatibility

3. **Audio System Testing**
   - Test audio loading and playback
   - Mock Web Audio API for headless testing
   - Test volume and timing controls

### Integration Testing

1. **Game Loop Testing**
   - Test complete gameplay cycles
   - Verify entity interactions
   - Test performance under load

2. **API Integration Testing**
   - Test client-server communication
   - Verify data persistence
   - Test error handling scenarios

3. **Platform Integration Testing**
   - Test Devvit webview compatibility
   - Verify mobile responsiveness
   - Test Reddit platform integration

### Performance Testing

1. **Frame Rate Monitoring**
   - Ensure consistent 60 FPS performance
   - Test with multiple entities on screen
   - Monitor memory usage and garbage collection

2. **Asset Loading Performance**
   - Test loading times for textures and sounds
   - Verify progressive loading strategies
   - Test network failure scenarios

3. **Mobile Performance**
   - Test on various mobile devices
   - Verify touch responsiveness
   - Test battery usage optimization

### Visual Testing

1. **Cross-Browser Compatibility**
   - Test rendering consistency across browsers
   - Verify WebGL support and fallbacks
   - Test responsive design on different screen sizes

2. **Accessibility Testing**
   - Test keyboard navigation
   - Verify color contrast for visibility
   - Test with screen readers where applicable

## Implementation Notes

### Three.js Setup

- Use OrthographicCamera with fixed aspect ratio for consistent 2D gameplay
- Implement sprite-based rendering using PlaneGeometry with textures
- Use AmbientLight with soft DirectionalLight for even illumination
- Enable antialiasing for smooth edges on sprites

### Performance Optimizations

- Implement object pooling for frequently created/destroyed entities (Poop projectiles)
- Use frustum culling to avoid rendering off-screen entities
- Batch similar draw calls where possible
- Optimize texture sizes for mobile devices

### Mobile Considerations

- Implement touch controls with appropriate dead zones
- Use CSS viewport meta tag for proper scaling
- Optimize for portrait and landscape orientations
- Consider device performance limitations for effect intensity

### Devvit Integration

- Follow Devvit's webview guidelines for proper embedding
- Implement proper splash screen with engaging visuals
- Handle Devvit lifecycle events appropriately
- Use Devvit's Redis integration for high score persistence