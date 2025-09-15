// UI controls and interactions

let isMuted = false;
let audioContext = null;
let autoZoomEnabled = true; // Auto zoom is enabled by default
let autoZoomInterval = null; // Interval for continuous zoom checking
let lastSizeChange = 0; // Timestamp of last size change
let currentZoomSize = 3; // Current zoom size to detect changes
let trackTipMode = false; // Track tip mode is disabled by default
window.trackTipMode = trackTipMode; // Make it globally accessible

function toggleTheme() {
    const body = document.body;
    const themeButton = document.querySelector('.theme-button');
    
    // Check if we're on mobile (screen width <= 768px)
    const isMobile = window.innerWidth <= 768;
    
    if (body.dataset.theme === "dark") {
        body.dataset.theme = "light";
        themeButton.textContent = isMobile ? "🌙" : "🌙 Dark Mode";
    } else {
        body.dataset.theme = "dark";
        themeButton.textContent = isMobile ? "☀️" : "☀️ Light Mode";
    }
}

function toggleHelp() {
    const helpModal = document.getElementById('helpModal');
    helpModal.classList.toggle('active');
}

function toggleStats() {
    const statsModal = document.getElementById('statsModal');
    statsModal.classList.toggle('active');
}

function showStats() {
    const statsModal = document.getElementById('statsModal');
    calculateAndDisplayStats();
    statsModal.classList.add('active');
}

function openTipsForm() {
    window.open('https://forms.gle/BTSvAVEbBNFhY8xs5', '_blank', 'noopener,noreferrer');
}

function updateSessionButtonDisplay(zoomLevel) {
    // This function is now deprecated - buttons are always emoji-only
}

function adjustSize(value) {
    const sizePresets = {
        0.5: { minWidth: 80, padding: 4, imageHeight: 40, nameSize: 8, gap: 5 },
        1: { minWidth: 120, padding: 8, imageHeight: 60, nameSize: 10, gap: 10 },
        2: { minWidth: 150, padding: 10, imageHeight: 80, nameSize: 11, gap: 15 },
        3: { minWidth: 200, padding: 15, imageHeight: 120, nameSize: 14, gap: 20 },
        4: { minWidth: 250, padding: 20, imageHeight: 150, nameSize: 16, gap: 25 },
        5: { minWidth: 300, padding: 25, imageHeight: 180, nameSize: 18, gap: 30 }
    };
    
    const numValue = parseFloat(value);
    
    // Handle values below 1 specially
    let lower, upper, fraction;
    if (numValue < 1) {
        lower = 0.5;
        upper = 1;
        fraction = (numValue - 0.5) / 0.5; // Scale 0.5-1 to 0-1
    } else {
        lower = Math.floor(numValue);
        upper = Math.ceil(numValue);
        fraction = numValue - lower;
    }
    
    // Interpolate between presets
    const lowerPreset = sizePresets[lower];
    const upperPreset = sizePresets[upper];
    
    const interpolated = {
        minWidth: Math.round(lowerPreset.minWidth + (upperPreset.minWidth - lowerPreset.minWidth) * fraction),
        padding: Math.round(lowerPreset.padding + (upperPreset.padding - lowerPreset.padding) * fraction),
        imageHeight: Math.round(lowerPreset.imageHeight + (upperPreset.imageHeight - lowerPreset.imageHeight) * fraction),
        nameSize: Math.round((lowerPreset.nameSize + (upperPreset.nameSize - lowerPreset.nameSize) * fraction) * 10) / 10,
        gap: Math.round(lowerPreset.gap + (upperPreset.gap - lowerPreset.gap) * fraction)
    };
    
    document.documentElement.style.setProperty('--track-min-width', interpolated.minWidth + 'px');
    document.documentElement.style.setProperty('--track-padding', interpolated.padding + 'px');
    document.documentElement.style.setProperty('--track-image-height', interpolated.imageHeight + 'px');
    document.documentElement.style.setProperty('--track-name-size', interpolated.nameSize + 'px');
    document.documentElement.style.setProperty('--track-gap', interpolated.gap + 'px');
    
}

