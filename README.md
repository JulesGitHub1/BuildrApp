# ColorSwipe

A mobile-optimized web app that lets users swipe on color swatches in a TikTok-like format. Users can swipe up to like colors and swipe down to dislike colors. The app learns from these preferences and shows more colors similar to those liked and less similar to those disliked.

## Features

- 150 unique color swatches generated using HSL color space
- Swipe up to like, swipe down to dislike
- First 5 colors are completely random
- Subsequent colors are selected based on user preferences
- "Finalize" button to select your favorite color
- Heart emoji animation when finalizing
- Unique color ID displayed for the final selection
- Selected color IDs are sent to a Google Sheet for tracking

## Setup Instructions

### 1. Local Setup

Simply open the `index.html` file in a web browser to use the app locally.

### 2. Google Sheet Integration

To enable saving color selections to a Google Sheet:

1. **Deploy the Google Apps Script:**
   - Go to [Google Apps Script](https://script.google.com/) and create a new project
   - Copy the code from `google-apps-script.txt` into the script editor
   - The spreadsheet ID is already set to the provided sheet: `1A5ejlCsK3U4VR-3GbkRNVH8GLZYsISryFxmNG94NMWs`
   - Deploy as a web app:
     - Click "Deploy" > "New deployment"
     - Select type: "Web app"
     - Set "Execute as" to "Me" (this will run the script with your permissions)
     - Set "Who has access" to "Anyone" (this allows the web app to be accessed without authentication)
     - Click "Deploy"
     - You'll be asked to authorize the app - follow the prompts to grant necessary permissions
     - Copy the web app URL that looks like: `https://script.google.com/macros/s/UNIQUE_ID/exec`

2. **Update the Configuration:**
   - Open `js/config.js`
   - Replace the `GOOGLE_SCRIPT_URL` value with your deployed script URL:
   ```javascript
   GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec'
   ```

### Troubleshooting Google Sheet Integration

If you encounter issues with the Google Sheet integration:

1. **Check Console Logs:**
   - Open your browser's developer console (F12 or right-click > Inspect > Console)
   - Look for any error messages related to the fetch request
   - The app will log the URL it's trying to send data to

2. **Verify Script Deployment:**
   - Make sure your Google Apps Script is deployed as a web app
   - Check that you've set "Who has access" to "Anyone"
   - Verify that the script has the necessary permissions to access the spreadsheet

3. **Test the Script Directly:**
   - Try accessing your script URL directly in a browser with a test parameter:
   - `https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec?colorId=1234`
   - You should see a JSON response if it's working correctly

4. **CORS Issues:**
   - The app uses `mode: 'no-cors'` which means you won't see actual response data
   - This is normal and expected when working with Google Apps Script

## How It Works

1. **Color Generation:**
   - The app generates 150 unique colors using HSL color space for better distribution
   - Each color has a unique ID number between 1000-9999

2. **Swipe Mechanism:**
   - Swipe up to like a color (👍)
   - Swipe down to dislike a color (👎)
   - The first 5 colors are completely random

3. **Color Selection Algorithm:**
   - After the first 5 colors, the app uses your likes and dislikes to select new colors
   - Colors more similar to your likes and less similar to your dislikes are prioritized
   - Similarity is calculated using a weighted HSL distance formula

4. **Finalization:**
   - Click the "Finalize" button to select your current color
   - A heart animation plays
   - The color's unique ID is displayed
   - The color ID is sent to the Google Sheet for tracking

5. **Google Sheet Integration:**
   - When you finalize a color, its ID is sent to the Google Sheet
   - The sheet records the color ID and a timestamp

## Technical Implementation

- Pure HTML, CSS, and JavaScript (no frameworks required)
- Mobile-optimized with responsive design
- Touch-friendly swipe gestures with visual feedback
- Google Apps Script for Google Sheet integration

## Files

- `index.html` - Main HTML structure
- `styles.css` - CSS styling
- `js/colors.js` - Color generation and similarity calculations
- `js/swipe.js` - Touch interaction handling
- `js/config.js` - Configuration settings (Google Script URL)
- `js/app.js` - Main application logic
- `google-apps-script.txt` - Google Apps Script code for sheet integration

## Browser Compatibility

The app works on modern browsers and is optimized for mobile devices. For desktop testing, mouse interactions simulate touch events.
