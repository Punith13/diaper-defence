import { PoopType } from '../entities/Poop';

/**
 * Score and miss tracking system for the game
 * Implements requirements 1.3, 1.4, 1.5, 4.1, 4.2
 */
export class ScoreSystem {
  private static instance: ScoreSystem;
  
  private score: number = 0;
  private misses: number = 0;
  private consecutiveMisses: number = 0;
  private maxMisses: number = 2; // Game over after 2 consecutive misses
  private gameOverCallbacks: Array<() => void> = [];
  private scoreUpdateCallbacks: Array<(score: number) => void> = [];
  private missUpdateCallbacks: Array<(misses: number, consecutive: number) => void> = [];

  private constructor() {}

  /**
   * Get singleton instance of score system
   */
  public static getInstance(): ScoreSystem {
    if (!ScoreSystem.instance) {
      ScoreSystem.instance = new ScoreSystem();
    }
    return ScoreSystem.instance;
  }

  /**
   * Add points for catching a poop
   * @param poopType Type of poop caught
   * @returns Points awarded
   */
  public addScore(poopType: PoopType): number {
    let points = 0;
    
    switch (poopType) {
      case PoopType.REGULAR:
        points = 10;
        break;
      case PoopType.FANCY:
        points = 50;
        break;
      case PoopType.BOOB:
        // Boob poop causes immediate game over
        this.triggerGameOver();
        return 0;
    }
    
    this.score += points;
    this.consecutiveMisses = 0; // Reset consecutive misses on successful catch
    
    // Notify score update callbacks
    this.scoreUpdateCallbacks.forEach(callback => callback(this.score));
    
    console.log(`Score increased by ${points}! Total score: ${this.score}`);
    return points;
  }

  /**
   * Add a miss when poop falls off screen
   * @returns True if game should end due to consecutive misses
   */
  public addMiss(): boolean {
    this.misses++;
    this.consecutiveMisses++;
    
    console.log(`Miss! Total misses: ${this.misses}, Consecutive: ${this.consecutiveMisses}`);
    
    // Notify miss update callbacks
    this.missUpdateCallbacks.forEach(callback => callback(this.misses, this.consecutiveMisses));
    
    // Check if game should end due to consecutive misses
    if (this.consecutiveMisses >= this.maxMisses) {
      console.log(`Game over! ${this.consecutiveMisses} consecutive misses`);
      this.triggerGameOver();
      return true;
    }
    
    return false;
  }

  /**
   * Check if catching boob poop should trigger game over
   * @param poopType Type of poop caught
   * @returns True if game should end
   */
  public shouldGameOverOnCatch(poopType: PoopType): boolean {
    return poopType === PoopType.BOOB;
  }

  /**
   * Check if current miss count should trigger game over
   * @returns True if game should end due to misses
   */
  public shouldGameOverOnMiss(): boolean {
    return this.consecutiveMisses >= this.maxMisses;
  }

  /**
   * Trigger game over and notify all callbacks
   */
  private triggerGameOver(): void {
    console.log('Game Over triggered by score system');
    this.gameOverCallbacks.forEach(callback => callback());
  }

  /**
   * Get current score
   */
  public getScore(): number {
    return this.score;
  }

  /**
   * Get total misses
   */
  public getMisses(): number {
    return this.misses;
  }

  /**
   * Get consecutive misses
   */
  public getConsecutiveMisses(): number {
    return this.consecutiveMisses;
  }

  /**
   * Get maximum allowed consecutive misses
   */
  public getMaxMisses(): number {
    return this.maxMisses;
  }

  /**
   * Reset score system for new game
   */
  public reset(): void {
    this.score = 0;
    this.misses = 0;
    this.consecutiveMisses = 0;
    
    console.log('Score system reset');
    
    // Notify callbacks of reset
    this.scoreUpdateCallbacks.forEach(callback => callback(this.score));
    this.missUpdateCallbacks.forEach(callback => callback(this.misses, this.consecutiveMisses));
  }

  /**
   * Set maximum allowed consecutive misses
   * @param maxMisses Maximum consecutive misses before game over
   */
  public setMaxMisses(maxMisses: number): void {
    this.maxMisses = Math.max(1, maxMisses);
  }

  /**
   * Register callback for game over events
   * @param callback Function to call when game over occurs
   */
  public onGameOver(callback: () => void): void {
    this.gameOverCallbacks.push(callback);
  }

  /**
   * Register callback for score updates
   * @param callback Function to call when score changes
   */
  public onScoreUpdate(callback: (score: number) => void): void {
    this.scoreUpdateCallbacks.push(callback);
  }

  /**
   * Register callback for miss updates
   * @param callback Function to call when misses change
   */
  public onMissUpdate(callback: (misses: number, consecutive: number) => void): void {
    this.missUpdateCallbacks.push(callback);
  }

  /**
   * Remove all callbacks (useful for cleanup)
   */
  public clearCallbacks(): void {
    this.gameOverCallbacks = [];
    this.scoreUpdateCallbacks = [];
    this.missUpdateCallbacks = [];
  }

  /**
   * Get game statistics
   */
  public getStats(): {
    score: number;
    misses: number;
    consecutiveMisses: number;
    maxMisses: number;
    accuracy: number;
  } {
    const totalAttempts = this.score / 10 + this.misses; // Rough estimate assuming mostly regular poops
    const accuracy = totalAttempts > 0 ? ((totalAttempts - this.misses) / totalAttempts) * 100 : 100;
    
    return {
      score: this.score,
      misses: this.misses,
      consecutiveMisses: this.consecutiveMisses,
      maxMisses: this.maxMisses,
      accuracy: Math.round(accuracy * 100) / 100
    };
  }

  /**
   * Check if a score qualifies as a high score (for future leaderboard integration)
   * @param score Score to check
   * @returns True if it's a high score
   */
  public isHighScore(score: number): boolean {
    // Simple implementation - can be enhanced with persistent high scores
    return score >= 500; // Arbitrary high score threshold
  }

  /**
   * Calculate score multiplier based on consecutive catches (for future enhancement)
   * @param consecutiveCatches Number of consecutive successful catches
   * @returns Score multiplier
   */
  public getScoreMultiplier(consecutiveCatches: number): number {
    // Simple multiplier system - can be enhanced
    if (consecutiveCatches >= 10) return 2.0;
    if (consecutiveCatches >= 5) return 1.5;
    return 1.0;
  }
}