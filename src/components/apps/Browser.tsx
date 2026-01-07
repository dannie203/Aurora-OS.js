import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Home, Star, Lock, AlertTriangle, X, Plus } from 'lucide-react';
import { AppTemplate } from './AppTemplate';
import { useAppStorage } from '../../hooks/useAppStorage';
import { cn } from '../ui/utils';
import { useI18n } from '../../i18n/index';
import { getWebsiteByDomain } from '../websites/registry';
import type { HistoryEntry } from '../websites/types';

interface Tab {
  id: string;
  url: string;
  renderedUrl: string;
  title: string;
  isLoading: boolean;
  progress: number;
  history: HistoryEntry[];
  historyIndex: number;
}

export function Browser({ owner }: { owner?: string }) {
  const { t } = useI18n();

  // Persisted state
  const [appState, setAppState] = useAppStorage('browser', {
    url: 'browser://welcome',
    bookmarks: [] as string[],
    history: [] as HistoryEntry[],
  }, owner);

  // Tabs State
  const [tabs, setTabs] = useState<Tab[]>([{
    id: 'default',
    url: appState.url,
    renderedUrl: appState.url,
    title: 'Welcome',
    isLoading: false,
    progress: 0,
    history: appState.history || [],
    historyIndex: (appState.history?.length || 1) - 1
  }]);

  const [activeTabId, setActiveTabId] = useState<string>('default');
  const [urlInput, setUrlInput] = useState(appState.url);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    setUrlInput(activeTab.url);
  }, [activeTab.url, activeTabId]);

  // Sync Active Tab to AppState (Persistence)
  useEffect(() => {
    if (activeTab) {
      setAppState(prev => ({
        ...prev,
        url: activeTab.renderedUrl,
        history: activeTab.history
      }));
    }
  }, [activeTab?.renderedUrl, activeTab?.history]);

  const getActiveWebsite = () => {
    // We show content based on RENDERED url, not the input URL
    const [urlPath] = activeTab.renderedUrl.split('?');
    return getWebsiteByDomain(urlPath);
  };

  const currentWebsite = getActiveWebsite();

  // Tab Management
  const addTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      url: 'browser://welcome',
      renderedUrl: 'browser://welcome',
      title: 'New Tab',
      isLoading: false,
      progress: 0,
      history: [],
      historyIndex: -1
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      navigate('browser://welcome');
      return;
    }

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    if (tabId === activeTabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const navigate = (url: string) => {
    const website = getWebsiteByDomain(url);
    const finalUrl = website ? website.domain : url;

    // 1. Update Tab State to "Loading"
    setTabs(prev => prev.map(t => {
      if (t.id !== activeTabId) return t;
      return { ...t, url: finalUrl, isLoading: true, progress: 5 };
    }));

    let currentProgress = 5;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      
      if (currentProgress >= 75) {
        clearInterval(interval);
        updateTabProgress(activeTabId, 75);
        
        setTimeout(() => {
          updateTabProgress(activeTabId, 100);
          
          setTimeout(() => {
            finishNavigation(activeTabId, finalUrl, website);
          }, 200);
        }, 600);
      } else {
        updateTabProgress(activeTabId, currentProgress);
      }
    }, 50);
  };

  const updateTabProgress = (tabId: string, progress: number) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, progress } : t));
  };

  const finishNavigation = (tabId: string, url: string, website: any) => {
    setTabs(prev => prev.map(t => {
      if (t.id !== tabId) return t;

      const newHistoryEntry: HistoryEntry = {
        url,
        title: website?.name || url,
        timestamp: new Date(),
        favicon: website?.color,
      };

      // If we are essentially reloading the same page, don't spam history? 
      // For now, standard browser behavior pushes mostly everything.
      const newHistory = [...t.history.slice(0, t.historyIndex + 1), newHistoryEntry];

      return {
        ...t,
        isLoading: false,
        progress: 0,
        renderedUrl: url,
        title: website?.name || url,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    }));
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      navigate(urlInput.trim());
    }
  };

  const reload = () => navigate(activeTab.renderedUrl);
  const goHome = () => navigate('browser://welcome');
  
  const goBack = () => {
    if (activeTab.historyIndex > 0) {
      const prevEntry = activeTab.history[activeTab.historyIndex - 1];
      // We skip the full loading sim for history usually, but let's keep it for effect
      // Or just jump straight to it. Let's do a fast load.
      navigate(prevEntry.url); 
      // Note: Real back button implementation is complex with the history stack, 
      // for this sim, simply navigating to the URL is "good enough" visually.
    }
  };

  const goForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const nextEntry = activeTab.history[activeTab.historyIndex + 1];
      navigate(nextEntry.url);
    }
  };

  // Render Helpers
  const getSecurityIcon = () => {
    if (!currentWebsite) return <Lock className="w-3.5 h-3.5 text-gray-400" />;
    switch (currentWebsite.security) {
      case 'secure': return <Lock className="w-3.5 h-3.5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />;
      case 'insecure': 
      case 'phishing': return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
      default: return <Lock className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const TabBar = (
    <div className="flex items-center w-full gap-1 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveTabId(tab.id)}
          className={cn(
            "group h-8 px-3 rounded-t-md flex items-center gap-2 min-w-[120px] max-w-[200px] transition-all cursor-pointer select-none border-b-2",
            tab.id === activeTabId 
              ? "bg-white/10 border-blue-500" 
              : "hover:bg-white/5 border-transparent opacity-70 hover:opacity-100"
          )}
        >
          <span className="text-white/90 text-xs truncate flex-1 font-medium">{tab.title}</span>
          <button 
            onClick={(e) => closeTab(e, tab.id)}
            className="text-white/20 hover:text-white/90 hover:bg-white/20 rounded p-0.5 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button 
        onClick={addTab}
        className="h-7 w-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors ml-1"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );

  const content = (
    <div className="flex flex-col min-h-full bg-gray-900 relative">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md border-b border-white/10 flex items-center px-3 py-2 gap-2 shadow-sm">
        <div className="flex items-center gap-1">
          <button onClick={goBack} disabled={activeTab.historyIndex <= 0} className="p-1.5 rounded hover:bg-white/10 text-white/70 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goForward} disabled={activeTab.historyIndex >= activeTab.history.length - 1} className="p-1.5 rounded hover:bg-white/10 text-white/70 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={reload} className="p-1.5 hover:bg-white/10 rounded text-white/70">
            <RotateCw className={cn("w-4 h-4", activeTab.isLoading && "animate-spin")} />
          </button>
          <button onClick={goHome} className="p-1.5 hover:bg-white/10 rounded text-white/70">
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* URL Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1">
          <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-1.5 border border-white/5 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            {getSecurityIcon()}
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder={t('browser.searchPlaceholder')}
              className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-white/30"
            />
            <Star className="w-3.5 h-3.5 text-white/30 hover:text-yellow-400 cursor-pointer transition-colors" />
          </div>
        </form>
      </div>

      {/* Loading Bar */}
      {activeTab.isLoading && (
        <div className="absolute top-[53px] left-0 w-full h-0.5 bg-transparent z-30">
          <div 
            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all ease-out duration-300"
            style={{ width: `${activeTab.progress}%` }}
          />
        </div>
      )}

      {/* Website Content */}
      <div className="flex-1 overflow-y-auto relative bg-white h-full">
        {currentWebsite ? (
          <currentWebsite.component
            domain={currentWebsite.domain}
            onNavigate={navigate}
            params={{}} // Simplified params for now
            owner={owner}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mb-6" />
            <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
            <p className="text-white/50 mb-8 text-center max-w-md">
              The URL <span className="text-white/80 font-mono bg-white/10 px-1 rounded">{activeTab.renderedUrl}</span> could not be resolved.
            </p>
            <button onClick={goHome} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium">
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return <AppTemplate toolbar={TabBar} content={content} hasSidebar={false} contentClassName="overflow-hidden" />;
}

// Simple export for the menu config (unchanged mostly, but could be expanded)
export const browserMenuConfig = {
  menus: ['File', 'View', 'History', 'Bookmarks', 'Tab', 'Help'],
  items: {
    'File': [
      { label: 'New Tab', labelKey: 'browser.menu.newTab', shortcut: '⌘T', action: 'new-tab' },
      { label: 'Close Tab', labelKey: 'browser.menu.closeTab', shortcut: '⌘W', action: 'close-tab' }
    ]
  }
};