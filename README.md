# Aurora OS.js [![Version](https://img.shields.io/badge/version-v0.6.1-blue)](https://github.com/mental-os/Aurora-OS.js) [![Deploy Web OS](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml) [![Dependabot](https://github.com/mental-os/Aurora-OS.js/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/dependabot/dependabot-updates) [![Build](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml)

A modern, web-based desktop operating system interface built with React, Tailwind CSS, and Radix UI.

## Features

- **Desktop Environment**: Fully functional desktop with draggable windows, dock, and menu bar.
- **Window Management**: Minimize, maximize, close, and focus management with smooth animations.
- **Virtual Filesystem**: Linux-inspired filesystem (`/bin`, `/etc`, `/home`, etc.) with persistence.
- **App Ecosystem**:
  - **Finder**: File system navigation and management.
  - **Terminal**: Linux-style command line with `ls`, `cd`, `pwd`, `cat`, `mkdir`, `rm`, and launching apps from CLI.
  - **Settings**: System configuration (Appearance, Accent Colors, Blur effects, Performance).
  - **Music, Messages, Photos**: Interactive media and communication apps.
- **Persistence**:
  - **Settings**: Colors, themes, and performance preferences saved across sessions.
  - **Filesystem**: All files and directories persist to localStorage.
  - **Desktop Icons**: Icon positions are remembered.
  - **App State**: Individual apps remember their state (sidebar, volume, etc.).
- **Customization**:
  - **Dark/Light Mode**: System-wide theme switching.
  - **Accent Colors**: Dynamic system accent colors with "2025" palette.
  - **Blur & Transparency**: Toggleable glassmorphism effects.

## Tech Stack

- **Framework**: React 19 (Vite 7)
- **Styling**: Tailwind CSS
- **UI Primitives**: Radix UI
- **Icons**: Lucide React
- **Animation**: Motion (Framer Motion)
- **Testing**: Vitest

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```

### Testing
This project uses **Vitest** for unit & integration testing.
```bash
npm test
```

## Release Notes

## v0.6.2
- **Settings Grid Layouts**: Standardized grids in Appearance, Theme Mode, and Theme sections with fixed aspect ratios (1:1 and 16:9) for consistent responsive design.
- **Theme Enhancements**: Implemented dynamic gradients for Theme Mode cards (Neutral/Contrast) and introduced a diverse "2025" Color Palette.
- **Dynamic Versioning**: "About" tab now displays the live application version from package.json.
- **Default Preferences**: Updated default accent color to Indigo (#5755e4) and fixed compatibility with HTML color inputs.

[View full version history](HISTORY.md)

## License

Not yet available

## AI disclosure

"Aurora OS" is a human-writen project that makes use of AI-powered IDE's to generate documentation, GitHub integrations, bug testing, and roadmap tracking.
