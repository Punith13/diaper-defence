import { HighScore } from '../../shared/types/api.js';

/**
 * LeaderboardUI class handles the display and interaction of the leaderboard modal
 * Provides methods for showing/hiding, rendering scores, and managing UI states
 */
export class LeaderboardUI {
  private modal: HTMLElement;
  private loadingIndicator: HTMLElement;
  private errorMessage: HTMLElement;
  private leaderboardList: HTMLElement;
  private lastUpdatedTime: HTMLElement;
  private closeButton: HTMLElement;
  private closeCallback?: () => void;

  constructor() {
    // Get DOM elements
    this.modal = document.getElementById('leaderboard-modal')!;
    this.loadingIndicator = document.getElementById('leaderboard-loading')!;
    this.errorMessage = document.getElementById('leaderboard-error')!;
    this.leaderboardList = document.getElementById('leaderboard-list')!;
    this.lastUpdatedTime = document.getElementById('last-updated-time')!;
    this.closeButton = document.getElementById('leaderboard-close')!;

    this.setupEventListeners();
    this.setupSwipeGesture();
  }

  /**
   * Set up event listeners for modal interactions
   */
  private setupEventListeners(): void {
    // Close button click
    this.closeButton.addEventListener('click', () => {
      this.hide();
    });

    // Close on modal overlay click (outside content area)
    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.hide();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
  }

  /**
   * Show the leaderboard modal with smooth animation
   */
  show(): void {
    this.modal.style.display = 'flex';
    // Force reflow to ensure display change is applied
    this.modal.offsetHeight;
    this.modal.classList.add('fade-in');
    this.modal.classList.remove('fade-out');
    
    // Focus management for accessibility
    this.closeButton.focus();
  }

  /**
   * Hide the leaderboard modal with smooth animation
   */
  hide(): void {
    this.modal.classList.add('fade-out');
    this.modal.classList.remove('fade-in');
    
    // Hide after animation completes
    setTimeout(() => {
      if (this.modal.classList.contains('fade-out')) {
        this.modal.style.display = 'none';
        this.modal.classList.remove('fade-out');
      }
    }, 300);

    // Call close callback if set
    if (this.closeCallback) {
      this.closeCallback();
    }
  }

