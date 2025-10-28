/**
 * Sound Generator for creating game sound effects programmatically
 * Generates audio buffers for various game sounds using Web Audio API
 */
export class SoundGenerator {
  private context: AudioContext;

  constructor(context: AudioContext) {
    this.context = context;
  }

  /**
   * Generate a "plop" sound for successful catches
   * Creates a satisfying bubble-like sound with pitch drop
   */
  public generatePlopSound(): AudioBuffer {
    const duration = 0.3; // 300ms
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Create a plop sound with frequency sweep and envelope
      const frequency = 200 * Math.exp(-t * 8); // Frequency drops from 200Hz to ~27Hz
      const envelope = Math.exp(-t * 6) * (1 - Math.exp(-t * 50)); // Attack and decay
      
      // Generate tone with some harmonics for richness
      const fundamental = Math.sin(2 * Math.PI * frequency * t);
      const harmonic2 = 0.3 * Math.sin(2 * Math.PI * frequency * 2 * t);
      const harmonic3 = 0.1 * Math.sin(2 * Math.PI * frequency * 3 * t);
      
      // Add some noise for texture
      const noise = (Math.random() - 0.5) * 0.1 * envelope;
      
      data[i] = (fundamental + harmonic2 + harmonic3 + noise) * envelope * 0.5;
    }
    
    return buffer;
  }

  /**
   * Generate a "splat" sound for missed poop
   * Creates a wet impact sound with noise burst
   */
  public generateSplatSound(): AudioBuffer {
    const duration = 0.4; // 400ms
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Create a splat sound with noise burst and low frequency thump
      const envelope = Math.exp(-t * 8) * (1 - Math.exp(-t * 100)); // Sharp attack, quick decay
      
      // Low frequency thump
      const thump = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-t * 12);
      
      // High frequency noise burst for the "splat" texture
      const noise = (Math.random() - 0.5) * envelope;
      
      // Mid frequency component for body
      const mid = Math.sin(2 * Math.PI * 150 * t) * Math.exp(-t * 6) * 0.3;
      
      data[i] = (thump * 0.6 + noise * 0.8 + mid) * envelope * 0.6;
    }
    
    return buffer;
  }

  /**
   * Generate a "sploot" sound for baby shooting
   * Creates a cute shooting sound with pitch rise
   */
  public generateSplootSound(): AudioBuffer {
    const duration = 0.25; // 250ms
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Create a sploot sound with rising pitch and quick envelope
      const frequency = 150 + (t * 300); // Frequency rises from 150Hz to 225Hz
      const envelope = Math.exp(-t * 12) * (1 - Math.exp(-t * 80)); // Quick attack and decay
      
      // Generate tone with vibrato for character
      const vibrato = 1 + 0.1 * Math.sin(2 * Math.PI * 8 * t); // 8Hz vibrato
      const tone = Math.sin(2 * Math.PI * frequency * vibrato * t);
      
      // Add some harmonic content
      const harmonic = 0.2 * Math.sin(2 * Math.PI * frequency * 2 * vibrato * t);
      
      // Add slight noise for texture
      const noise = (Math.random() - 0.5) * 0.05 * envelope;
      
      data[i] = (tone + harmonic + noise) * envelope * 0.4;
    }
    
    return buffer;
  }

  /**
   * Generate a "fail" tone for game over
   * Creates a descending sad trombone-like sound
   */
  public generateFailSound(): AudioBuffer {
    const duration = 1.2; // 1200ms for dramatic effect
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Create a sad trombone effect with descending pitch
      const baseFreq = 220; // Start at A3
      const frequency = baseFreq * Math.exp(-t * 1.2); // Exponential decay to ~30Hz
      
      // Envelope with sustain and release
      let envelope;
      if (t < 0.1) {
        envelope = t / 0.1; // Attack
      } else if (t < 0.8) {
        envelope = 1; // Sustain
      } else {
        envelope = (1.2 - t) / 0.4; // Release
      }
      
      // Generate trombone-like tone with harmonics
      const fundamental = Math.sin(2 * Math.PI * frequency * t);
      const harmonic2 = 0.4 * Math.sin(2 * Math.PI * frequency * 2 * t);
      const harmonic3 = 0.2 * Math.sin(2 * Math.PI * frequency * 3 * t);
      const harmonic4 = 0.1 * Math.sin(2 * Math.PI * frequency * 4 * t);
      
      // Add slight vibrato for realism
      const vibrato = 1 + 0.02 * Math.sin(2 * Math.PI * 4 * t);
      
      data[i] = (fundamental + harmonic2 + harmonic3 + harmonic4) * envelope * vibrato * 0.3;
    }
    
    return buffer;
  }

  /**
   * Generate a fancy catch sound for special poop
   * Creates a magical chime-like sound
   */
  public generateFancyCatchSound(): AudioBuffer {
    const duration = 0.6; // 600ms
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Chord frequencies for magical sound (C major chord)
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Bell-like envelope
      const envelope = Math.exp(-t * 3) * (1 - Math.exp(-t * 30));
      
      let sample = 0;
      
      // Generate chord with slight detuning for richness
      frequencies.forEach((freq, index) => {
        const detune = 1 + (Math.random() - 0.5) * 0.01; // Slight random detuning
        const tone = Math.sin(2 * Math.PI * freq * detune * t);
        const weight = 1 / (index + 1); // Diminishing weights for harmonics
        sample += tone * weight;
      });
      
      // Add sparkle with high frequency components
      const sparkle = Math.sin(2 * Math.PI * 2000 * t) * Math.exp(-t * 15) * 0.1;
      
      data[i] = (sample + sparkle) * envelope * 0.25;
    }
    
    return buffer;
  }

  /**
   * Generate a warning sound for boob poop catch
   * Creates an ominous warning tone
   */
  public generateWarningSound(): AudioBuffer {
    const duration = 0.8; // 800ms
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Create ominous warning sound with tremolo
      const frequency = 110; // Low A
      const tremolo = 1 + 0.5 * Math.sin(2 * Math.PI * 6 * t); // 6Hz tremolo
      const envelope = Math.exp(-t * 2) * (1 - Math.exp(-t * 20));
      
      // Generate dark tone with dissonant harmonics
      const fundamental = Math.sin(2 * Math.PI * frequency * t);
      const dissonant = 0.3 * Math.sin(2 * Math.PI * frequency * 1.414 * t); // Tritone
      const sub = 0.2 * Math.sin(2 * Math.PI * frequency * 0.5 * t); // Sub harmonic
      
      data[i] = (fundamental + dissonant + sub) * envelope * tremolo * 0.4;
    }
    
    return buffer;
  }
}