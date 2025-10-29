/**
 * Audio Manager for handling Web Audio API integration
 * Manages sound loading, playback, and audio context lifecycle
 */
export class AudioManager {
  private static instance: AudioManager | null = null;
  
  private context: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private backgroundMusic: AudioBufferSourceNode | null = null;
  private masterVolume: number = 1.0;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.6;
  private isInitialized: boolean = false;
  private isUserInteractionRequired: boolean = true;
  
  // Audio context state tracking
  private contextState: AudioContextState = 'suspended';
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of AudioManager
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize the audio system
   * Must be called after user interaction for browsers that require it
   */
  public async init(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      // Check if Web Audio API is supported
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.warn('Web Audio API not supported');
        return;
      }

      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.context = new AudioContextClass();
      
      // Track context state changes
      this.contextState = this.context.state;
      this.context.addEventListener('statechange', () => {
        this.contextState = this.context!.state;
        // // console.log('Audio context state changed to:', this.contextState);
      });

      // Try to resume context if suspended
      if (this.context.state === 'suspended') {
        try {
          await this.context.resume();
          this.isUserInteractionRequired = false;
        } catch (error) {
          // // console.log('Audio context requires user interaction to resume');
          this.isUserInteractionRequired = true;
        }
      } else {
        this.isUserInteractionRequired = false;
      }

      this.isInitialized = true;
      // // console.log('AudioManager initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Resume audio context after user interaction
   * Call this on first user click/touch
   */
  public async resumeContext(): Promise<void> {
    if (!this.context || this.context.state !== 'suspended') {
      return;
    }

    try {
      await this.context.resume();
      this.isUserInteractionRequired = false;
      // // console.log('Audio context resumed after user interaction');
    } catch (error) {
      console.error('Failed to resume audio context:', error);
    }
  }

  /**
   * Load a sound from URL and store it in the sound buffer
   */
  public async loadSound(name: string, url: string): Promise<void> {
    if (!this.context) {
      console.warn('AudioManager not initialized, cannot load sound:', name);
      return;
    }

    try {
      // Check if sound is already loaded
      if (this.sounds.has(name)) {
        // console.log(`Sound '${name}' already loaded`);
        return;
      }

      // console.log(`Loading sound: ${name} from ${url}`);
      
      // Fetch audio data
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      // Store in sound map
      this.sounds.set(name, audioBuffer);
      // console.log(`Sound '${name}' loaded successfully`);
      
    } catch (error) {
      console.error(`Failed to load sound '${name}':`, error);
      
      // Create a silent buffer as fallback
      this.createSilentBuffer(name);
    }
  }

  /**
   * Add a pre-generated audio buffer to the sound map
   */
  public addSoundBuffer(name: string, buffer: AudioBuffer): void {
    this.sounds.set(name, buffer);
    // console.log(`Sound buffer '${name}' added successfully`);
  }

