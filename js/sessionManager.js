// Session mode functionality with sidebar management

// Session mode variables
let sessionMode = true;
let currentSession = null;
let sessionName = '';
let trackPlacements = {}; // Track name -> placement (1-12)
let trackNotes = {}; // Track name -> notes
let savedSessions = {}; // Session name -> session data
let sessionCounter = 1; // For default session names
let trackVictoryCelebrated = new Set(); // Track which tracks have already had victory celebration

// Temporary unsaved session for non-session mode
let tempSession = {
    placements: {},
    notes: {},
    completedTracks: new Set()
};

// Make tempSession globally accessible
window.tempSession = tempSession;

// Make variables globally accessible
window.sessionMode = sessionMode;
window.currentSession = currentSession;
window.trackPlacements = trackPlacements;
window.trackNotes = trackNotes;

// Sync local variables with global ones on initialization
function syncGlobalVariables() {
    if (window.trackPlacements) {
        trackPlacements = {...window.trackPlacements};
    }
    if (window.trackNotes) {
        trackNotes = {...window.trackNotes};
    }
}

// Make sync function globally accessible
window.syncGlobalVariables = syncGlobalVariables;

// Load sessions from localStorage
function loadSessionsFromStorage() {
    const saved = localStorage.getItem('savedSessions');
    if (saved) {
        savedSessions = JSON.parse(saved);
    }
    const counter = localStorage.getItem('sessionCounter');
    if (counter) {
        sessionCounter = parseInt(counter);
    }
    updateSessionsList();
}

// Save sessions to localStorage
function saveSessionsToStorage() {
    localStorage.setItem('savedSessions', JSON.stringify(savedSessions));
    localStorage.setItem('sessionCounter', sessionCounter.toString());
}

// Generate default session name
function generateDefaultSessionName() {
    const date = new Date();
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return `Session ${sessionCounter} - ${dateStr} ${timeStr}`;
}

// Create new session
function createNewSession() {
    const sessionNameInput = document.getElementById('newSessionName');
    const sessionName = sessionNameInput.value.trim() || generateDefaultSessionName();
    
    if (savedSessions[sessionName]) {
        if (!confirm(`Session "${sessionName}" already exists. Do you want to overwrite it?`)) {
            return;
        }
    }
    
    // Create new session data, inheriting from current UI state if no active session
    savedSessions[sessionName] = {
        name: sessionName,
        date: new Date().toISOString(),
        placements: currentSession ? {} : {...window.trackPlacements},
        notes: currentSession ? {} : {...window.trackNotes},
        completedTracks: currentSession ? new Set() : new Set(completedTrackNames)
    };
    
    // If we inherited from current UI state (no active session), reset UI to empty state
    if (!currentSession) {
        // Reset the current UI state to empty
        window.trackPlacements = {};
        window.trackNotes = {};
        completedTrackNames = new Set();
        completedTracks = 0;
        
        // Create new empty temp session
        window.tempSession = {
            placements: {},
            notes: {},
            completedTracks: new Set()
        };
        
        // Regenerate track items to show the reset state
        generateTrackItems();
    }
    
    sessionCounter++;
    saveSessionsToStorage();
    updateSessionsList();
    
    // Clear input
    sessionNameInput.value = '';
    
    // Select the new session
    selectSession(sessionName);
}

// Select a session
function selectSession(sessionName) {
    if (!savedSessions[sessionName]) return;
    
    // If clicking the same session that's already active, deselect and revert to temp session
    if (currentSession === sessionName) {
        // Save current session data before deselecting
        saveCurrentSession();
        
        // Revert to temporary session
        currentSession = null;
        window.currentSession = currentSession;
        
        window.trackPlacements = {...window.tempSession.placements};
        window.trackNotes = {...window.tempSession.notes};
        
        // Keep starredTracks global - don't load from temp session
        completedTrackNames = new Set(window.tempSession.completedTracks);
        completedTracks = completedTrackNames.size;
        
        // Update UI
        updateSessionsList();
        generateTrackItems();
        return;
    }
    
    // If no session was active, save current state to temp session
    if (!currentSession) {
        window.tempSession.placements = {...trackPlacements};
        window.tempSession.notes = {...trackNotes};
        // Don't save starredTracks to temp session - they are global
        window.tempSession.completedTracks = new Set(completedTrackNames);
    } else {
        // Save current session before switching
        saveCurrentSession();
    }
    
    const sessionData = savedSessions[sessionName];
    currentSession = sessionName;
    window.currentSession = currentSession;
    
    // Load session data
    window.trackPlacements = sessionData.placements || {};
    window.trackNotes = sessionData.notes || {};
    
    // Don't load starred tracks from session - they are global
    
    // Load completed tracks from session
    if (sessionData.completedTracks) {
        completedTrackNames = new Set(sessionData.completedTracks);
        completedTracks = completedTrackNames.size;
    }
    
    // Update UI
    updateSessionsList();
    generateTrackItems();
    
}

