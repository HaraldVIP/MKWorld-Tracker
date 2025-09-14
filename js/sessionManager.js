// Session mode functionality with sidebar management

// Session mode variables
let sessionMode = true;
let currentSession = null;
let sessionName = '';
let trackPlacements = {}; // Track name -> placement (1-12)
let trackNotes = {}; // Track name -> notes
let savedSessions = {}; // Session name -> session data
let sessionCounter = 1; // For default session names

// Temporary unsaved session for non-session mode
let tempSession = {
    placements: {},
    notes: {},
    completedTracks: new Set()
};

// Make variables globally accessible
window.sessionMode = sessionMode;
window.currentSession = currentSession;
window.trackPlacements = trackPlacements;
window.trackNotes = trackNotes;

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
        placements: currentSession ? {} : {...trackPlacements},
        notes: currentSession ? {} : {...trackNotes},
        completedTracks: currentSession ? new Set() : new Set(completedTrackNames)
    };
    
    // If we inherited from current UI state (no active session), reset UI to empty state
    if (!currentSession) {
        // Reset the current UI state to empty
        trackPlacements = {};
        trackNotes = {};
        window.trackPlacements = trackPlacements;
        window.trackNotes = trackNotes;
        completedTrackNames = new Set();
        completedTracks = 0;
        
        // Create new empty temp session
        tempSession = {
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
        
        trackPlacements = {...tempSession.placements};
        trackNotes = {...tempSession.notes};
        window.trackPlacements = trackPlacements;
        window.trackNotes = trackNotes;
        
        // Keep starredTracks global - don't load from temp session
        completedTrackNames = new Set(tempSession.completedTracks);
        completedTracks = completedTrackNames.size;
        
        // Update UI
        updateSessionsList();
        generateTrackItems();
        return;
    }
    
    // If no session was active, save current state to temp session
    if (!currentSession) {
        tempSession.placements = {...trackPlacements};
        tempSession.notes = {...trackNotes};
        // Don't save starredTracks to temp session - they are global
        tempSession.completedTracks = new Set(completedTrackNames);
    } else {
        // Save current session before switching
        saveCurrentSession();
    }
    
    const sessionData = savedSessions[sessionName];
    currentSession = sessionName;
    window.currentSession = currentSession;
    
    // Load session data
    trackPlacements = sessionData.placements || {};
    trackNotes = sessionData.notes || {};
    window.trackPlacements = trackPlacements;
    window.trackNotes = trackNotes;
    
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
    
    savedSessions[currentSession].placements = {...trackPlacements};
    savedSessions[currentSession].notes = {...trackNotes};
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
            <div class="session-stats-mini">${completedCount}/30 tracks completed | ${starredCount} favorites | Score: ${sessionScore}</div>
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
    trackPlacements[trackName] = placement;
    window.trackPlacements = trackPlacements;
    
    // Hide placement selector
    const selector = document.getElementById(`placement-${trackName.replace(/\s+/g, '-')}`);
    if (selector) {
        selector.style.display = 'none';
    }
    
    // Regenerate track items to update the placement button color and text
    generateTrackItems();
    
    // Save session data
    saveCurrentSession();
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
    });
    
    const selector = document.getElementById(`placement-${trackName.replace(/\s+/g, '-')}`);
    if (selector) {
        selector.style.display = 'flex';
    }
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
    
    // Close notes if clicking outside notes-related elements
    if (!clickedNotesSection && !clickedNotesButton && !clickedTextarea && !clickedSessionControlButton) {
        document.querySelectorAll('.notes-section').forEach(section => {
            section.style.display = 'none';
        });
    }
    
    // Close placement selectors if clicking outside placement-related elements
    if (!clickedPlacementSelector && !clickedPlacementButton && !clickedSessionControlButton) {
        document.querySelectorAll('.placement-selector').forEach(selector => {
            selector.style.display = 'none';
        });
    }
});

function updateNotes(trackName, notes) {
    trackNotes[trackName] = notes;
    window.trackNotes = trackNotes;
    saveCurrentSession();
    
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
    for (const [trackName, placement] of Object.entries(trackPlacements)) {
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