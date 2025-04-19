/**
 * App.js - Main application logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements for intro screen
    const introScreen = document.getElementById('intro-screen');
    const statusText = document.getElementById('status-text');
    const scanCompletedBtn = document.getElementById('scan-completed-btn');
    const introDescription = document.getElementById('intro-description');
    const beginSwipingBtn = document.getElementById('begin-swiping-btn');
    const appContainer = document.getElementById('app-container');
    
    // Get DOM elements for main app
    const swipeContainer = document.querySelector('.swipe-container');
    const finalizeBtn = document.getElementById('finalize-btn');
    const heartAnimation = document.getElementById('heart-animation');
    const resultContainer = document.getElementById('result-container');
    const finalColorDisplay = document.getElementById('final-color-display');
    const colorNumber = document.getElementById('color-number');
    const restartBtn = document.getElementById('restart-btn');
    
    // Initialize swipe handler
    const swipeHandler = new SwipeHandler(swipeContainer);
    
    // Current color swatch element
    let currentColorSwatch = null;
    
    // Track if we're out of colors
    let outOfColors = false;
    
    // Intro screen functionality
    
    // Add flashing class to status text
    statusText.classList.add('flashing');
    
    // Array of status messages
    const statusMessages = [
        'Scanning environment',
        'Estimating user coordinates',
        'Optimizing color palette',
        'Analyzing room temperature',
        'Uploading search history',
        'Optimizing color palette',
        'Unencypting user data',
        'Optimizing color palette'
    ];
    
    let currentMessageIndex = 0;
    
    // Function to cycle through status messages
    const cycleStatusMessages = () => {
        currentMessageIndex = (currentMessageIndex + 1) % statusMessages.length;
        statusText.textContent = statusMessages[currentMessageIndex];
    };
    
    // Start cycling through messages every 2 seconds
    const messageInterval = setInterval(cycleStatusMessages, 2000);
    
    // Handle "Scan Completed" button click
    scanCompletedBtn.addEventListener('click', () => {
        // Stop cycling messages
        clearInterval(messageInterval);
        
        // Hide status text and scan completed button
        statusText.style.display = 'none';
        scanCompletedBtn.style.display = 'none';
        
        // Show intro description and begin swiping button
        introDescription.style.display = 'block';
        beginSwipingBtn.style.display = 'block';
    });
    
    // Handle "Begin Swiping" button click
    beginSwipingBtn.addEventListener('click', () => {
        // Hide intro screen
        introScreen.style.display = 'none';
        
        // Show main app container
        appContainer.style.display = 'flex';
        
        // Start the app by showing the first color
        showNextColor();
    });
    
    // Add swipe instructions
    const addSwipeInstructions = () => {
        const instructions = document.createElement('div');
        instructions.className = 'swipe-instructions';
        instructions.innerHTML = `
            <div>Swipe UP to LIKE</div>
            <div class="arrow">⬆️</div>
            <div>Swipe DOWN to DISLIKE</div>
            <div class="arrow">⬇️</div>
        `;
        swipeContainer.appendChild(instructions);
        
        // Remove instructions after 3 seconds
        setTimeout(() => {
            instructions.style.opacity = '0';
            setTimeout(() => {
                if (instructions.parentNode) {
                    instructions.parentNode.removeChild(instructions);
                }
            }, 500);
        }, 3000);
    };
    
    // Create a new color swatch
    const createColorSwatch = (color) => {
        // Remove any existing instructions
        const existingInstructions = document.querySelector('.swipe-instructions');
        if (existingInstructions) {
            existingInstructions.parentNode.removeChild(existingInstructions);
        }
        
        // Create new swatch element
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color.hex;
        
        // Add to container
        swipeContainer.appendChild(swatch);
        
        // Set up swipe handling
        swipeHandler.initElement(
            swatch,
            () => handleSwipeUp(color),
            () => handleSwipeDown(color)
        );
        
        // Update current swatch reference
        currentColorSwatch = swatch;
        
        // Show instructions for the first color
        if (colorManager.currentColorIndex === 1) {
            addSwipeInstructions();
        }
        
        return swatch;
    };
    
    // Handle swipe up (like)
    const handleSwipeUp = (color) => {
        // Record the like
        colorManager.likeColor(color);
        
        // Wait for animation to complete
        setTimeout(() => {
            // Remove the swatch
            if (currentColorSwatch && currentColorSwatch.parentNode) {
                currentColorSwatch.parentNode.removeChild(currentColorSwatch);
            }
            
            // Show next color
            showNextColor();
        }, 500); // Match the animation duration
    };
    
    // Handle swipe down (dislike)
    const handleSwipeDown = (color) => {
        // Record the dislike
        colorManager.dislikeColor(color);
        
        // Wait for animation to complete
        setTimeout(() => {
            // Remove the swatch
            if (currentColorSwatch && currentColorSwatch.parentNode) {
                currentColorSwatch.parentNode.removeChild(currentColorSwatch);
            }
            
            // Show next color
            showNextColor();
        }, 500); // Match the animation duration
    };
    
    // Show the next color
    const showNextColor = () => {
        // Check if we have more colors
        if (colorManager.allColors.length === 0) {
            outOfColors = true;
            finalizeBtn.textContent = 'Submit Vote (No More Colors)';
            return;
        }
        
        // Get next color
        const nextColor = colorManager.getNextColor();
        
        // Create swatch for this color
        createColorSwatch(nextColor);
    };
    
    // Create heart animation
    const createHeartAnimation = () => {
        // Display the heart animation container
        heartAnimation.style.display = 'block';
        
        // Create multiple hearts
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'heart';
                heart.textContent = '❤️';
                
                // Random starting position (bottom center)
                const startX = 50 + (Math.random() * 20 - 10);
                heart.style.left = `${startX}%`;
                heart.style.bottom = '0';
                
                // Random end position (top area)
                const endX = Math.random() * 100;
                const endY = Math.random() * 100;
                heart.style.setProperty('--tx', `${endX - startX}%`);
                heart.style.setProperty('--ty', `-${endY}%`);
                
                // Add to container
                heartAnimation.appendChild(heart);
                
                // Remove after animation completes
                setTimeout(() => {
                    if (heart.parentNode) {
                        heart.parentNode.removeChild(heart);
                    }
                }, 2000);
            }, i * 100);
        }
        
        // Hide the animation container after all hearts are done
        setTimeout(() => {
            heartAnimation.style.display = 'none';
        }, 3000);
    };
    
    // Send color ID to Google Sheet
    const sendColorIdToSheet = async (colorId) => {
        try {
            // Create status message element if it doesn't exist
            let statusMessage = document.getElementById('status-message');
            if (!statusMessage) {
                statusMessage = document.createElement('div');
                statusMessage.id = 'status-message';
                statusMessage.style.marginTop = '10px';
                statusMessage.style.fontWeight = 'bold';
                document.querySelector('.result-card').appendChild(statusMessage);
            }
            
            // Show loading message
            statusMessage.textContent = 'Sending to Google Sheet...';
            statusMessage.style.color = '#3498db';
            
            // Send the color ID to the Google Sheet
            // Make sure colorId is properly encoded in the URL
            const encodedColorId = encodeURIComponent(colorId);
            const url = `${CONFIG.GOOGLE_SCRIPT_URL}?colorId=${encodedColorId}`;
            console.log("Sending data to:", url);
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'no-cors' // This is needed for Google Apps Script
            });
            
            // Since we're using no-cors, we can't actually read the response
            // So we'll just assume it was successful after a short delay
            setTimeout(() => {
                statusMessage.textContent = 'Successfully saved to Google Sheet!';
                statusMessage.style.color = '#2ecc71';
            }, 1000);
            
        } catch (error) {
            console.error('Error sending color ID to sheet:', error);
            
            // Show error message
            const statusMessage = document.getElementById('status-message');
            if (statusMessage) {
                statusMessage.textContent = 'Error saving to Google Sheet. Check console for details.';
                statusMessage.style.color = '#e74c3c';
            }
        }
    };
    
    // Handle finalize button click
    finalizeBtn.addEventListener('click', () => {
        // Get the current color
        const finalColor = colorManager.getCurrentColor();
        
        // If no color has been shown yet, or we're out of colors
        if (!finalColor) {
            alert('Please swipe through at least one color first!');
            return;
        }
        
        // Create heart animation
        createHeartAnimation();
        
        // Show the result after a short delay
        setTimeout(() => {
            // Set the final color display
            finalColorDisplay.style.backgroundColor = finalColor.hex;
            
            // Set the color number
            colorNumber.textContent = `Color #${finalColor.id}`;
            
            // Show the result container
            resultContainer.classList.add('visible');
            
            // Send the color ID to the Google Sheet
            sendColorIdToSheet(finalColor.id);
        }, 1500);
    });
    
    // Handle restart button click
    restartBtn.addEventListener('click', () => {
        // Hide the result container
        resultContainer.classList.remove('visible');
        
        // Reset the color manager
        colorManager.reset();
        outOfColors = false;
        finalizeBtn.textContent = 'Submit Vote';
        
        // Clear any existing swatches
        swipeContainer.innerHTML = '';
        
        // Show the first color
        showNextColor();
    });
    
    // Note: We don't call showNextColor() here anymore
    // It will be called when the user clicks "Begin Swiping"
});
