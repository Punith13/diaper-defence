/**
 * Device capability levels for performance optimization
 */
export enum DeviceCapability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Performance quality settings
 */
export interface QualitySettings {
  pixelRatio: number;
  particleCount: number;
  shadowQuality: boolean;
  antialiasing: boolean;
  textureQuality: number; // 0.5, 1.0, 2.0
  maxEntities: number;
  targetFPS: number;
}

/**
 * Device information for performance optimization
 */
interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isLowEnd: boolean;
  screenSize: { width: number; height: number };
  pixelRatio: number;
  hardwareConcurrency: number;
  memory?: number; // GB
  gpu?: string;
  capability: DeviceCapability;
}

/**
 * Performance monitoring data
 */
interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  renderTime: number;
  updateTime: number;
  lastMeasurement: number;
}

/**
 * Performance manager for mobile optimization and automatic quality adjustment
 */
export class PerformanceManager {
  private static instance: PerformanceManager;
  private deviceInfo: DeviceInfo;
  private qualitySettings: QualitySettings;
  private metrics: PerformanceMetrics;
  private frameTimeHistory: number[] = [];
  private maxHistoryLength: number = 60; // Track last 60 frames
  private qualityAdjustmentCooldown: number = 5000; // 5 seconds
  private lastQualityAdjustment: number = 0;
  private onQualityChangeCallback?: (settings: QualitySettings) => void;

