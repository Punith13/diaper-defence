/**
 * Utility script to create placeholder asset files
 * This would typically be run during build process or development setup
 */

import { TextureGenerator } from './TextureGenerator';

/**
 * Create placeholder asset files in the public directory
 * This function generates actual image files from the canvas textures
 */
export function createPlaceholderAssets(): void {
  const textures = TextureGenerator.createAllGameTextures();
  
  textures.forEach((texture, name) => {
    // Get the canvas from the texture
    const canvas = (texture as any).image as HTMLCanvasElement;
    
    // Convert canvas to blob and create download link
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  });
  
  // console.log('Placeholder assets created and downloaded');
}

// Export for potential use in development tools
if (typeof window !== 'undefined') {
  (window as any).createPlaceholderAssets = createPlaceholderAssets;
}