function zoomToFit() {
    const tracks = document.querySelectorAll('.track-item');
    if (tracks.length === 0) return;
    
    // Get viewport dimensions
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Check if session sidebar is open
    const mainContentWrapper = document.getElementById('mainContentWrapper');
    const sidebarOpen = mainContentWrapper.classList.contains('shifted');
    
    // Calculate available width (account for sidebar if open)
    const availableWidth = sidebarOpen ? viewportWidth - 350 : viewportWidth; // 350px is sidebar width
    
    // Get fixed elements heights
    const header = document.querySelector('.header');
    const headerHeight = header.offsetHeight;
    
    // Calculate available height for tracks with more conservative margins
    const availableHeight = viewportHeight - headerHeight - 60; // Increased margin for better fit
    
    // Start with a smaller size when sidebar is open or on mobile
    const isMobile = viewportWidth <= 768;
    let testSize = sidebarOpen ? 0.5 : (isMobile ? 0.8 : 1.0);
    let maxSize = sidebarOpen ? 3.0 : (isMobile ? 2.5 : 5.0);
    let bestSize = testSize;
    
    // Binary search to find the largest size that doesn't cause scrolling
    for (let i = 0; i < 25; i++) {
        testSize = (bestSize + maxSize) / 2;
        
        // Apply test size
        isZoomToFitCall = true; // Set flag to prevent disabling auto zoom
        adjustSize(testSize);
        isZoomToFitCall = false; // Reset flag
        
        // Force reflow to get accurate measurements
        document.body.offsetHeight;
        
        // Check if content fits in available space
        const trackGrid = document.querySelector('.track-grid');
        const gridHeight = trackGrid.scrollHeight;
        const gridWidth = trackGrid.scrollWidth;
        
        // More strict scrollbar detection
        const hasVerticalScrollbar = document.documentElement.scrollHeight > viewportHeight;
        const hasHorizontalScrollbar = gridWidth > availableWidth;
        const contentFitsHeight = gridHeight <= availableHeight;
        
        if (!hasVerticalScrollbar && !hasHorizontalScrollbar && contentFitsHeight) {
            bestSize = testSize;
        } else {
            maxSize = testSize;
        }
        
        // Stop if we're close enough
        if (Math.abs(maxSize - bestSize) < 0.03) break;
    }
    
    // Apply the best size found
    isZoomToFitCall = true; // Set flag to prevent disabling auto zoom
    adjustSize(bestSize);
    isZoomToFitCall = false; // Reset flag
    document.getElementById('sizeSlider').value = bestSize.toFixed(1);
    
    // Update session button display based on zoom level
    updateSessionButtonDisplay(bestSize);
    
    // Track size changes
    if (Math.abs(bestSize - currentZoomSize) > 0.01) {
        currentZoomSize = bestSize;
        lastSizeChange = Date.now();
    }
}

function toggleMute() {
    isMuted = !isMuted;
    const muteButton = document.querySelector('.mute-button');
    muteButton.classList.toggle('muted');
}

function playSound(filename) {
    if (isMuted) return;
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    fetch(`sounds/${filename}`)
        .then(response => response.arrayBuffer())
        .then(buffer => audioContext.decodeAudioData(buffer))
        .then(audioBuffer => {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
        })
        .catch(error => console.error('Error playing sound:', error));
}

function toggleAutoZoom() {
    autoZoomEnabled = !autoZoomEnabled;
    const toggleBtn = document.getElementById('zoomToggleBtn');
    const manualControls = document.getElementById('manualZoomControls');
    
    if (autoZoomEnabled) {
        // Auto zoom ON = gray button (default styling), no zoom bar
        toggleBtn.classList.remove('inactive');
        toggleBtn.textContent = '🔍 Zoom to Fit';
        manualControls.style.display = 'none';
        // Start continuous zoom monitoring
        startContinuousZoom();
    } else {
        // Auto zoom OFF = red button, show zoom bar
        toggleBtn.classList.add('inactive');
        toggleBtn.textContent = '🔍 Manual Zoom';
        manualControls.style.display = 'flex';
        // Stop continuous zoom monitoring
        stopContinuousZoom();
    }
}