  private constructor() {
    this.deviceInfo = this.detectDevice();
    this.qualitySettings = this.getInitialQualitySettings();
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      renderTime: 0,
      updateTime: 0,
      lastMeasurement: performance.now()
    };
  }

  public static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  /**
   * Detect device capabilities and characteristics
   */
  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
    
    const screenSize = {
      width: window.screen.width,
      height: window.screen.height
    };
    
    const pixelRatio = window.devicePixelRatio || 1;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    // Estimate memory (if available)
    const memory = (navigator as any).deviceMemory || this.estimateMemory();
    
    // Detect GPU (basic detection)
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const gpu = gl ? (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).RENDERER) : 'unknown';
    
    // Determine if device is low-end
    const isLowEnd = this.isLowEndDevice(isMobile, memory, hardwareConcurrency, screenSize);
    
    // Determine overall capability
    const capability = this.determineCapability(isMobile, isLowEnd, memory, hardwareConcurrency);

    return {
      isMobile,
      isTablet,
      isLowEnd,
      screenSize,
      pixelRatio,
      hardwareConcurrency,
      memory,
      gpu: gpu as string,
      capability
    };
  }

  /**
   * Estimate device memory if not available
   */
  private estimateMemory(): number {
    // Basic heuristic based on screen size and device type
    const totalPixels = window.screen.width * window.screen.height;
    if (totalPixels > 2000000) return 4; // High resolution, likely 4GB+
    if (totalPixels > 1000000) return 2; // Medium resolution, likely 2GB+
    return 1; // Low resolution, likely 1GB or less
  }

  /**
   * Determine if device is low-end
   */
  private isLowEndDevice(
    isMobile: boolean,
    memory: number,
    hardwareConcurrency: number,
    screenSize: { width: number; height: number }
  ): boolean {
    if (!isMobile) return false; // Desktop devices are generally not low-end for our purposes
    
    // Low-end criteria for mobile devices
    return (
      memory <= 2 ||
      hardwareConcurrency <= 2 ||
      (screenSize.width * screenSize.height) < 800000 // Less than ~800k pixels
    );
  }

  /**
   * Determine overall device capability
   */
  private determineCapability(
    isMobile: boolean,
    isLowEnd: boolean,
    memory: number,
    hardwareConcurrency: number
  ): DeviceCapability {
    if (!isMobile) return DeviceCapability.HIGH; // Desktop
    if (isLowEnd) return DeviceCapability.LOW;
    if (memory >= 4 && hardwareConcurrency >= 4) return DeviceCapability.HIGH;
    return DeviceCapability.MEDIUM;
  }

  /**
   * Get initial quality settings based on device capability
   */
  private getInitialQualitySettings(): QualitySettings {
    switch (this.deviceInfo.capability) {
      case DeviceCapability.LOW:
        return {
          pixelRatio: Math.min(this.deviceInfo.pixelRatio, 1),
          particleCount: 10,
          shadowQuality: false,
          antialiasing: false,
          textureQuality: 0.5,
          maxEntities: 20,
          targetFPS: 30
        };
      
      case DeviceCapability.MEDIUM:
        return {
          pixelRatio: Math.min(this.deviceInfo.pixelRatio, 1.5),
          particleCount: 20,
          shadowQuality: false,
          antialiasing: true,
          textureQuality: 1.0,
          maxEntities: 40,
          targetFPS: 45
        };
      
      case DeviceCapability.HIGH:
      default:
        return {
          pixelRatio: this.deviceInfo.pixelRatio,
          particleCount: 30,
          shadowQuality: true,
          antialiasing: true,
          textureQuality: 1.0,
          maxEntities: 60,
          targetFPS: 60
        };
    }
  }

  /**
   * Update performance metrics
   */
  public updateMetrics(frameTime: number, renderTime: number = 0, updateTime: number = 0): void {
    const now = performance.now();
    
    this.metrics.frameTime = frameTime;
    this.metrics.fps = 1000 / frameTime;
    this.metrics.renderTime = renderTime;
    this.metrics.updateTime = updateTime;
    this.metrics.lastMeasurement = now;
    
    // Update memory usage if available
    if ((performance as any).memory) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    
    // Track frame time history
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > this.maxHistoryLength) {
      this.frameTimeHistory.shift();
    }
    
    // Check if quality adjustment is needed
    this.checkPerformanceAndAdjust();
  }

  /**
   * Check performance and automatically adjust quality if needed
   */
  private checkPerformanceAndAdjust(): void {
    const now = performance.now();
    
    // Don't adjust too frequently
    if (now - this.lastQualityAdjustment < this.qualityAdjustmentCooldown) {
      return;
    }
    
    // Need enough data to make decisions
    if (this.frameTimeHistory.length < 30) {
      return;
    }
    
    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
    const avgFPS = 1000 / avgFrameTime;
    const targetFPS = this.qualitySettings.targetFPS;
    
    // Performance is significantly below target
    if (avgFPS < targetFPS * 0.8) {
      this.reduceQuality();
      this.lastQualityAdjustment = now;
    }
    // Performance is significantly above target and we're not at max quality
    else if (avgFPS > targetFPS * 1.2 && this.canIncreaseQuality()) {
      this.increaseQuality();
      this.lastQualityAdjustment = now;
    }
  }

  /**
   * Reduce quality settings for better performance
   */
  private reduceQuality(): void {
    let changed = false;
    
    // Reduce particle count first
    if (this.qualitySettings.particleCount > 5) {
      this.qualitySettings.particleCount = Math.max(5, this.qualitySettings.particleCount - 5);
      changed = true;
    }
    // Then reduce pixel ratio
    else if (this.qualitySettings.pixelRatio > 0.5) {
      this.qualitySettings.pixelRatio = Math.max(0.5, this.qualitySettings.pixelRatio - 0.25);
      changed = true;
    }
    // Disable antialiasing
    else if (this.qualitySettings.antialiasing) {
      this.qualitySettings.antialiasing = false;
      changed = true;
    }
    // Reduce texture quality
    else if (this.qualitySettings.textureQuality > 0.5) {
      this.qualitySettings.textureQuality = 0.5;
      changed = true;
    }
    // Reduce max entities
    else if (this.qualitySettings.maxEntities > 10) {
      this.qualitySettings.maxEntities = Math.max(10, this.qualitySettings.maxEntities - 10);
      changed = true;
    }
    
    if (changed) {
      console.log('Performance: Reduced quality settings', this.qualitySettings);
      this.notifyQualityChange();
    }
  }

  /**
   * Increase quality settings when performance allows
   */
  private increaseQuality(): void {
    let changed = false;
    const initialSettings = this.getInitialQualitySettings();
    
    // Increase particle count first
    if (this.qualitySettings.particleCount < initialSettings.particleCount) {
      this.qualitySettings.particleCount = Math.min(initialSettings.particleCount, this.qualitySettings.particleCount + 5);
      changed = true;
    }
    // Then increase pixel ratio
    else if (this.qualitySettings.pixelRatio < initialSettings.pixelRatio) {
      this.qualitySettings.pixelRatio = Math.min(initialSettings.pixelRatio, this.qualitySettings.pixelRatio + 0.25);
      changed = true;
    }
    // Enable antialiasing
    else if (!this.qualitySettings.antialiasing && initialSettings.antialiasing) {
      this.qualitySettings.antialiasing = true;
      changed = true;
    }
    // Increase texture quality
    else if (this.qualitySettings.textureQuality < initialSettings.textureQuality) {
      this.qualitySettings.textureQuality = initialSettings.textureQuality;
      changed = true;
    }
    // Increase max entities
    else if (this.qualitySettings.maxEntities < initialSettings.maxEntities) {
      this.qualitySettings.maxEntities = Math.min(initialSettings.maxEntities, this.qualitySettings.maxEntities + 10);
      changed = true;
    }
    
    if (changed) {
      console.log('Performance: Increased quality settings', this.qualitySettings);
      this.notifyQualityChange();
    }
  }

  /**
   * Check if quality can be increased
   */
  private canIncreaseQuality(): boolean {
    const initialSettings = this.getInitialQualitySettings();
    return (
      this.qualitySettings.particleCount < initialSettings.particleCount ||
      this.qualitySettings.pixelRatio < initialSettings.pixelRatio ||
      (!this.qualitySettings.antialiasing && initialSettings.antialiasing) ||
      this.qualitySettings.textureQuality < initialSettings.textureQuality ||
      this.qualitySettings.maxEntities < initialSettings.maxEntities
    );
  }

  /**
   * Notify callback of quality changes
   */
  private notifyQualityChange(): void {
    if (this.onQualityChangeCallback) {
      this.onQualityChangeCallback(this.qualitySettings);
    }
  }

  /**
   * Set callback for quality changes
   */
  public setQualityChangeCallback(callback: (settings: QualitySettings) => void): void {
    this.onQualityChangeCallback = callback;
  }

  /**
   * Get current device information
   */
  public getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  /**
   * Get current quality settings
   */
  public getQualitySettings(): QualitySettings {
    return { ...this.qualitySettings };
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Manually set quality settings
   */
  public setQualitySettings(settings: Partial<QualitySettings>): void {
    this.qualitySettings = { ...this.qualitySettings, ...settings };
    this.notifyQualityChange();
  }

  /**
   * Reset to initial quality settings
   */
  public resetQuality(): void {
    this.qualitySettings = this.getInitialQualitySettings();
    this.notifyQualityChange();
  }

  /**
   * Get performance summary for debugging
   */
  public getPerformanceSummary(): {
    device: DeviceInfo;
    quality: QualitySettings;
    metrics: PerformanceMetrics;
    avgFPS: number;
  } {
    const avgFrameTime = this.frameTimeHistory.length > 0 
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
      : this.metrics.frameTime;
    
    return {
      device: this.getDeviceInfo(),
      quality: this.getQualitySettings(),
      metrics: this.getMetrics(),
      avgFPS: 1000 / avgFrameTime
    };
  }
}