// Save current session data
function saveCurrentSession() {
    if (!currentSession || !savedSessions[currentSession]) return;
    
    savedSessions[currentSession].placements = {...window.trackPlacements};
    savedSessions[currentSession].notes = {...window.trackNotes};
    // Don't save starredTracks to session - they are global
    savedSessions[currentSession].completedTracks = Array.from(completedTrackNames);
    savedSessions[currentSession].lastModified = new Date().toISOString();
    
    saveSessionsToStorage();
    updateSessionsList();
}

// Update sessions list in sidebar
function updateSessionsList() {
    const sessionsList = document.getElementById('sessionsList');
    sessionsList.innerHTML = '';
    
    const sortedSessions = Object.values(savedSessions).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    sortedSessions.forEach(session => {
        const sessionItem = document.createElement('div');
        sessionItem.className = `session-item ${session.name === currentSession ? 'active' : ''}`;
        
        const completedCount = Object.keys(session.placements || {}).length;
        // Starred count is now global, not per session
        const starredCount = starredTracks.size;
        const date = new Date(session.date).toLocaleDateString();
        
        // Calculate score for this session
        let sessionScore = 0;
        for (const [trackName, placement] of Object.entries(session.placements || {})) {
            sessionScore += getPointsForPlacement(placement);
        }
        
        sessionItem.innerHTML = `
            <div class="session-item-header">
                <div class="session-name">${session.name}</div>
                <div class="session-actions-mini">
                    <button class="session-action-btn" onclick="event.stopPropagation(); renameSession('${session.name}')" title="Rename">✏️</button>
                    <button class="session-action-btn" onclick="event.stopPropagation(); exportSingleSession('${session.name}')" title="Export">💾</button>
                    <button class="session-action-btn" onclick="event.stopPropagation(); deleteSession('${session.name}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="session-stats-mini">${completedCount}/12 tracks completed | ${starredCount} favorites | Score: ${sessionScore}</div>
            <div class="session-date">Created: ${date}</div>
        `;
        
        sessionItem.onclick = () => selectSession(session.name);
        sessionsList.appendChild(sessionItem);
    });
}

// Rename session
function renameSession(sessionName) {
    const newName = prompt('Enter new session name:', sessionName);
    if (!newName || newName.trim() === '' || newName === sessionName) return;
    
    if (savedSessions[newName.trim()]) {
        alert('A session with that name already exists!');
        return;
    }
    
    // Move session data
    savedSessions[newName.trim()] = savedSessions[sessionName];
    savedSessions[newName.trim()].name = newName.trim();
    delete savedSessions[sessionName];
    
    if (currentSession === sessionName) {
        currentSession = newName.trim();
    }
    
    saveSessionsToStorage();
    updateSessionsList();
}

// Delete session
function deleteSession(sessionName) {
    if (!confirm(`Are you sure you want to delete "${sessionName}"? This action cannot be undone.`)) {
        return;
    }
    
    delete savedSessions[sessionName];
    
    if (currentSession === sessionName) {
        endSession();
    }
    
    saveSessionsToStorage();
    updateSessionsList();
}

