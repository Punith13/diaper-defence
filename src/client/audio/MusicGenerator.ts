/**
 * Music Generator for creating background music programmatically
 * Generates looping background music using Web Audio API
 */
export class MusicGenerator {
  private context: AudioContext;

  constructor(context: AudioContext) {
    this.context = context;
  }

  /**
   * Generate upbeat background music for gameplay
   * Creates a simple, cheerful melody that loops seamlessly
   */
  public generateBackgroundMusic(): AudioBuffer {
    const duration = 16; // 16 seconds for a complete loop
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    const bpm = 120; // Beats per minute
    const beatDuration = 60 / bpm; // Duration of one beat in seconds
    
    const buffer = this.context.createBuffer(2, length, sampleRate); // Stereo
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    // Musical scale (C major pentatonic for happy sound)
    const baseFreq = 261.63; // C4
    const scale = [1, 9/8, 5/4, 3/2, 5/3, 2]; // Major pentatonic ratios
    const melody = [0, 2, 4, 2, 1, 3, 4, 3, 0, 2, 1, 4, 2, 1, 0, 0]; // Melody pattern (16 beats)
    const bass = [0, 0, 3, 3, 1, 1, 4, 4, 0, 0, 3, 3, 1, 1, 0, 0]; // Bass pattern
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const beatIndex = Math.floor((t % duration) / beatDuration) % 16;
      const beatPhase = ((t % duration) % beatDuration) / beatDuration;
      
      // Melody line (right channel dominant)
      const melodyNote = melody[beatIndex];
      const melodyFreq = baseFreq * scale[melodyNote];
      const melodyEnvelope = Math.exp(-beatPhase * 3) * (1 - Math.exp(-beatPhase * 20));
      const melodyTone = Math.sin(2 * Math.PI * melodyFreq * t) * melodyEnvelope * 0.3;
      
      // Add some harmonic richness to melody
      const melodyHarmonic = Math.sin(2 * Math.PI * melodyFreq * 2 * t) * melodyEnvelope * 0.1;
      
      // Bass line (left channel dominant)
      const bassNote = bass[beatIndex];
      const bassFreq = baseFreq * scale[bassNote] * 0.5; // One octave lower
      const bassEnvelope = Math.exp(-beatPhase * 2) * (1 - Math.exp(-beatPhase * 15));
      const bassTone = Math.sin(2 * Math.PI * bassFreq * t) * bassEnvelope * 0.4;
      
      // Chord accompaniment (both channels)
      const chordRoot = baseFreq * scale[melody[beatIndex]];
      const chordThird = chordRoot * 5/4; // Major third
      const chordFifth = chordRoot * 3/2; // Perfect fifth
      
      const chordEnvelope = Math.exp(-beatPhase * 1.5) * (1 - Math.exp(-beatPhase * 10)) * 0.15;
      const chord = (
        Math.sin(2 * Math.PI * chordRoot * t) +
        Math.sin(2 * Math.PI * chordThird * t) * 0.7 +
        Math.sin(2 * Math.PI * chordFifth * t) * 0.5
      ) * chordEnvelope;
      
      // Subtle percussion (kick on beats 1 and 3, snare on 2 and 4)
      let percussion = 0;
      if (beatIndex % 4 === 0 || beatIndex % 4 === 2) {
        // Kick drum simulation
        const kickFreq = 60 * Math.exp(-beatPhase * 8);
        const kickEnv = Math.exp(-beatPhase * 12) * (1 - Math.exp(-beatPhase * 50));
        percussion += Math.sin(2 * Math.PI * kickFreq * t) * kickEnv * 0.3;
      }
      if (beatIndex % 4 === 1 || beatIndex % 4 === 3) {
        // Snare drum simulation (noise burst)
        const snareEnv = Math.exp(-beatPhase * 15) * (1 - Math.exp(-beatPhase * 80));
        percussion += (Math.random() - 0.5) * snareEnv * 0.2;
      }
      
      // Mix everything together
      const leftMix = bassTone * 0.8 + melodyTone * 0.4 + chord + percussion;
      const rightMix = melodyTone * 0.8 + melodyHarmonic + bassTone * 0.4 + chord + percussion;
      
      // Apply master volume and soft limiting
      leftChannel[i] = Math.tanh(leftMix * 0.7) * 0.6;
      rightChannel[i] = Math.tanh(rightMix * 0.7) * 0.6;
    }
    
