import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type ThemeMode = 'neutral' | 'shades' | 'contrast';

interface AppContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  blurEnabled: boolean;
  setBlurEnabled: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
  disableShadows: boolean;
  setDisableShadows: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'aurora-os-settings';

interface StoredSettings {
  accentColor: string;
  themeMode: ThemeMode;
  blurEnabled: boolean;
  reduceMotion: boolean;
  disableShadows: boolean;
}

function loadSettings(): StoredSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  // Default settings
  return {
    accentColor: '#5755e4',
    themeMode: 'neutral',
    blurEnabled: true,
    reduceMotion: false,
    disableShadows: false,
  };
}

function saveSettings(settings: StoredSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(() => loadSettings());

  const { accentColor, themeMode, blurEnabled, reduceMotion, disableShadows } = settings;

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setAccentColor = (color: string) => setSettings(s => ({ ...s, accentColor: color }));
  const setThemeMode = (mode: ThemeMode) => setSettings(s => ({ ...s, themeMode: mode }));
  const setBlurEnabled = (enabled: boolean) => setSettings(s => ({ ...s, blurEnabled: enabled }));
  const setReduceMotion = (enabled: boolean) => setSettings(s => ({ ...s, reduceMotion: enabled }));
  const setDisableShadows = (enabled: boolean) => setSettings(s => ({ ...s, disableShadows: enabled }));

  // Sync accent color to CSS variable for global theming
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-user', accentColor);
  }, [accentColor]);

  // Sync blur state to CSS variable for opacity calculations
  useEffect(() => {
    document.documentElement.style.setProperty('--blur-enabled', blurEnabled ? '1' : '0');
  }, [blurEnabled]);

  return (
    <AppContext.Provider value={{
      accentColor,
      setAccentColor,
      themeMode,
      setThemeMode,
      blurEnabled,
      setBlurEnabled,
      reduceMotion,
      setReduceMotion,
      disableShadows,
      setDisableShadows
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