// Export single session
function exportSingleSession(sessionName) {
    if (!savedSessions[sessionName]) return;
    
    const sessionData = {
        ...savedSessions[sessionName],
        exported: true,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(sessionData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sessionName.replace(/[^a-z0-9]/gi, '_')}_session.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Import session
function importSession() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const sessionData = JSON.parse(e.target.result);
                
                // Validate session data
                if (!sessionData.name || typeof sessionData.placements !== 'object' || typeof sessionData.notes !== 'object') {
                    throw new Error('Invalid session file format');
                }
                
                // Handle duplicate names
                let finalName = sessionData.name;
                let counter = 1;
                while (savedSessions[finalName]) {
                    finalName = `${sessionData.name} (${counter})`;
                    counter++;
                }
                
                // Add imported session
                savedSessions[finalName] = {
                    name: finalName,
                    date: sessionData.date || new Date().toISOString(),
                    placements: sessionData.placements || {},
                    notes: sessionData.notes || {},
                    // Don't import starredTracks - they are global now
                    completedTracks: sessionData.completedTracks || [],
                    imported: true
                };
                
                saveSessionsToStorage();
                updateSessionsList();
                
                alert(`Session "${finalName}" imported successfully!`);
                
            } catch (error) {
                alert('Error importing session: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Toggle session sidebar (always stay in session mode)
function toggleSessionMode() {
    const sidebar = document.getElementById('sessionSidebar');
    const sessionToggleBtn = document.getElementById('sessionToggleBtn');
    const mainContentWrapper = document.getElementById('mainContentWrapper');
    const credit = document.querySelector('.credit');
    
    // Always stay in session mode, just toggle sidebar visibility
    if (sidebar.classList.contains('active')) {
        // Close sidebar
        sidebar.classList.remove('active');
        sessionToggleBtn.classList.remove('active');
        mainContentWrapper.classList.remove('shifted');
        credit.classList.remove('shifted');
        sessionToggleBtn.textContent = 'Sessions';
        
        // Auto zoom-to-fit after sidebar closes (if auto zoom enabled)
        // Continuous zoom will handle this automatically
    } else {
        // Open sidebar
        sidebar.classList.add('active');
        sessionToggleBtn.classList.add('active');
        mainContentWrapper.classList.add('shifted');
        credit.classList.add('shifted');
        sessionToggleBtn.textContent = '←';
        
        // Load sessions if not already loaded
        if (Object.keys(savedSessions).length === 0) {
            loadSessionsFromStorage();
        } else {
            updateSessionsList();
        }
        
        // Auto zoom-to-fit after sidebar opens (if auto zoom enabled)
        // Continuous zoom will handle this automatically
    }
}

// End current session (deprecated - session mode is always on)
function endSession() {
    // This function is deprecated - session mode is always enabled
    // Just deselect current session if one is active
    if (currentSession) {
        selectSession(currentSession); // This will deselect the current session
    }
}

// Session mode track selection (single click instead of double click)
function selectPlacement(trackName, placement) {
    const previousPlacement = window.trackPlacements[trackName];
    window.trackPlacements[trackName] = placement;
    
    // Reset victory celebration tracking if changing away from 1st place
    if (previousPlacement === 1 && placement !== 1) {
        trackVictoryCelebrated.delete(trackName);
    }
    
    // Hide placement selector
    hidePlacementSelector();
    
    // Calculate and show score animation
    const points = getPointsForPlacement(placement);
    showScoreAnimation(trackName, points);
    
    // Animate score counter
    animateScoreCounter();
    
    // Victory celebration for 1st place (only if not already celebrated)
    if (placement === 1 && !trackVictoryCelebrated.has(trackName)) {
        triggerVictoryCelebration(trackName);
        trackVictoryCelebrated.add(trackName);
    }
    
    // Update only the specific track item instead of regenerating all
    updateTrackItemPlacement(trackName, placement);
    
    // Save session data
    saveCurrentSession();
    
    // Also save temp session if not in a saved session
    if (!currentSession && typeof window.saveTempSession === 'function') {
        // Update temp session with current data
        window.tempSession.placements = {...window.trackPlacements};
        window.tempSession.notes = {...window.trackNotes};
        window.tempSession.completedTracks = new Set(completedTrackNames);
        window.saveTempSession();
    }
}

// Clear placement for a track
function clearPlacement(trackName) {
    delete window.trackPlacements[trackName];
    
    // Reset victory celebration tracking for this track
    trackVictoryCelebrated.delete(trackName);
    
    // Hide placement selector
    hidePlacementSelector();
    
    // Update only the specific track item instead of regenerating all
    updateTrackItemPlacement(trackName, null);
    
    // Save session data
    saveCurrentSession();
    
    // Also save temp session if not in a saved session
    if (!currentSession && typeof window.saveTempSession === 'function') {
        // Update temp session with current data
        window.tempSession.placements = {...window.trackPlacements};
        window.tempSession.notes = {...window.trackNotes};
        window.tempSession.completedTracks = new Set(completedTrackNames);
        window.saveTempSession();
    }
}

// Victory celebration for 1st place
function triggerVictoryCelebration(trackName) {
    const trackItem = document.querySelector(`[data-track="${trackName}"]`);
    if (!trackItem) return;
    
    // Add victory classes with crown animation
    trackItem.classList.add('victory-celebration', 'victory-crown', 'crown-animate');
    
    // Create confetti
    createConfetti(trackItem);
    
    // Remove celebration classes after animation
    setTimeout(() => {
        trackItem.classList.remove('victory-celebration', 'crown-animate');
    }, 800);
    
    // Keep crown for 1st place
    // Crown will be removed when placement is changed
}

// Create confetti effect
function createConfetti(container) {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);
    
    // Create 100 confetti pieces for more celebration
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (Math.random() * 1.5 + 2.5) + 's';
        
        // Add some variety to confetti shapes
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%'; // Some circular pieces
        }
        
        confettiContainer.appendChild(confetti);
    }
    
    // Remove confetti container after animation
    setTimeout(() => {
        if (confettiContainer.parentNode) {
            confettiContainer.parentNode.removeChild(confettiContainer);
        }
    }, 5000);
}

