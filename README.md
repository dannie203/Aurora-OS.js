# Aurora OS.js [![Version](https://img.shields.io/badge/Version-v0.7.3--textPatch-blue)](https://github.com/mental-os/Aurora-OS.js) [![GitHub Pages](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/deploy.yml) [![Dependabot](https://github.com/mental-os/Aurora-OS.js/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/dependabot/dependabot-updates) [![Build](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml/badge.svg)](https://github.com/mental-os/Aurora-OS.js/actions/workflows/ci.yml)

A modern, web-based desktop operating system interface built with React, Tailwind CSS, and Radix UI.

## Features

- **Project Integrity**: Built-in identity validation ("Safe Mode" degradation on tampering) and hidden attribution ("Insurance Policy").
- **Desktop Environment**: Windows 11-inspired grid layout, multi-select drag-and-drop, and fluid window management with snap-like behavior.
- **Window Management**: Minimize, maximize, close, and focus management with preserved state and independent navigation.
- **Virtual Filesystem**: Complete in-memory Linux-style filesystem (`/bin`, `/etc`, `/home`, etc.) with permissions (Owner/Group/Others, Sticky Bit) and persistent storage.
- **User Management**: Multi-user support with bidirectional `/etc/passwd` syncing and dedicated Settings panel.
- **App Ecosystem**:
  - **Finder**: Full-featured file manager with breadcrumbs navigation, drag-and-drop file moving, and list/grid views.
  - **Terminal**: Zsh-like experience with autocomplete, command history, pipe support, stealth commands, and ability to launch GUI apps (`Finder /home`).
  - **Settings**: System control panel for Appearance (Accent Colors, Themes), Performance (Motion/Shadows), and Data Management (Soft/Hard Reset).
  - **Browser**: Functional web browser simulation with bookmarks, history, and tab management.
  - **Media**: Interactive Music, Messages, and Photos apps demonstrating UI patterns.
- **Security & Performance**:
  - **Content Security Policy**: Strict CSP preventing XSS and `eval` execution in production.
  - **Debounced Persistence**: Efficiently saves state to localStorage without UI freezing.
  - **Native Integration**: Electron support with native window frame options and shell integration.
- **Customization**:
  - **Theming**: "2025" Color Palette with dynamic Neutral, Shades, and Contrast modes.
  - **Accessibility**: Reduce Motion and Disable Shadows options for lower-end devices.

## Tech Stack

- **Framework**: React 19 (Vite 7)
- **Styling**: Tailwind CSS v4
- **UI Primitives**: Radix UI
- **Icons**: Lucide React
- **Animation**: Motion (Framer Motion)
- **Audio**: Howler.js
- **Charts**: Recharts
- **Components**: Sonner (Toasts), Vaul (Drawers), CMDK, React Day Picker
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
 
### v0.7.3-textPatch
- **The New Notepad Pro**:
    - **Multi-Tab Interface**: A productive, tabbed editing environment with unique session persistence per user.
    - **Dual-Mode Editing**: Seamless support for both Plain Text (`.txt`) and Markdown (`.md`) with a live, high-performance Preview mode.
    - **Premium Aesthetics**: Featuring accent-themed syntax highlighting, glassmorphism toolbar, and custom-styled Markdown rendering (headings, code blocks, blockquotes).
    - **Deep OS Integration**: Direct file association with Finder/Desktop, integrated `FilePicker` with permission enforcement, and unsaved changes interception system.
    - **Auto-Save & Persistence**: Debounced state synchronization to `localStorage`, ensuring tabs are preserved across refreshes but securely cleared on Log Off.
 - **Dependabot Integration**:
     - **Security & Stability**: Merged and verified updates for `jsdom`, `lucide-react`, `react-hook-form`, `@types/node`, and `typescript-eslint`.
     - **Strict Lint Compliance**: Refactored the codebase to satisfy new ESLint rules, resolving high-impact warnings like `cascading renders` and `impure functions`.
 - **Technical Fixes**:
     - **Cascading Render Fix**: Implemented a robust `useRef` + `setTimeout` strategy for the `useEffect` hooks in Notepad to prevent performance-degrading synchronous state updates.
     - **Logic Restoration**: Repaired accidental file corruption in `Notepad.tsx`, restoring all critical imports and state management logic.

[View to-do list](TO-DO.md)

[View full version history](HISTORY.md)

# License & Others

- **Licensed as**: [AGPL-3.0e](LICENSE)
- **Open-source code**: [OPEN-SOURCE.md](OPEN-SOURCE.md)
- **AI Disclosure**: This project, "Aurora OS," is human-written, with AI tools assisting in documentation, GitHub integrations, bug testing, and roadmap tracking. As soon as this project is ready for release, all the AI tools will be removed and the generated content (audio, images, etc.) will be human-created.

# Community
Soon
