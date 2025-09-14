# MKWorld Tracker

A modern, feature-rich web application for tracking Mario Kart Wii (MKW) race sessions. Perfect for competitive players, streamers, and anyone who wants to keep detailed records of their racing sessions.

![MKWorld Tracker](https://img.shields.io/badge/MKWorld-Tracker-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)

## ✨ Features

### 🎯 Core Functionality
- **Track Management**: All 30 Mario Kart Wii tracks with high-quality images
- **Session Tracking**: Create and manage multiple racing sessions
- **Global Favorites**: Star tracks you love - favorites persist across all sessions
- **Smart Zoom**: Automatically keeps tracks as large as possible without scrollbars
- **Responsive Design**: Works perfectly on desktop and mobile devices

### 📊 Session Features
- **Placement Tracking**: Record 1st-12th place finishes for each track
- **Score Calculation**: Automatic scoring system (1st=15pts, 2nd=12pts, etc.)
- **Notes System**: Add detailed notes about each race
- **Import/Export**: Share sessions with other players
- **Session Statistics**: Track completion rates and scores

### 🎨 User Experience
- **Dark/Light Themes**: Switch between themes with one click
- **Keyboard Shortcuts**: Press 'F' while hovering to favorite tracks
- **Discord Integration**: Copy track codes for Discord sharing
- **Auto-Save**: All data is automatically saved to your browser
- **Help System**: Built-in help modal with usage instructions

## 🚀 Getting Started

### Option 1: Use Online (Recommended)
1. Visit the live version at [MKWorldTracker.com](https://mkworldtracker.com) or [GitHub Pages](https://haraldvip.github.io/MKWorld-Tracker)
2. Start tracking immediately - no installation required!

### Option 2: Run Locally
1. Clone this repository:
   ```bash
   git clone https://github.com/HaraldVIP/MKWorld-Tracker.git
   cd MKWorld-Tracker
   ```
2. Open `index.html` in your web browser
3. Start tracking your sessions!

## 📖 How to Use

### Basic Usage
1. **Complete Tracks**: Click on any track to mark it as completed/incomplete
2. **Favorite Tracks**: Hover over a track and press the 'F' key to favorite it
3. **Create Sessions**: Click "Sessions" to open the sidebar and create new sessions
4. **Set Placements**: For completed tracks, click the trophy button to set your placement
5. **Add Notes**: Click the notes button to add details about each race

### Session Management
- **Create Session**: Enter a name and click "Create Session"
- **Switch Sessions**: Click on any session in the list to switch to it
- **Import Sessions**: Use the blue "Import Session" button to load saved files
- **Export Sessions**: Click the export button on any session to save it

### Advanced Features
- **Sort Tracks**: Use A-Z or Favorited sorting options
- **Discord Export**: Copy track codes for sharing in Discord
- **Theme Switching**: Toggle between dark and light modes
- **Help**: Click the ❓ button for detailed instructions

## 🎮 Session Mode Features

### Placement System
- **1st Place**: 15 points (Gold)
- **2nd Place**: 12 points (Silver)  
- **3rd Place**: 10 points (Bronze)
- **4th-12th Place**: 9-1 points (Brown)

### Notes System
- Add detailed notes about each race
- Notes are saved per session
- Click the 📝 button on completed tracks

### Score Tracking
- Real-time score calculation
- Session statistics display
- Progress tracking (X/12 tracks completed)

## 🛠️ Technical Details

### Built With
- **HTML5**: Semantic markup and modern features
- **CSS3**: Custom properties, flexbox, and grid layouts
- **Vanilla JavaScript**: No frameworks, pure performance
- **Local Storage**: Client-side data persistence

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### File Structure
```
MKWorld-Tracker/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css          # Main styles
│   └── themes.css          # Theme-specific styles
├── js/
│   ├── main.js             # Application initialization
│   ├── dataStorage.js      # Data persistence
│   ├── trackManager.js     # Track management
│   ├── sessionManager.js   # Session system
│   └── uiControls.js       # UI interactions
├── Track images and names/ # Track images
└── README.md               # This file
```

## 🎨 Customization

### Adding New Tracks
1. Add track image to `Track images and names/` folder
2. Update the `tracks` array in `js/trackManager.js`
3. Add Discord code to `discordTrackCodes` object

### Styling
- Modify CSS custom properties in `:root` for global changes
- Theme-specific styles are in `css/themes.css`
- Responsive breakpoints can be adjusted in `css/styles.css`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mario Kart Wii** - Nintendo for creating an amazing racing game
- **Track Images** - Community-sourced high-quality track images
- **Discord Community** - For feedback and feature requests

## 📞 Support

If you encounter any issues or have questions:
1. Check the built-in help system (❓ button)
2. Open an issue on GitHub
3. Contact the maintainer

---

**Made with ❤️ for the Mario Kart Wii community**

*Happy racing! 🏁*