  /**
   * Check if the leaderboard is currently visible
   */
  isVisible(): boolean {
    return this.modal.style.display === 'flex';
  }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this.loadingIndicator.style.display = isLoading ? 'block' : 'none';
    this.errorMessage.style.display = 'none';
    this.leaderboardList.style.display = isLoading ? 'none' : 'block';
  }

  /**
   * Set error state with message
   */
  setError(message: string): void {
    this.errorMessage.textContent = message;
    this.errorMessage.style.display = 'block';
    this.loadingIndicator.style.display = 'none';
    this.leaderboardList.style.display = 'none';
  }

  /**
   * Clear all content and reset to initial state
   */
  clear(): void {
    this.leaderboardList.innerHTML = '';
    this.lastUpdatedTime.textContent = '';
    this.loadingIndicator.style.display = 'none';
    this.errorMessage.style.display = 'none';
    this.leaderboardList.style.display = 'block';
  }

  /**
   * Render the leaderboard with scores and highlight current user
   */
  render(scores: HighScore[], currentUser?: string): void {
    this.clear();
    
    if (!scores || scores.length === 0) {
      this.renderNoScores();
      return;
    }

    // Sort scores by rank to ensure proper order
    const sortedScores = [...scores].sort((a, b) => a.rank - b.rank);

    // Create leaderboard entries
    sortedScores.forEach((score, index) => {
      const entry = this.createLeaderboardEntry(score, currentUser);
      this.leaderboardList.appendChild(entry);
      
      // Add staggered animation for visual appeal
      setTimeout(() => {
        entry.classList.add('scale-in');
      }, index * 50);
    });

    // Update last updated time
    this.updateLastUpdatedTime();
    
    // Show the list
    this.leaderboardList.style.display = 'block';
  }

  /**
   * Create a single leaderboard entry element
   */
  private createLeaderboardEntry(score: HighScore, currentUser?: string): HTMLElement {
    const entry = document.createElement('div');
    entry.className = 'leaderboard-entry';
    
    // Highlight current user
    if (currentUser && score.username === currentUser) {
      entry.classList.add('current-user');
      score.isCurrentUser = true;
    }

    // Create rank badge
    const rankBadge = document.createElement('div');
    rankBadge.className = `rank-badge ${this.getRankBadgeClass(score.rank)}`;
    rankBadge.textContent = score.rank.toString();

    // Create player info section
    const playerInfo = document.createElement('div');
    playerInfo.className = 'player-info';

    const username = document.createElement('span');
    username.className = 'username';
    username.textContent = score.username;

    const scoreValue = document.createElement('span');
    scoreValue.className = 'score';
    scoreValue.textContent = this.formatScore(score.score);

    playerInfo.appendChild(username);
    playerInfo.appendChild(scoreValue);

    // Create meta info section
    const metaInfo = document.createElement('div');
    metaInfo.className = 'meta-info';

    const gameTime = document.createElement('span');
    gameTime.className = 'game-time';
    gameTime.textContent = this.formatGameTime(score.gameTime);

    const date = document.createElement('span');
    date.className = 'date';
    date.textContent = this.formatDate(score.timestamp);

    metaInfo.appendChild(gameTime);
    metaInfo.appendChild(date);

    // Assemble the entry
    entry.appendChild(rankBadge);
    entry.appendChild(playerInfo);
    entry.appendChild(metaInfo);

    return entry;
  }

  /**
   * Render message when no scores are available
   */
  private renderNoScores(): void {
    const noScoresMessage = document.createElement('div');
    noScoresMessage.className = 'no-scores';
    noScoresMessage.textContent = 'No high scores yet. Be the first to play!';
    this.leaderboardList.appendChild(noScoresMessage);
  }

  /**
   * Get CSS class for rank badge based on position
   */
  private getRankBadgeClass(rank: number): string {
    switch (rank) {
      case 1:
        return 'rank-gold';
      case 2:
        return 'rank-silver';
      case 3:
        return 'rank-bronze';
      default:
        return 'rank-default';
    }
  }

  /**
   * Format score with proper number formatting and separators
   */
  private formatScore(score: number): string {
    return score.toLocaleString();
  }

  /**
   * Format game time in a human-readable format
   * @param gameTime Game time in milliseconds
   */
  private formatGameTime(gameTime: number): string {
    // Convert milliseconds to seconds first
    const totalSeconds = Math.floor(gameTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format timestamp to a readable date string
   */
  private formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Update the last updated timestamp
   */
  private updateLastUpdatedTime(): void {
    const now = new Date();
    this.lastUpdatedTime.textContent = now.toLocaleTimeString();
  }

  /**
   * Highlight a specific user's score in the leaderboard
   */
  highlightUserScore(username: string): void {
    const entries = this.leaderboardList.querySelectorAll('.leaderboard-entry');
    entries.forEach(entry => {
      const usernameElement = entry.querySelector('.username');
      if (usernameElement && usernameElement.textContent === username) {
        entry.classList.add('current-user');
        // Scroll to the highlighted entry
        entry.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        entry.classList.remove('current-user');
      }
    });
  }

  /**
   * Set callback for when modal is closed
   */
  onClose(callback: () => void): void {
    this.closeCallback = callback;
  }

  /**
   * Add swipe-to-close gesture for mobile devices
   */
  private setupSwipeGesture(): void {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const content = this.modal.querySelector('.leaderboard-content') as HTMLElement;

    content.addEventListener('touchstart', (e) => {
      if (e.touches[0]) {
        startY = e.touches[0].clientY;
        isDragging = true;
      }
    });

    content.addEventListener('touchmove', (e) => {
      if (!isDragging || !e.touches[0]) return;
      
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      // Only allow downward swipe to close
      if (deltaY > 0) {
        content.style.transform = `translateY(${deltaY}px)`;
        content.style.opacity = `${1 - deltaY / 200}`;
      }
    });

    content.addEventListener('touchend', () => {
      if (!isDragging) return;
      
      const deltaY = currentY - startY;
      
      if (deltaY > 100) {
        // Swipe threshold reached, close modal
        this.hide();
      } else {
        // Reset position
        content.style.transform = '';
        content.style.opacity = '';
      }
      
      isDragging = false;
    });
  }
}