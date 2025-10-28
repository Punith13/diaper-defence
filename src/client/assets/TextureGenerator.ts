import * as THREE from 'three';

/**
 * TextureGenerator utility for creating placeholder textures
 * Used when actual texture assets are not available
 */
export class TextureGenerator {
  /**
   * Create a baby sprite texture with simple face design
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
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(24, 26, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(40, 26, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth (crying)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, 38, 6, 0, Math.PI);
    ctx.stroke();
    
    // Tears
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.arc(20, 32, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(44, 32, 2, 0, Math.PI * 2);
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
   * Create all game textures and return them as a map
   */
  public static createAllGameTextures(): Map<string, THREE.Texture> {
    const textures = new Map<string, THREE.Texture>();
    
    textures.set('baby', this.createBabyTexture());
    textures.set('diaper', this.createDiaperTexture());
    textures.set('poop-regular', this.createRegularPoopTexture());
    textures.set('poop-fancy', this.createFancyPoopTexture());
    textures.set('poop-boob', this.createBoobPoopTexture());
    
    return textures;
  }
}