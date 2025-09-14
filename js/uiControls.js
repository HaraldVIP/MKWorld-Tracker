// UI controls and interactions

let isMuted = false;
let audioContext = null;
let autoZoomEnabled = true; // Auto zoom is enabled by default
let autoZoomInterval = null; // Interval for continuous zoom checking
let lastSizeChange = 0; // Timestamp of last size change
let currentZoomSize = 3; // Current zoom size to detect changes

function toggleTheme() {
    const body = document.body;
    const themeButton = document.querySelector('.theme-button');
    
    if (body.dataset.theme === "dark") {
        body.dataset.theme = "light";
        themeButton.textContent = "🌙 Dark Mode";
    } else {
        body.dataset.theme = "dark";
        themeButton.textContent = "☀️ Light Mode";
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
    
    // Calculate available height for tracks (no separate stats height since it's inline now)
    const availableHeight = viewportHeight - headerHeight - 40; // Margin for spacing
    
    // Start with a smaller size when sidebar is open
    let testSize = sidebarOpen ? 0.5 : 1.0;
    let maxSize = sidebarOpen ? 3.0 : 5.0;
    let bestSize = testSize;
    
    // Binary search to find the largest size that doesn't cause scrolling
    for (let i = 0; i < 20; i++) {
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
        const hasVerticalScrollbar = document.documentElement.scrollHeight > viewportHeight;
        const hasHorizontalScrollbar = gridWidth > availableWidth;
        
        if (!hasVerticalScrollbar && !hasHorizontalScrollbar && gridHeight <= availableHeight) {
            bestSize = testSize;
        } else {
            maxSize = testSize;
        }
        
        // Stop if we're close enough
        if (Math.abs(maxSize - bestSize) < 0.05) break;
    }
    
    // Apply the best size found
    isZoomToFitCall = true; // Set flag to prevent disabling auto zoom
    adjustSize(bestSize);
    isZoomToFitCall = false; // Reset flag
    document.getElementById('sizeSlider').value = bestSize.toFixed(1);
    
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
};
