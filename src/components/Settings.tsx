import { Palette, Monitor, Bell, Shield, Wifi, User, HardDrive, Zap, Info, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useAppContext } from './AppContext';
import { Checkbox } from './ui/checkbox';
import { AppTemplate } from './apps/AppTemplate';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { softReset, hardReset, getStorageStats, formatBytes } from '../utils/memory';
import { getComplementaryColor } from '../utils/colors';
import pkg from '../../package.json';

const settingsSidebar = {
  sections: [
    {
      title: 'System',
      items: [
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'performance', label: 'Performance', icon: Zap },
        { id: 'displays', label: 'Displays', icon: Monitor },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'network', label: 'Network', icon: Wifi },
        { id: 'security', label: 'Security & Privacy', icon: Shield },
        { id: 'users', label: 'Users & Groups', icon: User },
        { id: 'storage', label: 'Storage', icon: HardDrive },
      ]
    },
    {
      title: 'General',
      items: [
        { id: 'about', label: 'About', icon: Info },
      ]
    }
  ]
};

const presetColors = [
  { name: 'Carbon', value: '#52525b' },   // Zinc-600 (Modern Neutral)
  { name: 'Crimson', value: '#e11d48' },  // Rose-600 (Vibrant Red)
  { name: 'Amber', value: '#f59e0b' },    // Amber-500 (Warm Gold)
  { name: 'Emerald', value: '#10b981' },  // Emerald-500 (Crisp Green)
  { name: 'Azure', value: '#3b82f6' },    // Blue-500 (Classic Tech Blue)
  { name: 'Indigo', value: '#5755e4' },   // Indigo-500 (Deep Modern Blue)
  { name: 'Violet', value: '#8b5cf6' },   // Violet-500 (Bright Purple)
  { name: 'Fuchsia', value: '#d946ef' },  // Fuchsia-500 (Neon Pink)
];