  /**
   * Create a silent audio buffer as fallback
   */
  private createSilentBuffer(name: string): void {
    if (!this.context) return;

    try {
      // Create a short silent buffer
      const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.1, this.context.sampleRate);
      this.sounds.set(name, buffer);
      // console.log(`Created silent fallback buffer for '${name}'`);
    } catch (error) {
      console.error(`Failed to create silent buffer for '${name}':`, error);
    }
  }

  /**
   * Play a sound effect
   */
  public playSound(name: string, volume: number = 1.0, pitch: number = 1.0): void {
    if (!this.isInitialized || !this.context || this.contextState !== 'running') {
      // console.log(`Cannot play sound '${name}': audio context not ready`);
      return;
    }

    const buffer = this.sounds.get(name);
    if (!buffer) {
      console.warn(`Sound '${name}' not found`);
      return;
    }

    try {
      // Create buffer source
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      
      // Create gain node for volume control
      const gainNode = this.context.createGain();
      const finalVolume = Math.max(0, Math.min(1, volume * this.sfxVolume * this.masterVolume));
      gainNode.gain.setValueAtTime(finalVolume, this.context.currentTime);
      
      // Set playback rate for pitch control
      source.playbackRate.setValueAtTime(
        Math.max(0.25, Math.min(4, pitch)), 
        this.context.currentTime
      );
      
      // Connect audio graph
      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      // Play sound
      source.start(0);
      
      // Clean up after playback
      source.addEventListener('ended', () => {
        source.disconnect();
        gainNode.disconnect();
      });
      
    } catch (error) {
      console.error(`Failed to play sound '${name}':`, error);
    }
  }

  /**
   * Play background music with looping
   */
  public playBackgroundMusic(name: string, loop: boolean = true): void {
    if (!this.isInitialized || !this.context || this.contextState !== 'running') {
      // console.log(`Cannot play background music '${name}': audio context not ready`);
      return;
    }

    // Stop current background music if playing
    this.stopBackgroundMusic();

    const buffer = this.sounds.get(name);
    if (!buffer) {
      console.warn(`Background music '${name}' not found`);
      return;
    }

    try {
      // Create buffer source
      this.backgroundMusic = this.context.createBufferSource();
      this.backgroundMusic.buffer = buffer;
      this.backgroundMusic.loop = loop;
      
      // Create gain node for volume control
      const gainNode = this.context.createGain();
      const finalVolume = Math.max(0, Math.min(1, this.musicVolume * this.masterVolume));
      gainNode.gain.setValueAtTime(finalVolume, this.context.currentTime);
      
      // Connect audio graph
      this.backgroundMusic.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      // Play music
      this.backgroundMusic.start(0);
      
      // Handle music end
      this.backgroundMusic.addEventListener('ended', () => {
        if (this.backgroundMusic) {
          this.backgroundMusic.disconnect();
          this.backgroundMusic = null;
        }
        gainNode.disconnect();
      });
      
      // console.log(`Background music '${name}' started`);
      
    } catch (error) {
      console.error(`Failed to play background music '${name}':`, error);
    }
  }

  /**
   * Stop background music
   */
  public stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      try {
        this.backgroundMusic.stop();
        this.backgroundMusic.disconnect();
      } catch (error) {
        console.error('Error stopping background music:', error);
      }
      this.backgroundMusic = null;
      // console.log('Background music stopped');
    }
  }

  /**
   * Set master volume (affects all audio)
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    // console.log('Master volume set to:', this.masterVolume);
  }

  /**
   * Set sound effects volume
   */
  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    // console.log('SFX volume set to:', this.sfxVolume);
  }

  /**
   * Set background music volume
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    // console.log('Music volume set to:', this.musicVolume);
  }

  /**
   * Get current volume settings
   */
  public getVolumeSettings(): { master: number; sfx: number; music: number } {
    return {
      master: this.masterVolume,
      sfx: this.sfxVolume,
      music: this.musicVolume
    };
  }

  /**
   * Check if audio system is ready to play sounds
   */
  public isReady(): boolean {
    return this.isInitialized && 
           this.context !== null && 
           this.contextState === 'running' && 
           !this.isUserInteractionRequired;
  }

  /**
   * Check if user interaction is required to enable audio
   */
  public requiresUserInteraction(): boolean {
    return this.isUserInteractionRequired;
  }

  /**
   * Get audio context state
   */
  public getContextState(): AudioContextState {
    return this.contextState;
  }

  /**
   * Get list of loaded sounds
   */
  public getLoadedSounds(): string[] {
    return Array.from(this.sounds.keys());
  }

  /**
   * Check if a specific sound is loaded
   */
  public isSoundLoaded(name: string): boolean {
    return this.sounds.has(name);
  }

  /**
   * Preload multiple sounds
   */
  public async preloadSounds(soundMap: Record<string, string>): Promise<void> {
    const loadPromises = Object.entries(soundMap).map(([name, url]) => 
      this.loadSound(name, url)
    );
    
    await Promise.allSettled(loadPromises);
    // console.log('Sound preloading completed');
  }

  /**
   * Clean up audio resources
   */
  public dispose(): void {
    this.stopBackgroundMusic();
    
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    
    this.sounds.clear();
    this.isInitialized = false;
    this.isUserInteractionRequired = true;
    this.initializationPromise = null;
    
    // console.log('AudioManager disposed');
  }
}