// Smart zoom function that adjusts interval based on activity
function smartZoom() {
    if (!autoZoomEnabled) return;
    
    isZoomToFitCall = true;
    zoomToFit();
    isZoomToFitCall = false;
    
    // Check if we've had recent changes
    const timeSinceLastChange = Date.now() - lastSizeChange;
    const nextInterval = timeSinceLastChange > 500 ? 250 : 10;
    
    // Clear existing interval and set new one
    if (autoZoomInterval) {
        clearInterval(autoZoomInterval);
    }
    
    autoZoomInterval = setTimeout(smartZoom, nextInterval);
}

// Start continuous zoom monitoring
function startContinuousZoom() {
    if (autoZoomInterval) {
        clearInterval(autoZoomInterval);
    }
    
    // Initial zoom
    isZoomToFitCall = true;
    zoomToFit();
    isZoomToFitCall = false;
    
    // Start smart zoom monitoring
    smartZoom();
}

// Stop continuous zoom monitoring
function stopContinuousZoom() {
    if (autoZoomInterval) {
        clearTimeout(autoZoomInterval);
        autoZoomInterval = null;
    }
}

// Override adjustSize to disable auto zoom when manual adjustment is made
const originalAdjustSize = adjustSize;
let isZoomToFitCall = false; // Flag to track if adjustSize is called from zoomToFit

adjustSize = function(value) {
    if (autoZoomEnabled && !isZoomToFitCall) {
        // If auto zoom is on and this is NOT a call from zoomToFit, disable it when user manually adjusts
        autoZoomEnabled = false;
        const toggleBtn = document.getElementById('zoomToggleBtn');
        const manualControls = document.getElementById('manualZoomControls');
        toggleBtn.classList.add('inactive'); // Turn red
        toggleBtn.textContent = '🔍 Manual Zoom';
        manualControls.style.display = 'flex';
    }
    originalAdjustSize(value);
    
    // Update session button display based on new zoom level
    updateSessionButtonDisplay(parseFloat(value));
};

// Track Tip Mode Functions
function toggleTrackTipMode() {
    trackTipMode = !trackTipMode;
    window.trackTipMode = trackTipMode; // Update global variable
    const toggleBtn = document.getElementById('trackTipToggleBtn');
    
    if (trackTipMode) {
        toggleBtn.classList.add('active');
        toggleBtn.textContent = '💡 Track Tips ON';
    } else {
        toggleBtn.classList.remove('active');
        toggleBtn.textContent = '💡 Track Tips OFF';
    }
}

function showTrackTip(trackName) {
    if (!trackTipMode) return;
    
    const modal = document.getElementById('trackTipModal');
    const title = document.getElementById('trackTipTitle');
    const body = document.querySelector('.track-tip-body');
    
    title.textContent = `${trackName} - Track Tips`;
    
    // Load track-specific content
    loadTrackTipContent(trackName, body);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    // Show modal and trigger animations
    modal.style.display = 'flex';
    modal.offsetHeight; // Force reflow
    modal.classList.add('active');
}

// Track tip page management
let currentTrackTipPage = 1;
const totalTrackTipPages = 2;

