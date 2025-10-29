import { AudioManager } from './AudioManager';
import { SoundGenerator } from './SoundGenerator';
import { MusicGenerator } from './MusicGenerator';

/**
 * Game Audio System
 * Manages all audio for the Diaper Defense game
 */
export class GameAudio {
  private static instance: GameAudio | null = null;
  private audioManager: AudioManager;
  private soundGenerator: SoundGenerator | null = null;
  private musicGenerator: MusicGenerator | null = null;
  private isInitialized: boolean = false;
  private currentMusic: string | null = null;

  // Sound effect names
  public static readonly SOUNDS = {
    PLOP: 'plop',
    SPLAT: 'splat', 
    SPLOOT: 'sploot',
    FAIL: 'fail',
    FANCY_CATCH: 'fancy_catch',
    WARNING: 'warning'
  } as const;

  // Music track names
  public static readonly MUSIC = {
    BACKGROUND: 'background_music',
    AMBIENT: 'ambient_music',
    VICTORY: 'victory_music'
  } as const;

  private constructor() {
    this.audioManager = AudioManager.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): GameAudio {
    if (!GameAudio.instance) {
      GameAudio.instance = new GameAudio();
    }
    return GameAudio.instance;
  }

  /**
   * Initialize the game audio system
   * Should be called after user interaction
   */
  public async init(): Promise<void> {
    try {
      // Initialize audio manager
      await this.audioManager.init();
      
      // Create sound generator if audio context is available
      if (this.audioManager.isReady() || this.audioManager.getContextState() !== 'closed') {
        await this.generateGameSounds();
      }
      
      this.isInitialized = true;
      // console.log('GameAudio initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize GameAudio:', error);
    }
  }

  /**
   * Resume audio after user interaction
   */
  public async resumeAudio(): Promise<void> {
    try {
      await this.audioManager.resumeContext();
      
      // Generate sounds if not already done
      if (!this.soundGenerator && this.audioManager.isReady()) {
        await this.generateGameSounds();
      }
      
    } catch (error) {
      console.error('Failed to resume audio:', error);
    }
  }

  /**
   * Generate all game sounds and music programmatically
   */
  private async generateGameSounds(): Promise<void> {
    try {
      // Generate all game sounds
      const soundNames = Object.values(GameAudio.SOUNDS);
      
      for (const soundName of soundNames) {
        await this.generateSoundOnDemand(soundName);
      }
      
      // Generate all music tracks
      const musicNames = Object.values(GameAudio.MUSIC);
      
      for (const musicName of musicNames) {
        await this.generateMusicOnDemand(musicName);
      }
      
      // console.log('All game sounds and music generated successfully');
      
    } catch (error) {
      console.error('Failed to generate game sounds and music:', error);
    }
  }

