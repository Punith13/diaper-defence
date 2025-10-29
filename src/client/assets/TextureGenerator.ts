import * as THREE from 'three';

/**
 * TextureGenerator utility for creating placeholder textures
 * Used when actual texture assets are not available
 */
export class TextureGenerator {
  /**
   * Create a baby sprite texture with enhanced crying face design
   */
  public static createBabyTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    
    const ctx = canvas.getContext('2d')!;
    
    // Clear background
    ctx.clearRect(0, 0, 64, 64);
    
    // Baby face (light pink circle)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fill();
    
    // Face outline
    ctx.strokeStyle = '#E6A8B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.stroke();
    
    // Crying eyes (closed/squinting)
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 2;
    // Left eye (crying squint)
    ctx.beginPath();
    ctx.moveTo(20, 24);
    ctx.quadraticCurveTo(24, 22, 28, 24);
    ctx.quadraticCurveTo(24, 26, 20, 24);
    ctx.fill();
    // Right eye (crying squint)
    ctx.beginPath();
    ctx.moveTo(36, 24);
    ctx.quadraticCurveTo(40, 22, 44, 24);
    ctx.quadraticCurveTo(40, 26, 36, 24);
    ctx.fill();
    
    // Wide open crying mouth
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.ellipse(32, 40, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(32, 40, 8, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Enhanced blue teardrops (multiple tears)
    ctx.fillStyle = '#4169E1'; // Royal blue tears
    
    // Left side tears
    ctx.beginPath();
    ctx.moveTo(18, 30);
    ctx.quadraticCurveTo(16, 32, 18, 36);
    ctx.quadraticCurveTo(20, 34, 18, 30);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(14, 35);
    ctx.quadraticCurveTo(12, 37, 14, 41);
    ctx.quadraticCurveTo(16, 39, 14, 35);
    ctx.fill();
    
    // Right side tears
    ctx.beginPath();
    ctx.moveTo(46, 30);
    ctx.quadraticCurveTo(48, 32, 46, 36);
    ctx.quadraticCurveTo(44, 34, 46, 30);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(50, 35);
    ctx.quadraticCurveTo(52, 37, 50, 41);
    ctx.quadraticCurveTo(48, 39, 50, 35);
    ctx.fill();
    
    // Additional small tear drops
    ctx.fillStyle = '#87CEEB'; // Light blue for smaller tears
    ctx.beginPath();
    ctx.arc(22, 42, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(42, 42, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Rosy cheeks from crying
    ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
    ctx.beginPath();
    ctx.arc(18, 35, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(46, 35, 4, 0, Math.PI * 2);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    
    return texture;
  }

  /**
   * Create a diaper sprite texture
   */
  public static createDiaperTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    
    const ctx = canvas.getContext('2d')!;
    
    // Clear background
    ctx.clearRect(0, 0, 64, 32);
    
    // Diaper body (white with slight curve)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(32, 16, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Diaper outline
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(32, 16, 28, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Diaper tabs
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(8, 12, 8, 8);
    ctx.fillRect(48, 12, 8, 8);
    
    // Tab outlines
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 12, 8, 8);
    ctx.strokeRect(48, 12, 8, 8);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    
    return texture;
  }

  /**
   * Create a regular poop sprite texture
   */
  public static createRegularPoopTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    
    const ctx = canvas.getContext('2d')!;
    
    // Clear background
    ctx.clearRect(0, 0, 32, 32);
    
    // Poop shape (brown with wavy outline)
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(16, 28);
    ctx.quadraticCurveTo(8, 24, 10, 18);
    ctx.quadraticCurveTo(6, 12, 12, 10);
    ctx.quadraticCurveTo(16, 6, 20, 10);
    ctx.quadraticCurveTo(26, 12, 22, 18);
    ctx.quadraticCurveTo(24, 24, 16, 28);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.arc(14, 14, 3, 0, Math.PI * 2);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    
    return texture;
  }

  /**
   * Create a fancy (golden) poop sprite texture
   */
  public static createFancyPoopTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    
    const ctx = canvas.getContext('2d')!;
    
    // Clear background
    ctx.clearRect(0, 0, 32, 32);
    
    // Golden poop shape
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(16, 28);
    ctx.quadraticCurveTo(8, 24, 10, 18);
    ctx.quadraticCurveTo(6, 12, 12, 10);
    ctx.quadraticCurveTo(16, 6, 20, 10);
    ctx.quadraticCurveTo(26, 12, 22, 18);
    ctx.quadraticCurveTo(24, 24, 16, 28);
    ctx.fill();
    
    // Golden highlight
    ctx.fillStyle = '#FFF700';
    ctx.beginPath();
    ctx.arc(14, 14, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Sparkle effects
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(12, 16, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(20, 12, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(18, 20, 1, 0, Math.PI * 2);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    
    return texture;
  }

  /**
   * Create a boob poop sprite texture (pink/dangerous)
   */
  public static createBoobPoopTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    
    const ctx = canvas.getContext('2d')!;
    
    // Clear background
    ctx.clearRect(0, 0, 32, 32);
    
    // Pink poop shape
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.moveTo(16, 28);
    ctx.quadraticCurveTo(8, 24, 10, 18);
    ctx.quadraticCurveTo(6, 12, 12, 10);
    ctx.quadraticCurveTo(16, 6, 20, 10);
    ctx.quadraticCurveTo(26, 12, 22, 18);
    ctx.quadraticCurveTo(24, 24, 16, 28);
    ctx.fill();
    
    // Warning highlight (red)
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(14, 14, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Warning symbol (exclamation mark)
    ctx.fillStyle = '#FF0000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('!', 16, 18);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    
    return texture;
  }

  /**
   * Create a happy baby sprite texture for when shooting golden poop
   */
  public static createHappyBabyTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    
    const ctx = canvas.getContext('2d')!;
    
    // Clear background
    ctx.clearRect(0, 0, 64, 64);
    
    // Baby face (light pink circle)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fill();
    
    // Face outline
    ctx.strokeStyle = '#E6A8B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.stroke();
    
    // Happy eyes (closed/smiling)
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 2;
    // Left eye (happy crescent)
    ctx.beginPath();
    ctx.arc(24, 26, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
    // Right eye (happy crescent)
    ctx.beginPath();
    ctx.arc(40, 26, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // Big happy smile
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, 35, 8, 0, Math.PI);
    ctx.stroke();
    
    // Rosy happy cheeks
    ctx.fillStyle = 'rgba(255, 182, 193, 0.8)';
    ctx.beginPath();
    ctx.arc(18, 35, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(46, 35, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Sparkles around happy baby
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(15, 20, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(49, 25, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(20, 50, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(44, 48, 1, 0, Math.PI * 2);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    
    return texture;
  }

  /**
   * Create all game textures and return them as a map
   */
  public static createAllGameTextures(): Map<string, THREE.Texture> {
    const textures = new Map<string, THREE.Texture>();
    
    textures.set('baby-crying', this.createBabyTexture()); // Crying baby (default)
    textures.set('baby-happy', this.createHappyBabyTexture()); // Happy baby
    textures.set('diaper', this.createDiaperTexture());
    textures.set('poop-regular', this.createRegularPoopTexture());
    textures.set('poop-fancy', this.createFancyPoopTexture());
    textures.set('poop-boob', this.createBoobPoopTexture());
    
    return textures;
  }
}