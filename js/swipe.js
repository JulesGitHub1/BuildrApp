/**
 * Swipe.js - Handles touch interactions and swipe gestures
 */

class SwipeHandler {
    constructor(container) {
        this.container = container;
        this.currentElement = null;
        this.startY = 0;
        this.currentY = 0;
        this.isSwiping = false;
        this.swipeThreshold = 100; // Minimum distance to trigger a swipe
        this.swipeIndicator = null;
        
        // Bind methods to maintain 'this' context
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        // Create swipe indicator
        this.createSwipeIndicator();
    }
    
    /**
     * Initialize a new element for swiping
     */
    initElement(element, onSwipeUp, onSwipeDown) {
        this.currentElement = element;
        this.onSwipeUp = onSwipeUp;
        this.onSwipeDown = onSwipeDown;
        
        // Add event listeners
        element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        
        // For desktop testing
        element.addEventListener('mousedown', this.handleTouchStart);
        document.addEventListener('mousemove', this.handleTouchMove);
        document.addEventListener('mouseup', this.handleTouchEnd);
    }
    
    /**
     * Create the swipe indicator element
     */
    createSwipeIndicator() {
        this.swipeIndicator = document.createElement('div');
        this.swipeIndicator.className = 'swipe-indicator';
        this.container.appendChild(this.swipeIndicator);
    }
    
    /**
     * Handle touch start event
     */
    handleTouchStart(e) {
        if (!this.currentElement) return;
        
        e.preventDefault();
        
        // Get initial touch position
        if (e.type === 'touchstart') {
            this.startY = e.touches[0].clientY;
        } else {
            this.startY = e.clientY;
        }
        
        this.currentY = this.startY;
        this.isSwiping = true;
        
        // Add swiping class to disable transitions during drag
        this.currentElement.classList.add('swiping');
    }
    
    /**
     * Handle touch move event
     */
    handleTouchMove(e) {
        if (!this.isSwiping || !this.currentElement) return;
        
        e.preventDefault();
        
        // Get current touch position
        if (e.type === 'touchmove') {
            this.currentY = e.touches[0].clientY;
        } else {
            this.currentY = e.clientY;
        }
        
        // Calculate distance moved
        const deltaY = this.currentY - this.startY;
        
        // Apply transform to element
        this.currentElement.style.transform = `translateY(${deltaY}px) rotate(${deltaY * 0.05}deg)`;
        
        // Show appropriate indicator based on swipe direction
        if (deltaY < -50) {
            this.showSwipeIndicator('like');
        } else if (deltaY > 50) {
            this.showSwipeIndicator('dislike');
        } else {
            this.hideSwipeIndicator();
        }
    }
    
    /**
     * Handle touch end event
     */
    handleTouchEnd(e) {
        if (!this.isSwiping || !this.currentElement) return;
        
        e.preventDefault();
        
        // Calculate final distance moved
        const deltaY = this.currentY - this.startY;
        
        // Remove swiping class to re-enable transitions
        this.currentElement.classList.remove('swiping');
        
        // Check if swipe threshold was met
        if (deltaY < -this.swipeThreshold) {
            // Swipe up (like)
            this.currentElement.classList.add('swipe-up');
            if (this.onSwipeUp) this.onSwipeUp();
        } else if (deltaY > this.swipeThreshold) {
            // Swipe down (dislike)
            this.currentElement.classList.add('swipe-down');
            if (this.onSwipeDown) this.onSwipeDown();
        } else {
            // Reset position if threshold not met
            this.currentElement.style.transform = '';
        }
        
        this.isSwiping = false;
        this.hideSwipeIndicator();
        
        // Clean up event listeners for desktop testing
        if (e.type === 'mouseup') {
            document.removeEventListener('mousemove', this.handleTouchMove);
            document.removeEventListener('mouseup', this.handleTouchEnd);
        }
    }
    
    /**
     * Show the swipe indicator with appropriate style
     */
    showSwipeIndicator(type) {
        this.swipeIndicator.className = 'swipe-indicator';
        this.swipeIndicator.classList.add(type);
        this.swipeIndicator.classList.add('visible');
        
        if (type === 'like') {
            this.swipeIndicator.textContent = '👍 LIKE';
        } else {
            this.swipeIndicator.textContent = '👎 DISLIKE';
        }
    }
    
    /**
     * Hide the swipe indicator
     */
    hideSwipeIndicator() {
        this.swipeIndicator.classList.remove('visible');
    }
    
    /**
     * Clean up event listeners
     */
    cleanup() {
        if (this.currentElement) {
            this.currentElement.removeEventListener('touchstart', this.handleTouchStart);
            this.currentElement.removeEventListener('touchmove', this.handleTouchMove);
            this.currentElement.removeEventListener('touchend', this.handleTouchEnd);
            this.currentElement.removeEventListener('mousedown', this.handleTouchStart);
        }
        
        document.removeEventListener('mousemove', this.handleTouchMove);
        document.removeEventListener('mouseup', this.handleTouchEnd);
    }
}