  /**
   * Generate a specific sound on demand
   */
  private async generateSoundOnDemand(soundName: string): Promise<void> {
    if (!this.audioManager.isReady()) {
      return;
    }

    // We need access to the audio context to generate sounds
    // Create a temporary context for sound generation
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const tempContext = new AudioContextClass();
      
      if (!this.soundGenerator) {
        this.soundGenerator = new SoundGenerator(tempContext);
      }
      
      let buffer: AudioBuffer;
      
      switch (soundName) {
        case GameAudio.SOUNDS.PLOP:
          buffer = this.soundGenerator.generatePlopSound();
          break;
        case GameAudio.SOUNDS.SPLAT:
          buffer = this.soundGenerator.generateSplatSound();
          break;
        case GameAudio.SOUNDS.SPLOOT:
          buffer = this.soundGenerator.generateSplootSound();
          break;
        case GameAudio.SOUNDS.FAIL:
          buffer = this.soundGenerator.generateFailSound();
          break;
        case GameAudio.SOUNDS.FANCY_CATCH:
          buffer = this.soundGenerator.generateFancyCatchSound();
          break;
        case GameAudio.SOUNDS.WARNING:
          buffer = this.soundGenerator.generateWarningSound();
          break;
        default:
          console.warn(`Unknown sound: ${soundName}`);
          return;
      }
      
      // Store the generated buffer in the audio manager
      this.audioManager.addSoundBuffer(soundName, buffer);
      // console.log(`Generated and stored sound: ${soundName}`);
      
      // Clean up temporary context
      await tempContext.close();
      
    } catch (error) {
      console.error(`Failed to generate sound ${soundName}:`, error);
    }
  }

  /**
   * Generate a specific music track on demand
   */
  private async generateMusicOnDemand(musicName: string): Promise<void> {
    if (!this.audioManager.isReady()) {
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const tempContext = new AudioContextClass();
      
      if (!this.musicGenerator) {
        this.musicGenerator = new MusicGenerator(tempContext);
      }
      
      let buffer: AudioBuffer;
      
      switch (musicName) {
        case GameAudio.MUSIC.BACKGROUND:
          buffer = this.musicGenerator.generateBackgroundMusic();
          break;
        case GameAudio.MUSIC.AMBIENT:
          buffer = this.musicGenerator.generateAmbientMusic();
          break;
        case GameAudio.MUSIC.VICTORY:
          buffer = this.musicGenerator.generateVictoryMusic();
          break;
        default:
          console.warn(`Unknown music track: ${musicName}`);
          return;
      }
      
      // Store the generated buffer in the audio manager
      this.audioManager.addSoundBuffer(musicName, buffer);
      // console.log(`Generated and stored music: ${musicName}`);
      
      // Clean up temporary context
      await tempContext.close();
      
    } catch (error) {
      console.error(`Failed to generate music ${musicName}:`, error);
    }
  }

  /**
   * Play sound for successful poop catch
   */
  public playPlopSound(volume: number = 1.0): void {
    this.playGameSound(GameAudio.SOUNDS.PLOP, volume).catch(console.error);
  }

  /**
   * Play sound for missed poop
   */
  public playSplatSound(volume: number = 1.0): void {
    this.playGameSound(GameAudio.SOUNDS.SPLAT, volume).catch(console.error);
  }

  /**
   * Play sound for baby shooting
   */
  public playSplootSound(volume: number = 0.8): void {
    this.playGameSound(GameAudio.SOUNDS.SPLOOT, volume).catch(console.error);
  }

  /**
   * Play sound for game over
   */
  public playFailSound(volume: number = 1.0): void {
    this.playGameSound(GameAudio.SOUNDS.FAIL, volume).catch(console.error);
  }

  /**
   * Play sound for fancy poop catch
   */
  public playFancyCatchSound(volume: number = 1.0): void {
    this.playGameSound(GameAudio.SOUNDS.FANCY_CATCH, volume).catch(console.error);
  }

  /**
   * Play warning sound for boob poop catch
   */
  public playWarningSound(volume: number = 1.0): void {
    this.playGameSound(GameAudio.SOUNDS.WARNING, volume).catch(console.error);
  }

  /**
   * Start background music for gameplay
   */
  public async startBackgroundMusic(): Promise<void> {
    await this.playMusic(GameAudio.MUSIC.BACKGROUND, true);
  }

  /**
   * Start ambient music for menu/splash screen
   */
  public async startAmbientMusic(): Promise<void> {
    await this.playMusic(GameAudio.MUSIC.AMBIENT, true);
  }

  /**
   * Play victory music (non-looping)
   */
  public async playVictoryMusic(): Promise<void> {
    await this.playMusic(GameAudio.MUSIC.VICTORY, false);
  }

  /**
   * Stop all background music
   */
  public stopBackgroundMusic(): void {
    this.audioManager.stopBackgroundMusic();
    this.currentMusic = null;
  }

  /**
   * Generic method to play music tracks
   */
  private async playMusic(musicName: string, loop: boolean = true): Promise<void> {
    if (!this.isInitialized || !this.audioManager.isReady()) {
      // console.log(`Cannot play music ${musicName}: audio not ready`);
      return;
    }

    // Stop current music if playing
    if (this.currentMusic) {
      this.stopBackgroundMusic();
    }

    // Check if music is loaded, generate if needed
    if (!this.audioManager.isSoundLoaded(musicName)) {
      await this.generateMusicOnDemand(musicName);
    }

    this.audioManager.playBackgroundMusic(musicName, loop);
    this.currentMusic = musicName;
    // console.log(`Started playing music: ${musicName}`);
  }

  /**
   * Get currently playing music
   */
  public getCurrentMusic(): string | null {
    return this.currentMusic;
  }

  /**
   * Check if music is currently playing
   */
  public isMusicPlaying(): boolean {
    return this.currentMusic !== null;
  }

  /**
   * Generic method to play game sounds
   */
  private async playGameSound(soundName: string, volume: number = 1.0): Promise<void> {
    if (!this.isInitialized || !this.audioManager.isReady()) {
      // console.log(`Cannot play ${soundName}: audio not ready`);
      return;
    }

    // Check if sound is loaded, generate if needed
    if (!this.audioManager.isSoundLoaded(soundName)) {
      await this.generateSoundOnDemand(soundName);
    }

    this.audioManager.playSound(soundName, volume);
  }

  /**
   * Set volume levels
   */
  public setMasterVolume(volume: number): void {
    this.audioManager.setMasterVolume(volume);
  }

  public setSfxVolume(volume: number): void {
    this.audioManager.setSfxVolume(volume);
  }

  public setMusicVolume(volume: number): void {
    this.audioManager.setMusicVolume(volume);
  }

  /**
   * Get volume settings
   */
  public getVolumeSettings(): { master: number; sfx: number; music: number } {
    return this.audioManager.getVolumeSettings();
  }

  /**
   * Check if audio is ready
   */
  public isReady(): boolean {
    return this.isInitialized && this.audioManager.isReady();
  }

  /**
   * Check if user interaction is required
   */
  public requiresUserInteraction(): boolean {
    return this.audioManager.requiresUserInteraction();
  }

  /**
   * Get audio status for debugging
   */
  public getStatus(): {
    initialized: boolean;
    ready: boolean;
    contextState: AudioContextState;
    loadedSounds: string[];
    requiresInteraction: boolean;
  } {
    return {
      initialized: this.isInitialized,
      ready: this.audioManager.isReady(),
      contextState: this.audioManager.getContextState(),
      loadedSounds: this.audioManager.getLoadedSounds(),
      requiresInteraction: this.audioManager.requiresUserInteraction()
    };
  }

  /**
   * Dispose of audio resources
   */
  public dispose(): void {
    this.audioManager.dispose();
    this.soundGenerator = null;
    this.isInitialized = false;
  }
}