function loadTrackTipContent(trackName, container) {
    // Reset to page 1
    currentTrackTipPage = 1;
    
    // Hide all pages and show page 1
    document.querySelectorAll('.track-tip-page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('trackTipPage1').classList.add('active');
    
    // Update page dots
    document.querySelectorAll('.page-dot').forEach(dot => {
        dot.classList.remove('active');
    });
    document.getElementById('pageDot1').classList.add('active');
    
    // Update navigation
    updateTrackTipNavigation();
    
    // Load content for all pages
    loadStrategyContent(trackName);
    loadItemTipsContent(trackName);
    loadShortcutsContent(trackName);
}

function loadStrategyContent(trackName) {
    const container = document.getElementById('strategyContent');
    
    container.innerHTML = `
        <p>Strategy tips will be displayed here.</p>
        <p>This section will contain racing strategies and tips for this track.</p>
    `;
}

function loadItemTipsContent(trackName) {
    const container = document.getElementById('itemTipsContent');
    
    container.innerHTML = `
        <p>Item use tips will be displayed here.</p>
        <p>This section will contain specific item usage strategies for this track.</p>
    `;
}

function loadShortcutsContent(trackName) {
    const container = document.getElementById('shortcutsContent');
    
    if (trackName === 'Whistlestop Summit') {
        container.innerHTML = `
            <div class="track-tip-video-section">
                <h4>🎥 Shortcut Tutorial</h4>
                <div class="youtube-video-container">
                    <div class="youtube-thumbnail" onclick="openYouTubeVideo('wChv4_Cdpeg')">
                        <img src="https://img.youtube.com/vi/wChv4_Cdpeg/maxresdefault.jpg" alt="YouTube Video Thumbnail" class="youtube-thumbnail-img">
                        <div class="youtube-play-button">
                            <div class="play-icon">▶</div>
                        </div>
                    </div>
                    <div class="youtube-info">
                        <h5 class="youtube-title">Whistlestop Summit Shortcut Tutorial</h5>
                        <p class="youtube-description">This video teaches you how to do the most important shortcut on Whistlestop Summit! (Credit to Shortcat)</p>
                        <button class="youtube-watch-button" onclick="openYouTubeVideo('wChv4_Cdpeg')">
                            📺 Watch on YouTube
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <p>Important no-item shortcuts will be displayed here.</p>
            <p>This section will contain video tutorials and tips for shortcuts on this track.</p>
        `;
    }
}


function openYouTubeVideo(videoId) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}

function flipTrackTipPage(direction) {
    const newPage = currentTrackTipPage + direction;
    
    if (newPage >= 1 && newPage <= totalTrackTipPages) {
        // Hide current page
        document.getElementById(`trackTipPage${currentTrackTipPage}`).classList.remove('active');
        document.getElementById(`pageDot${currentTrackTipPage}`).classList.remove('active');
        
        // Show new page
        currentTrackTipPage = newPage;
        document.getElementById(`trackTipPage${currentTrackTipPage}`).classList.add('active');
        document.getElementById(`pageDot${currentTrackTipPage}`).classList.add('active');
        
        // Update navigation arrows
        updateTrackTipNavigation();
    }
}

function updateTrackTipNavigation() {
    const leftArrow = document.getElementById('navArrowLeft');
    const rightArrow = document.getElementById('navArrowRight');
    
    // Update left arrow
    if (currentTrackTipPage === 1) {
        leftArrow.style.display = 'none';
    } else {
        leftArrow.style.display = 'flex';
        leftArrow.textContent = '‹';
    }
    
    // Update right arrow
    if (currentTrackTipPage === totalTrackTipPages) {
        rightArrow.style.display = 'none';
    } else {
        rightArrow.style.display = 'flex';
        rightArrow.textContent = 'NISCs ›';
    }
}

function closeTrackTip() {
    const modal = document.getElementById('trackTipModal');
    
    // Remove active class to trigger fade out
    modal.classList.remove('active');
    
    // Restore background scrolling
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    
    // Hide modal after transition completes
    setTimeout(() => {
        if (!modal.classList.contains('active')) {
            modal.style.display = 'none';
        }
    }, 300); // Match the CSS transition duration
}

// Add click outside to close track tip modal
document.addEventListener('click', function(event) {
    const modal = document.getElementById('trackTipModal');
    const modalContent = document.querySelector('.track-tip-content');
    
    if (modal.classList.contains('active') && 
        !modalContent.contains(event.target) && 
        event.target === modal) {
        closeTrackTip();
    }
});

// Function to update theme button text based on screen size
function updateThemeButtonText() {
    const body = document.body;
    const themeButton = document.querySelector('.theme-button');
    const isMobile = window.innerWidth <= 768;
    
    if (body.dataset.theme === "dark") {
        themeButton.textContent = isMobile ? "☀️" : "☀️ Light Mode";
    } else {
        themeButton.textContent = isMobile ? "🌙" : "🌙 Dark Mode";
    }
}

// Make functions globally accessible
window.toggleTrackTipMode = toggleTrackTipMode;
window.showTrackTip = showTrackTip;
window.closeTrackTip = closeTrackTip;
window.updateThemeButtonText = updateThemeButtonText;
window.openYouTubeVideo = openYouTubeVideo;
window.flipTrackTipPage = flipTrackTipPage;
