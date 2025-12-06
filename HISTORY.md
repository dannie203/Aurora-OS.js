# Version History

## v0.6.2
- **Settings Grid Layouts**: Standardized grids in Appearance, Theme Mode, and Theme sections with fixed aspect ratios (1:1 and 16:9) for consistent responsive design.
- **Theme Enhancements**: Implemented dynamic gradients for Theme Mode cards (Neutral/Contrast) and introduced a diverse "2025" Color Palette.
- **Dynamic Versioning**: "About" tab now displays the live application version from package.json.
- **Default Preferences**: Updated default accent color to Indigo (#5755e4) and fixed compatibility with HTML color inputs.

## v0.6.1
- **Desktop Mirroring**: Live synchronization between `~/Desktop` directory and the Desktop UI.
- **Terminal App Launch**: Launch apps (Finder, Browser, etc.) via Terminal with argument support (`Finder /home`).
- **Terminal Enhancements**: Fixed path resolution (`mkdir`, `touch`), added Tab autocomplete, and PATH scanning.
- **Settings**: Added "Danger Zone" with Soft Reset and Hard Reset options.

## v0.6.0
- **Virtual Filesystem**: Linux-inspired filesystem with `/bin`, `/etc`, `/home`, `/var`, and more.
- **Terminal Integration**: Full command-line interface (`ls`, `cd`, `cat`, `mkdir`, `rm`, `whoami`, `hostname`) connected to virtual filesystem.
- **Persistence Layer**: Settings, desktop icons, filesystem, and app states saved to localStorage.
- **App Storage Hook**: New `useAppStorage` hook enabling all apps to persist their state.
- **Window Improvements**: State preservation on minimize/restore, smooth dock-directed animations, auto-focus on next window.
- **Independent Windows**: Multiple Finder/Terminal windows now have independent navigation state.

## v0.5.2
- **Tech Stack Overhaul**: Upgraded to React 19, Vite 7, and Recharts 3.
- **CI/CD**: Added GitHub Actions workflow for automated testing.
- **Code Quality**: Implemented ESLint and fixed code consistency issues.

## v0.5.1
- **Native App Support**: Packaged with Electron for Windows.
- **Window Frame Option**: Added `--frame` flag / `WINDOW_FRAME` env var for native window management.
- **Performance**: Added "Reduce Motion" and "Disable Shadows" settings affecting all system components.
- **Applet Optimizations**: Notification Center and Desktop now respect performance settings.

## v0.5.0
- Renamed to Aurora OS.js.
- Implemented Radix UI Checkbox for settings.
- Fixed visual inconsistencies in Switch component.
- Improved window management and dock behavior.
- Refactored multiple apps for consistency.

