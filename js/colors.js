/**
 * Colors.js - Handles color generation, similarity calculations, and selection
 */

class ColorManager {
    constructor() {
        // Generate at least 100 unique colors
        this.allColors = this.generateColors(150);
        this.likedColors = [];
        this.dislikedColors = [];
        this.shownColors = [];
        this.currentColorIndex = 0;
    }

    /**
     * Generate a set of unique colors
     */
    generateColors(count) {
        const colors = [];
        
        // Generate some colors across the spectrum
        for (let i = 0; i < count; i++) {
            // Use HSL for better distribution
            const h = Math.floor(Math.random() * 360);
            const s = Math.floor(40 + Math.random() * 60); // 40-100% saturation
            const l = Math.floor(40 + Math.random() * 40); // 40-80% lightness
            
            const color = {
                hsl: { h, s, l },
                hex: this.hslToHex(h, s, l),
                id: this.generateUniqueId(h, s, l)
            };
            
            colors.push(color);
        }
        
        return colors;
    }
    
    /**
     * Convert HSL to Hex color
     */
    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
    
    /**
     * Generate a unique ID for a color based on its HSL values
     */
    generateUniqueId(h, s, l) {
        // Create a number between 1000-9999 based on the color values
        return Math.floor(1000 + (h * 9000 / 360) + (s * l / 100)) % 9000 + 1000;
    }
    
    /**
     * Calculate similarity between two colors (lower is more similar)
     */
    calculateColorDistance(color1, color2) {
        // Using a simple Euclidean distance in HSL space
        // Hue is circular, so we need to handle it differently
        const h1 = color1.hsl.h;
        const h2 = color2.hsl.h;
        const s1 = color1.hsl.s;
        const s2 = color2.hsl.s;
        const l1 = color1.hsl.l;
        const l2 = color2.hsl.l;
        
        // Calculate the shortest distance in the hue circle
        const hDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
        
        // Normalize hue difference (max is 180)
        const normalizedHDiff = hDiff / 180;
        
        // Normalize saturation and lightness differences (max is 100)
        const normalizedSDiff = Math.abs(s1 - s2) / 100;
        const normalizedLDiff = Math.abs(l1 - l2) / 100;
        
        // Weight the components (hue is most important, then saturation, then lightness)
        return (normalizedHDiff * 0.6) + (normalizedSDiff * 0.3) + (normalizedLDiff * 0.1);
    }
    
    /**
     * Get the next color to show based on user preferences
     */
    getNextColor() {
        // For the first 5 colors, return random ones
        if (this.currentColorIndex < 5) {
            const randomIndex = Math.floor(Math.random() * this.allColors.length);
            const color = this.allColors[randomIndex];
            
            // Remove this color from the pool to avoid duplicates
            this.allColors.splice(randomIndex, 1);
            
            this.shownColors.push(color);
            this.currentColorIndex++;
            return color;
        }
        
        // After the first 5, use the voting algorithm
        return this.selectColorBasedOnPreferences();
    }
    
    /**
     * Select a color based on user preferences
     */
    selectColorBasedOnPreferences() {
        // If no likes yet, continue with random selection
        if (this.likedColors.length === 0) {
            const randomIndex = Math.floor(Math.random() * this.allColors.length);
            const color = this.allColors[randomIndex];
            this.allColors.splice(randomIndex, 1);
            this.shownColors.push(color);
            this.currentColorIndex++;
            return color;
        }
        
        // Calculate a score for each remaining color based on:
        // - Similarity to liked colors (higher is better)
        // - Dissimilarity to disliked colors (higher is better)
        const colorScores = this.allColors.map(color => {
            let likeScore = 0;
            let dislikeScore = 0;
            
            // Calculate average similarity to liked colors
            if (this.likedColors.length > 0) {
                const likeDistances = this.likedColors.map(likedColor => 
                    this.calculateColorDistance(color, likedColor)
                );
                // Convert distance to similarity (1 - distance)
                likeScore = 1 - (likeDistances.reduce((a, b) => a + b, 0) / this.likedColors.length);
            }
            
            // Calculate average dissimilarity to disliked colors
            if (this.dislikedColors.length > 0) {
                const dislikeDistances = this.dislikedColors.map(dislikedColor => 
                    this.calculateColorDistance(color, dislikedColor)
                );
                // Distance is already a measure of dissimilarity
                dislikeScore = dislikeDistances.reduce((a, b) => a + b, 0) / this.dislikedColors.length;
            }
            
            // Combine scores - weight like score more heavily
            const totalScore = (likeScore * 0.7) + (dislikeScore * 0.3);
            
            return { color, score: totalScore };
        });
        
        // Sort by score (highest first)
        colorScores.sort((a, b) => b.score - a.score);
        
        // Add some randomness - select from top 10% of colors
        const topCount = Math.max(1, Math.floor(colorScores.length * 0.1));
        const selectedIndex = Math.floor(Math.random() * topCount);
        const selectedColor = colorScores[selectedIndex].color;
        
        // Remove the selected color from the pool
        const colorIndex = this.allColors.findIndex(c => c.hex === selectedColor.hex);
        if (colorIndex !== -1) {
            this.allColors.splice(colorIndex, 1);
        }
        
        this.shownColors.push(selectedColor);
        this.currentColorIndex++;
        return selectedColor;
    }
    
    /**
     * Record a user's like for a color
     */
    likeColor(color) {
        this.likedColors.push(color);
    }
    
    /**
     * Record a user's dislike for a color
     */
    dislikeColor(color) {
        this.dislikedColors.push(color);
    }
    
    /**
     * Get the current color
     */
    getCurrentColor() {
        if (this.shownColors.length === 0) {
            return null;
        }
        return this.shownColors[this.shownColors.length - 1];
    }
    
    /**
     * Reset the color manager
     */
    reset() {
        this.allColors = this.generateColors(150);
        this.likedColors = [];
        this.dislikedColors = [];
        this.shownColors = [];
        this.currentColorIndex = 0;
    }
}

// Create the color manager and make it globally accessible
window.colorManager = new ColorManager();
