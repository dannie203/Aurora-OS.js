import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Desktop } from './components/Desktop';
import { MenuBar } from './components/MenuBar';
import { Dock } from './components/Dock';
import { Window } from './components/Window';
import { FileManager } from './components/FileManager';
import { NotificationCenter } from './components/NotificationCenter';
import { Settings } from './components/Settings';
import { Photos } from './components/apps/Photos';
import { Music } from './components/apps/Music';
import { Messages } from './components/apps/Messages';
import { Browser } from './components/apps/Browser';
import { Terminal } from './components/apps/Terminal';
import { PlaceholderApp } from './components/apps/PlaceholderApp';
import { AppProvider } from './components/AppContext';
import { FileSystemProvider, useFileSystem } from './components/FileSystemContext';
import { Toaster } from './components/ui/sonner';

export interface WindowState {
  id: string;
  title: string;
  content: React.ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface DesktopIcon {
  id: string;
  name: string;
  type: 'folder' | 'file';
  position: { x: number; y: number };
}

const POSITIONS_STORAGE_KEY = 'aurora-os-desktop-positions';
const LEGACY_ICONS_KEY = 'aurora-os-desktop-icons';

function loadIconPositions(): Record<string, { x: number; y: number }> {
  try {
    const stored = localStorage.getItem(POSITIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Migration from old array format
    const legacy = localStorage.getItem(LEGACY_ICONS_KEY);
    if (legacy) {
      const icons = JSON.parse(legacy);
      const positions: Record<string, { x: number; y: number }> = {};
      icons.forEach((icon: { name: string; position: { x: number; y: number } }) => {
        positions[icon.name] = icon.position;
      });
      return positions;
    }
  } catch (e) {
    console.warn('Failed to load desktop positions:', e);
  }
  return {};
}

function OS() {
  // Windows reset on refresh (not persisted)
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const topZIndexRef = useRef(100);

  // FileSystem Integration
  const { listDirectory, resolvePath, getNodeAtPath } = useFileSystem();

  // Icon Positions State
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(loadIconPositions);

  // Save positions when they change
  useEffect(() => {
    localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(iconPositions));
  }, [iconPositions]);

  // Derive desktop icons from filesystem + positions
  const desktopIcons = useMemo(() => {
    const desktopPath = resolvePath('~/Desktop');
    const files = listDirectory(desktopPath) || [];

    return files.map((file, index) => {
      const storedPos = iconPositions[file.name];
      const defaultPos = { x: 100, y: 80 + index * 120 }; // Simple vertical layout

      return {
        id: file.name, // Use filename as ID
        name: file.name,
        type: file.type === 'directory' ? 'folder' : 'file',
        position: storedPos || defaultPos,
      } as DesktopIcon;
    });
  }, [listDirectory, resolvePath, iconPositions]);

  // Ref to break circular dependency in openWindow (Terminal calling openWindow)
  const openWindowRef = useRef<(type: string, data?: { path?: string }) => void>(() => { });

  const openWindow = useCallback((type: string, data?: { path?: string }) => {
    let content: React.ReactNode;
    let title: string;

    switch (type) {
      case 'finder':
        title = 'Finder';
        content = <FileManager initialPath={data?.path} />;
        break;
      case 'settings':
        title = 'System Settings';
        content = <Settings />;
        break;
      case 'photos':
        title = 'Photos';
        content = <Photos />;
        break;
      case 'music':
        title = 'Music';
        content = <Music />;
        break;
      case 'messages':
        title = 'Messages';
        content = <Messages />;
        break;
      case 'browser':
        title = 'Browser';
        content = <Browser />;
        break;
      case 'terminal':
        title = 'Terminal';
        // Use ref to avoid circular dependency in useCallback
        content = <Terminal onLaunchApp={(id, args) => openWindowRef.current(id, { path: args?.[0] })} />;
        break;
      default:
        title = type.charAt(0).toUpperCase() + type.slice(1);
        content = <PlaceholderApp title={title} />;
    }

    setWindows(prevWindows => {
      topZIndexRef.current += 1;
      const newZIndex = topZIndexRef.current;
      const newWindow: WindowState = {
        id: `${type}-${Date.now()}`,
        title,
        content,
        isMinimized: false,
        isMaximized: false,
        position: { x: 100 + prevWindows.length * 30, y: 80 + prevWindows.length * 30 },
        size: { width: 900, height: 600 },
        zIndex: newZIndex,
      };
      return [...prevWindows, newWindow];
    });
  }, []); // Stable dependency

  // Update ref
  useEffect(() => {
    openWindowRef.current = openWindow;
  }, [openWindow]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prevWindows => prevWindows.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prevWindows => {
      const updated = prevWindows.map(w =>
        w.id === id ? { ...w, isMinimized: true } : w
      );

      const visibleWindows = updated.filter(w => !w.isMinimized);
      if (visibleWindows.length > 0) {
        const topWindow = visibleWindows.reduce((max, w) =>
          w.zIndex > max.zIndex ? w : max, visibleWindows[0]
        );
        topZIndexRef.current += 1;
        const newZIndex = topZIndexRef.current;
        return updated.map(w =>
          w.id === topWindow.id ? { ...w, zIndex: newZIndex } : w
        );
      }

      return updated;
    });
  }, []); // topZIndexRef is stable

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prevWindows => prevWindows.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows(prevWindows => {
      topZIndexRef.current += 1;
      const newZIndex = topZIndexRef.current;
      return prevWindows.map(w =>
        w.id === id ? { ...w, zIndex: newZIndex, isMinimized: false } : w
      );
    });
  }, []);

  const updateWindowState = useCallback((id: string, updates: Partial<WindowState>) => {
    setWindows(prevWindows => prevWindows.map(w =>
      w.id === id ? { ...w, ...updates } : w
    ));
  }, []);

  const updateIconPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setIconPositions(prev => ({
      ...prev,
      [id]: position
    }));
  }, []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const handleIconDoubleClick = useCallback((id: string) => {
    // Check if item is a folder to open path
    const path = resolvePath(`~/Desktop/${id}`);
    const node = getNodeAtPath(path);

    if (node?.type === 'directory') {
      openWindow('finder', { path });
    } else {
      // For now, doing nothing for files, or could open Finder at desktop
      // Future: Open file with appropriate app
    }
  }, [resolvePath, getNodeAtPath, openWindow]);

  const focusedWindowId = useMemo(() => {
    if (windows.length === 0) return null;
    return windows.reduce((max, w) => w.zIndex > max.zIndex ? w : max, windows[0]).id;
  }, [windows]);

  const focusedAppType = useMemo(() => {
    if (!focusedWindowId) return null;
    return focusedWindowId.split('-')[0];
  }, [focusedWindowId]);

  return (
    <div className="dark h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      <Desktop
        onDoubleClick={() => { }}
        icons={desktopIcons}
        onUpdateIconPosition={updateIconPosition}
        onIconDoubleClick={handleIconDoubleClick}
      />

      <MenuBar
        onNotificationsClick={toggleNotifications}
        focusedApp={focusedAppType}
      />

      <Dock
        onOpenApp={openWindow}
        onRestoreWindow={focusWindow}
        onFocusWindow={focusWindow}
        windows={windows}
      />

      {windows.map(window => (
        <Window
          key={window.id}
          window={window}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onFocus={() => focusWindow(window.id)}
          onUpdateState={(updates) => updateWindowState(window.id, updates)}
          isFocused={window.id === focusedWindowId}
        />
      ))}

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <FileSystemProvider>
        <OS />
      </FileSystemProvider>
    </AppProvider>
  );
}