// Show score animation popup
function showScoreAnimation(trackName, points) {
    const trackItem = document.querySelector(`[data-track="${trackName}"]`);
    if (!trackItem) return;
    
    const scorePopup = document.createElement('div');
    scorePopup.className = 'score-popup';
    scorePopup.textContent = `+${points}`;
    
    // Set color based on points (higher points = better color)
    if (points >= 12) {
        scorePopup.style.color = '#FFD700'; // Gold for high scores
        scorePopup.style.textShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
    } else if (points >= 8) {
        scorePopup.style.color = '#4CAF50'; // Green for good scores
        scorePopup.style.textShadow = '0 0 10px rgba(76, 175, 80, 0.8)';
    } else {
        scorePopup.style.color = '#2196F3'; // Blue for lower scores
        scorePopup.style.textShadow = '0 0 10px rgba(33, 150, 243, 0.8)';
    }
    
    // Position relative to the track item
    const rect = trackItem.getBoundingClientRect();
    scorePopup.style.position = 'fixed';
    scorePopup.style.left = (rect.left + rect.width / 2) + 'px';
    scorePopup.style.top = (rect.top + rect.height / 2) + 'px';
    scorePopup.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(scorePopup);
    
    // Remove after animation
    setTimeout(() => {
        if (scorePopup.parentNode) {
            scorePopup.parentNode.removeChild(scorePopup);
        }
    }, 2000);
}

// Animate score counter
function animateScoreCounter() {
    const scoreElement = document.getElementById('scoreValue');
    const scoreTextElement = document.querySelector('.session-score');
    
    if (scoreElement) {
        // Add animation class
        scoreElement.classList.add('score-counter-animate');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            scoreElement.classList.remove('score-counter-animate');
        }, 600);
    }
    
    if (scoreTextElement) {
        // Add shake animation to score text
        scoreTextElement.classList.add('score-text-shake');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            scoreTextElement.classList.remove('score-text-shake');
        }, 800);
    }
}