    return buffer;
  }

  /**
   * Generate ambient background music for menu/splash screen
   * Creates a more relaxed, atmospheric sound
   */
  public generateAmbientMusic(): AudioBuffer {
    const duration = 20; // 20 seconds for ambient loop
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    
    const buffer = this.context.createBuffer(2, length, sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    // Ambient chord progression (slower, more atmospheric)
    const baseFreq = 130.81; // C3 (lower register)
    const chordProgression = [
      [1, 5/4, 3/2], // C major
      [6/5, 3/2, 9/5], // F major
      [9/8, 45/32, 27/16], // G major
      [1, 5/4, 3/2] // C major
    ];
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const chordIndex = Math.floor((t / duration) * 4) % 4;
      const chord = chordProgression[chordIndex];
      
      // Slow envelope for smooth transitions
      const globalEnv = 0.5 + 0.3 * Math.sin(2 * Math.PI * t / duration);
      
      let leftSample = 0;
      let rightSample = 0;
      
      // Generate chord tones with slight detuning for richness
      chord.forEach((ratio, index) => {
        const freq = baseFreq * ratio;
        const detune = 1 + (Math.sin(t * 0.1 + index) * 0.002); // Subtle detuning
        const tone = Math.sin(2 * Math.PI * freq * detune * t);
        const weight = 1 / (index + 1); // Diminishing weights
        
        // Pan slightly for stereo width
        const pan = (index - 1) * 0.3;
        leftSample += tone * weight * (1 - Math.max(0, pan));
        rightSample += tone * weight * (1 + Math.min(0, pan));
      });
      
      // Add subtle pad texture
      const padFreq = baseFreq * 2;
      const pad = Math.sin(2 * Math.PI * padFreq * t) * 
                  Math.sin(2 * Math.PI * padFreq * 1.01 * t) * 0.1; // Beat frequency
      
      // Add very subtle high frequency sparkle
      const sparkle = Math.sin(2 * Math.PI * 1000 * t) * 
                     Math.sin(2 * Math.PI * 0.1 * t) * 0.02;
      
      leftChannel[i] = (leftSample + pad + sparkle) * globalEnv * 0.4;
      rightChannel[i] = (rightSample + pad + sparkle) * globalEnv * 0.4;
    }
    
    return buffer;
  }

  /**
   * Generate victory/success music
   * Creates a triumphant fanfare-like sound
   */
  public generateVictoryMusic(): AudioBuffer {
    const duration = 4; // 4 seconds victory fanfare
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    
    const buffer = this.context.createBuffer(2, length, sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    // Victory melody (ascending, triumphant)
    const baseFreq = 261.63; // C4
    const victoryMelody = [
      { freq: baseFreq, start: 0, duration: 0.5 },
      { freq: baseFreq * 5/4, start: 0.5, duration: 0.5 },
      { freq: baseFreq * 3/2, start: 1.0, duration: 0.5 },
      { freq: baseFreq * 2, start: 1.5, duration: 1.5 },
      { freq: baseFreq * 2 * 5/4, start: 3.0, duration: 1.0 }
    ];
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      let sample = 0;
      
      // Generate melody notes
      victoryMelody.forEach(note => {
        if (t >= note.start && t < note.start + note.duration) {
          const noteTime = t - note.start;
          const envelope = Math.exp(-noteTime * 2) * (1 - Math.exp(-noteTime * 20));
          
          // Main tone with harmonics for brass-like sound
          const fundamental = Math.sin(2 * Math.PI * note.freq * t);
          const harmonic2 = Math.sin(2 * Math.PI * note.freq * 2 * t) * 0.5;
          const harmonic3 = Math.sin(2 * Math.PI * note.freq * 3 * t) * 0.3;
          
          sample += (fundamental + harmonic2 + harmonic3) * envelope;
        }
      });
      
      // Add triumphant chord at the end
      if (t >= 2.5) {
        const chordEnv = (t - 2.5) / 1.5; // Fade in over last 1.5 seconds
        const chord = (
          Math.sin(2 * Math.PI * baseFreq * 2 * t) + // Root
          Math.sin(2 * Math.PI * baseFreq * 2 * 5/4 * t) + // Third
          Math.sin(2 * Math.PI * baseFreq * 2 * 3/2 * t) + // Fifth
          Math.sin(2 * Math.PI * baseFreq * 2 * 2 * t) // Octave
        ) * chordEnv * 0.3;
        
        sample += chord;
      }
      
      // Apply final envelope and limiting
      const masterEnv = 1 - Math.exp(-(duration - t) * 3); // Fade out at end
      const finalSample = Math.tanh(sample * 0.5) * masterEnv * 0.7;
      
      leftChannel[i] = finalSample;
      rightChannel[i] = finalSample;
    }
    
    return buffer;
  }
}