export function Settings() {
  const [activeSection, setActiveSection] = useState('appearance');
  const {
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
  } = useAppContext();
  const [customColor, setCustomColor] = useState(accentColor);

  // About section state
  const storageStats = useMemo(() => {
    return activeSection === 'about' ? getStorageStats() : {
      softMemory: { keys: 0, bytes: 0 },
      hardMemory: { keys: 0, bytes: 0 },
      total: { keys: 0, bytes: 0 }
    };
  }, [activeSection]);

  const [showSoftConfirm, setShowSoftConfirm] = useState(false);
  const [showHardConfirm, setShowHardConfirm] = useState(false);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomColor(value);
    setAccentColor(value);
  };

  const content = (
    <div className="p-8 max-w-3xl">
      {activeSection === 'appearance' && (
        <div>
          <h2 className="text-2xl text-white mb-6">Appearance</h2>

          {/* Accent Color Section */}
          <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
            <h3 className="text-lg text-white mb-4">Accent Color</h3>
            <p className="text-sm text-white/60 mb-6">
              Choose an accent color to personalize your desktop experience
            </p>

            {/* Preset Colors */}
            <div className="mb-6">
              <label className="text-sm text-white/80 mb-3 block">Preset Colors</label>
              <div className="grid grid-cols-4 gap-3">
                {presetColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setAccentColor(color.value);
                      setCustomColor(color.value);
                    }}
                    className={`relative w-full aspect-square rounded-lg transition-all ${accentColor === color.value
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800/40'
                      : 'hover:scale-105'
                      }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {accentColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color */}
            <div>
              <label className="text-sm text-white/80 mb-3 block">Custom Color</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="color"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    className="w-16 h-16 rounded-lg cursor-pointer border-none"
                    style={{ padding: 0, background: customColor }}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomColor(value);
                      if (/^#[0-9A-F]{6}$/i.test(value)) {
                        setAccentColor(value);
                      }
                    }}
                    placeholder="#3b82f6"
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    Enter a hex color code (e.g., #3b82f6)
                  </p>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <label className="text-sm text-white/80 mb-3 block">Preview</label>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded-lg text-white transition-all w-1/2 aspect-[3/1] flex items-center justify-center"
                  style={{ backgroundColor: accentColor }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded-lg transition-all border-2 w-1/2 aspect-[3/1] flex items-center justify-center"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  Outlined Button
                </button>
              </div>
            </div>
          </div>

          {/* Theme Mode Section */}
          <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
            <h3 className="text-lg text-white mb-4">Theme Mode</h3>
            <p className="text-sm text-white/60 mb-6">
              Choose how the accent color affects background tints
            </p>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setThemeMode('neutral')}
                className={`p-4 rounded-lg border-2 transition-all h-full flex flex-col ${themeMode === 'neutral'
                  ? 'border-white/30 bg-white/10'
                  : 'border-white/10 hover:border-white/20 bg-black/20'
                  }`}
              >
                <div
                  className="w-full rounded mb-3 border border-white/10 shrink-0"
                  style={{
                    aspectRatio: '1/1',
                    background: `linear-gradient(to bottom right, ${accentColor}20, #1f2937)`
                  }}
                />
                <div className="text-white text-sm font-medium mb-1">Neutral</div>
                <div className="text-white/50 text-xs text-left">Natural grays only</div>
              </button>

              <button
                onClick={() => setThemeMode('shades')}
                className={`p-4 rounded-lg border-2 transition-all h-full flex flex-col ${themeMode === 'shades'
                  ? 'border-white/30 bg-white/10'
                  : 'border-white/10 hover:border-white/20 bg-black/20'
                  }`}
              >
                <div
                  className="w-full rounded mb-3 border border-white/10 shrink-0"
                  style={{
                    aspectRatio: '1/1',
                    background: `linear-gradient(to bottom right, ${accentColor}40, ${accentColor}80)`
                  }}
                />
                <div className="text-white text-sm font-medium mb-1">Shades</div>
                <div className="text-white/50 text-xs text-left">Accent color tints</div>
              </button>

              <button
                onClick={() => setThemeMode('contrast')}
                className={`p-4 rounded-lg border-2 transition-all h-full flex flex-col ${themeMode === 'contrast'
                  ? 'border-white/30 bg-white/10'
                  : 'border-white/10 hover:border-white/20 bg-black/20'
                  }`}
              >
                <div
                  className="w-full rounded mb-3 border border-white/10 shrink-0"
                  style={{
                    aspectRatio: '1/1',
                    background: `linear-gradient(to bottom right, ${accentColor}, ${getComplementaryColor(accentColor)})`
                  }}
                />
                <div className="text-white text-sm font-medium mb-1">Contrast</div>
                <div className="text-white/50 text-xs text-left">Complementary colors</div>
              </button>
            </div>
          </div>



          {/* Theme Section */}
          <div className="bg-black/20 rounded-xl p-6 border border-white/5">
            <h3 className="text-lg text-white mb-4">Theme</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-lg bg-gray-900/50 border-2 border-white/20 hover:border-white/40 transition-all text-left group flex flex-col h-full">
                <div
                  className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded mb-3 shrink-0"
                  style={{ aspectRatio: '16/9' }}
                />
                <span className="text-white text-sm">Dark</span>
              </button>
              <button className="p-4 rounded-lg bg-black/20 border border-white/10 hover:border-white/20 transition-all opacity-50 cursor-not-allowed text-left flex flex-col h-full">
                <div
                  className="w-full bg-gradient-to-br from-gray-100 to-gray-300 rounded mb-3 shrink-0"
                  style={{ aspectRatio: '16/9' }}
                />
                <span className="text-white/60 text-sm">Light (Coming Soon)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'performance' && (
        <div>
          <h2 className="text-2xl text-white mb-6">Performance</h2>

          {/* Blur & Transparency Toggle */}
          <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-white mb-1">Blur & Transparency</h3>
                <p className="text-sm text-white/60">
                  Enable glass blur effect and window transparency
                </p>
              </div>
              <Checkbox
                checked={blurEnabled}
                onCheckedChange={(checked) => setBlurEnabled(checked === true)}
              />
            </div>
          </div>

          {/* Reduce Motion Toggle */}
          <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-white mb-1">Reduce Motion</h3>
                <p className="text-sm text-white/60">
                  Disable animations for faster response and accessibility
                </p>
              </div>
              <Checkbox
                checked={reduceMotion}
                onCheckedChange={(checked) => setReduceMotion(checked === true)}
              />
            </div>
          </div>

          {/* Disable Shadows Toggle */}
          <div className="bg-black/20 rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-white mb-1">Disable Shadows</h3>
                <p className="text-sm text-white/60">
                  Remove window shadows to improve rendering performance
                </p>
              </div>
              <Checkbox
                checked={disableShadows}
                onCheckedChange={(checked) => setDisableShadows(checked === true)}
              />
            </div>
          </div>
        </div>
      )}

      {activeSection === 'displays' && (
        <div>
          <h2 className="text-2xl text-white mb-6">Displays</h2>
          <div className="bg-black/20 rounded-xl p-6 border border-white/5">
            <p className="text-white/60">Display settings coming soon...</p>
          </div>
        </div>
      )}

      {activeSection === 'notifications' && (
        <div>
          <h2 className="text-2xl text-white mb-6">Notifications</h2>
          <div className="bg-black/20 rounded-xl p-6 border border-white/5">
            <p className="text-white/60">Notification settings coming soon...</p>
          </div>
        </div>
      )}

      {activeSection === 'network' && (
        <div>
          <h2 className="text-2xl text-white mb-6">Network</h2>
          <div className="bg-black/20 rounded-xl p-6 border border-white/5">
            <p className="text-white/60">Network settings coming soon...</p>
          </div>
        </div>
      )}

      {activeSection === 'security' && (
        <div>
          <h2 className="text-2xl text-white mb-6">Security & Privacy</h2>
          <div className="bg-black/20 rounded-xl p-6 border border-white/5">
            <p className="text-white/60">Security settings coming soon...</p>
          </div>
        </div>
      )}

      {activeSection === 'users' && (
        <div>
          <h2 className="text-2xl text-white mb-6">Users & Groups</h2>
          <div className="bg-black/20 rounded-xl p-6 border border-white/5">
            <p className="text-white/60">User settings coming soon...</p>
          </div>
        </div>
      )}

      {activeSection === 'storage' && (
        <div>
          <h2 className="text-2xl text-white mb-6">Storage</h2>
          <div className="bg-black/20 rounded-xl p-6 border border-white/5">
            <p className="text-white/60">Storage settings coming soon...</p>
          </div>
        </div>
      )}

      {activeSection === 'about' && (
        <div>
          <h2 className="text-2xl text-white mb-6">About Aurora OS</h2>

          {/* System Info */}
          <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
            <h3 className="text-lg text-white mb-4">System Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Version</span>
                <span className="text-white">{pkg.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Build</span>
                <span className="text-white">React 19 + Vite 7</span>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-black/20 rounded-xl p-6 mb-6 border border-white/5">
            <h3 className="text-lg text-white mb-4">Memory Usage</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Preferences (Soft Memory)</span>
                <span className="text-white">{formatBytes(storageStats.softMemory.bytes)} ({storageStats.softMemory.keys} items)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Filesystem (Hard Memory)</span>
                <span className="text-white">{formatBytes(storageStats.hardMemory.bytes)} ({storageStats.hardMemory.keys} items)</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3">
                <span className="text-white/80 font-medium">Total</span>
                <span className="text-white font-medium">{formatBytes(storageStats.total.bytes)}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone Accordion */}
          <Accordion type="single" collapsible className="bg-black/20 rounded-xl border border-red-500/30 overflow-hidden">
            <AccordionItem value="danger-zone" className="border-none">
              <AccordionTrigger className="w-full !px-6 py-4 text-red-400 hover:no-underline hover:text-red-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-lg font-medium">Danger Zone</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="!px-6 pb-6">
                <div className="space-y-6">
                  {/* Soft Reset */}
                  <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-5 h-5 text-white" />
                      <h4 className="text-white font-medium">Soft Reset</h4>
                    </div>
                    <p className="text-sm text-white/60 mb-4">
                      Resets preferences, theme settings, desktop icon positions, and app states.
                      Your files and folders will be preserved.
                    </p>
                    <div className="flex gap-2">
                      {!showSoftConfirm ? (
                        <button
                          onClick={() => setShowSoftConfirm(true)}
                          className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90"
                          style={{ backgroundColor: accentColor }}
                        >
                          Reset Preferences
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setShowSoftConfirm(false)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              softReset();
                              setShowSoftConfirm(false);
                              window.location.reload();
                            }}
                            className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90"
                            style={{ backgroundColor: accentColor }}
                          >
                            Confirm Reset
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Hard Reset */}
                  <div className="bg-black/30 rounded-lg p-4 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Trash2 className="w-5 h-5 text-red-500" />
                      <h4 className="text-white font-medium">Hard Reset</h4>
                    </div>
                    <p className="text-sm text-white/60 mb-2">
                      Completely wipes all data including files, folders, and settings.
                      This action cannot be undone.
                    </p>
                    <p className="text-sm text-red-400 mb-4">
                      ⚠️ All custom files and folders will be permanently deleted
                    </p>
                    <div className="flex gap-2">
                      {!showHardConfirm ? (
                        <button
                          onClick={() => setShowHardConfirm(true)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                        >
                          Factory Reset
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setShowHardConfirm(false)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              hardReset();
                              setShowHardConfirm(false);
                              window.location.reload();
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                          >
                            Yes, Delete Everything
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );

  return (
    <AppTemplate
      sidebar={settingsSidebar}
      content={content}
      activeItem={activeSection}
      onItemClick={setActiveSection}
    />
  );
}