// Update specific track item placement without regenerating all items
function updateTrackItemPlacement(trackName, placement) {
    const trackItem = document.querySelector(`[data-track="${trackName}"]`);
    if (!trackItem) return;
    
    // Update placement button
    const placementButton = trackItem.querySelector('.placement-button');
    if (placementButton) {
        if (placement) {
            const ordinalSuffix = placement === 1 ? 'st' : placement === 2 ? 'nd' : placement === 3 ? 'rd' : 'th';
            placementButton.innerHTML = `${placement}${ordinalSuffix}`;
            placementButton.title = `${placement}${ordinalSuffix} Place`;
            
            // Set background color based on placement
            if (placement === 1) {
                placementButton.style.background = '#FFD700';
                placementButton.style.color = '#000';
            } else if (placement === 2) {
                placementButton.style.background = '#C0C0C0';
                placementButton.style.color = '#000';
            } else if (placement === 3) {
                placementButton.style.background = '#CD7F32';
                placementButton.style.color = '#fff';
            } else {
                placementButton.style.background = '#8B4513';
                placementButton.style.color = '#fff';
            }
        } else {
            placementButton.innerHTML = '🏆';
            placementButton.title = 'Set placement';
            placementButton.style.background = '';
            placementButton.style.color = '';
        }
    }
    
    // Update crown state (only add if not already present to avoid animation)
    if (placement === 1) {
        if (!trackItem.classList.contains('victory-crown')) {
            trackItem.classList.add('victory-crown');
        }
    } else {
        trackItem.classList.remove('victory-crown');
    }
    
    // Update stats
    updateStats();
}


function toggleNotes(trackName) {
    // Hide all placement selectors first
    document.querySelectorAll('.placement-selector').forEach(selector => {
        selector.style.display = 'none';
    });
    
    const notesSection = document.getElementById(`notes-${trackName.replace(/\s+/g, '-')}`);
    if (notesSection) {
        // Toggle the specific notes section
        if (notesSection.style.display === 'block') {
            // Close if already open
            notesSection.style.display = 'none';
        } else {
            // Hide all other notes sections first
            document.querySelectorAll('.notes-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show this notes section
            notesSection.style.display = 'block';
            
            // Focus on the textarea
            const textarea = notesSection.querySelector('textarea');
            if (textarea) {
                setTimeout(() => {
                    textarea.focus();
                }, 100);
            }
        }
    }
}

function showPlacementSelector(trackName) {
    // Hide all notes sections first
    document.querySelectorAll('.notes-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Hide all other placement selectors first
    document.querySelectorAll('.placement-selector').forEach(selector => {
        selector.style.display = 'none';
        selector.classList.remove('show');
    });
    
    const trackItem = document.querySelector(`[data-track="${trackName}"]`);
    const selector = document.getElementById(`placement-${trackName.replace(/\s+/g, '-')}`);
    
    if (trackItem && selector) {
        // Get track item position and size
        const trackRect = trackItem.getBoundingClientRect();
        
        // Position selector to perfectly overlap the track card
        selector.style.position = 'absolute';
        selector.style.top = '0';
        selector.style.left = '0';
        selector.style.width = '100%';
        selector.style.height = '100%';
        selector.style.transform = 'none';
        selector.style.zIndex = '1000';
        selector.style.display = 'flex';
        selector.style.visibility = 'visible';
        selector.style.opacity = '1';
        
        // Make the selector inherit the track card's position
        trackItem.style.position = 'relative';
        trackItem.appendChild(selector);
        
        // Trigger animation after display change
        setTimeout(() => {
            selector.classList.add('show');
        }, 10);
    }
}

function hidePlacementSelector() {
    // Hide all placement selectors
    document.querySelectorAll('.placement-selector').forEach(selector => {
        selector.classList.remove('show');
        selector.style.visibility = 'hidden';
        selector.style.opacity = '0';
        setTimeout(() => {
            selector.style.display = 'none';
            // Move selector back to its original position in the track grid
            const trackGrid = document.getElementById('trackGrid');
            if (trackGrid && selector.parentNode !== trackGrid) {
                trackGrid.appendChild(selector);
            }
        }, 300);
    });
}

// Add click outside to close notes and placement selectors
document.addEventListener('click', function(event) {
    // Check if the click is outside all interactive elements
    const clickedNotesSection = event.target.closest('.notes-section');
    const clickedNotesButton = event.target.closest('.notes-button');
    const clickedPlacementButton = event.target.closest('.placement-button');
    const clickedPlacementSelector = event.target.closest('.placement-selector');
    const clickedTextarea = event.target.tagName === 'TEXTAREA' && event.target.closest('.notes-section');
    const clickedSessionControlButton = event.target.closest('.session-control-button');
    const clickedTrackItem = event.target.closest('.track-item');
    
    // Close notes if clicking outside notes-related elements
    if (!clickedNotesSection && !clickedNotesButton && !clickedTextarea && !clickedSessionControlButton) {
        document.querySelectorAll('.notes-section').forEach(section => {
            section.style.display = 'none';
        });
    }
    
    // Close placement selectors if clicking outside placement-related elements
    if (!clickedPlacementSelector && !clickedPlacementButton && !clickedSessionControlButton && !clickedTrackItem) {
        hidePlacementSelector();
    }
});

// Add keyboard support for placement selection
document.addEventListener('keydown', function(event) {
    // Check if any placement selector is open
    const openSelector = document.querySelector('.placement-selector[style*="flex"]');
    if (!openSelector) return;
    
    // Get the track name from the selector ID
    const trackName = openSelector.id.replace('placement-', '').replace(/-/g, ' ');
    
    // Handle number keys 1-9 for quick selection
    if (event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        const placement = parseInt(event.key);
        selectPlacement(trackName, placement);
    }
    
    // Handle special keys for 10th, 11th, 12th place
    if (event.key === '0') {
        event.preventDefault();
        selectPlacement(trackName, 10);
    }
    
    if (event.key === '-') {
        event.preventDefault();
        selectPlacement(trackName, 11);
    }
    
    if (event.key === '=') {
        event.preventDefault();
        selectPlacement(trackName, 12);
    }
    
    // Handle Escape to close
    if (event.key === 'Escape') {
        event.preventDefault();
        openSelector.style.display = 'none';
    }
});

function updateNotes(trackName, notes) {
    window.trackNotes[trackName] = notes;
    saveCurrentSession();
    
    // Also save temp session if not in a saved session
    if (!currentSession && typeof window.saveTempSession === 'function') {
        // Update temp session with current data
        window.tempSession.placements = {...window.trackPlacements};
        window.tempSession.notes = {...window.trackNotes};
        window.tempSession.completedTracks = new Set(completedTrackNames);
        window.saveTempSession();
    }
    
    // Update the notes button appearance
    const notesButton = document.querySelector(`[data-track="${trackName}"] .notes-button`);
    if (notesButton) {
        const hasNotes = notes && notes.trim() !== '';
        if (hasNotes) {
            notesButton.classList.add('has-notes');
        } else {
            notesButton.classList.remove('has-notes');
        }
    }
}

function getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j == 1 && k != 11) return 'st';
    if (j == 2 && k != 12) return 'nd';
    if (j == 3 && k != 13) return 'rd';
    return 'th';
}

// Make function globally accessible
window.getOrdinalSuffix = getOrdinalSuffix;

// Calculate points based on placement
function getPointsForPlacement(placement) {
    if (placement === 1) return 15;
    if (placement === 2) return 12;
    // For 3rd-12th: 3rd=10, 4th=9, 5th=8, ..., 12th=1
    return 13 - placement;
}

// Calculate total score for current session
function calculateSessionScore() {
    let totalScore = 0;
    for (const [trackName, placement] of Object.entries(window.trackPlacements)) {
        totalScore += getPointsForPlacement(placement);
    }
    return totalScore;
}

// Legacy functions for compatibility
function startSession() {
    createNewSession();
}

function exportSession() {
    if (currentSession) {
        exportSingleSession(currentSession);
    } else {
        alert('No active session to export!');
    }
}

function updateSessionStats() {
    // This function is kept for compatibility but not used in the new system
}

// Calculate and display statistics
function calculateAndDisplayStats() {
    const totalSessions = Object.keys(savedSessions).length;
    let totalRaces = 0;
    let totalScore = 0;
    const trackStats = {};
    
    // Initialize track stats for all tracks
    // Get tracks from the global tracks array (defined in trackManager.js)
    const allTracks = window.tracks || [];
    allTracks.forEach(track => {
        trackStats[track.name] = {
            placements: [],
            scores: [],
            raceCount: 0
        };
    });
    
    // Process all sessions
    Object.values(savedSessions).forEach(session => {
        const sessionScore = Object.values(session.placements || {}).reduce((sum, placement) => {
            return sum + getPointsForPlacement(placement);
        }, 0);
        totalScore += sessionScore;
        
        // Process each track in this session
        Object.entries(session.placements || {}).forEach(([trackName, placement]) => {
            if (trackStats[trackName]) {
                trackStats[trackName].placements.push(placement);
                trackStats[trackName].scores.push(getPointsForPlacement(placement));
                trackStats[trackName].raceCount++;
                totalRaces++;
            }
        });
    });
    
    // Calculate overall average placement
    let allPlacements = [];
    Object.values(savedSessions).forEach(session => {
        Object.values(session.placements || {}).forEach(placement => {
            allPlacements.push(placement);
        });
    });
    const overallAvgPlacement = allPlacements.length > 0 ? 
        (allPlacements.reduce((sum, p) => sum + p, 0) / allPlacements.length).toFixed(1) : '0.0';
    
    // Update summary stats
    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('totalRaces').textContent = totalRaces;
    document.getElementById('avgScorePerSession').textContent = totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0;
    document.getElementById('overallAvgPlacement').textContent = overallAvgPlacement;
    
    // Generate track statistics
    const statsTracks = document.getElementById('statsTracks');
    statsTracks.innerHTML = '';
    
    // Sort tracks by average placement (best placement first)
    const sortedTracks = Object.entries(trackStats)
        .filter(([trackName, stats]) => stats.raceCount > 0)
        .sort((a, b) => {
            const avgPlacementA = a[1].placements.reduce((sum, p) => sum + p, 0) / a[1].placements.length;
            const avgPlacementB = b[1].placements.reduce((sum, p) => sum + p, 0) / b[1].placements.length;
            return avgPlacementA - avgPlacementB; // Lower placement number is better
        });
    
    sortedTracks.forEach(([trackName, stats]) => {
        const avgPlacement = stats.placements.reduce((sum, p) => sum + p, 0) / stats.placements.length;
        const avgScore = stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length;
        
        // Find the track image filename
        const trackData = allTracks.find(track => track.name === trackName);
        const imagePath = trackData ? `Track images and names/${trackData.filename}` : '';
        
        
        const trackStatItem = document.createElement('div');
        trackStatItem.className = 'track-stat-item';
        trackStatItem.innerHTML = `
            <div class="track-stat-name">${trackName}</div>
            <div class="track-stat-details">
                <div class="track-stat-detail">
                    <div class="track-stat-detail-label">Races</div>
                    <div class="track-stat-detail-value races">${stats.raceCount}</div>
                </div>
                <div class="track-stat-detail">
                    <div class="track-stat-detail-label">Avg Placement</div>
                    <div class="track-stat-detail-value placement">${avgPlacement.toFixed(1)}</div>
                </div>
                <div class="track-stat-detail">
                    <div class="track-stat-detail-label">Avg Score</div>
                    <div class="track-stat-detail-value score">${avgScore.toFixed(1)}</div>
                </div>
                <div class="track-stat-detail">
                    <div class="track-stat-detail-label">Best</div>
                    <div class="track-stat-detail-value placement">${Math.min(...stats.placements)}${getOrdinalSuffix(Math.min(...stats.placements))}</div>
                </div>
            </div>
        `;
        
        // Set the background image directly on the element
        if (imagePath) {
            trackStatItem.style.backgroundImage = `url("${imagePath}")`;
            trackStatItem.style.backgroundSize = 'cover';
            trackStatItem.style.backgroundPosition = 'center';
            trackStatItem.style.backgroundRepeat = 'no-repeat';
            console.log(`Setting background for ${trackName}: ${imagePath}`);
        } else {
            console.log(`No image path found for ${trackName}`);
        }
        
        statsTracks.appendChild(trackStatItem);
    });
    
    // Show message if no races recorded
    if (sortedTracks.length === 0) {
        statsTracks.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px; grid-column: 1 / -1;">No races recorded yet. Complete some tracks and save sessions to see statistics!</div>';
    }
}

// Initialize sessions on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSessionsFromStorage();
});