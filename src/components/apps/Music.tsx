import { AppTemplate } from './AppTemplate';
import { Heart, Clock, Disc, PlayCircle, User, List, Music2, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '../AppContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useAppStorage } from '../../hooks/useAppStorage';
import { useElementSize } from '../../hooks/useElementSize';

const musicSidebar = {
  sections: [
    {
      title: 'Library',
      items: [
        { id: 'songs', label: 'Songs', icon: Music2, badge: '456' },
        { id: 'artists', label: 'Artists', icon: User, badge: '78' },
        { id: 'albums', label: 'Albums', icon: Disc, badge: '123' },
        { id: 'playlists', label: 'Playlists', icon: List, badge: '12' },
      ],
    },
    {
      title: 'Favorites',
      items: [
        { id: 'favorites', label: 'Liked Songs', icon: Heart, badge: '89' },
        { id: 'recent', label: 'Recently Played', icon: Clock },
      ],
    },
  ],
};

const mockSongs = [
  { id: 1, title: 'Midnight Dreams', artist: 'The Synthwave', album: 'Neon Nights', duration: '3:45' },
  { id: 2, title: 'Electric Soul', artist: 'Digital Hearts', album: 'Binary Love', duration: '4:12' },
  { id: 3, title: 'Cosmic Journey', artist: 'Space Explorers', album: 'Beyond Stars', duration: '5:23' },
  { id: 4, title: 'Urban Echo', artist: 'City Sounds', album: 'Metropolis', duration: '3:56' },
  { id: 5, title: 'Sunset Boulevard', artist: 'Retro Wave', album: 'Golden Hour', duration: '4:34' },
  { id: 6, title: 'Digital Paradise', artist: 'Cyber Dreams', album: 'Virtual Reality', duration: '3:28' },
];

export function Music() {
  // Persisted state
  const [appState, setAppState] = useAppStorage('music', {
    activeCategory: 'songs',
    volume: 75,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(mockSongs[0]);
  const { accentColor } = useAppContext();
  const { getBackgroundColor, blurStyle } = useThemeColors();
  const [containerRef, { width }] = useElementSize();
  const isNarrow = width < 500;
  const isMobile = width < 350;

  const toolbar = (
    <div className="flex items-center justify-between w-full">
      <h2 className="text-white/90">Songs</h2>
      <button
        className="px-3 py-1.5 rounded-lg text-white text-sm transition-all hover:opacity-90 shrink-0"
        style={{ backgroundColor: accentColor }}
      >
        <PlayCircle className="w-4 h-4 inline mr-1.5" />
        {isMobile ? 'Play' : 'Play All'}
      </button>
    </div>
  );

  const content = (
    <div ref={containerRef} className="flex flex-col h-full w-full overflow-hidden">
      {/* Song List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {mockSongs.map((song) => (
            <button
              key={song.id}
              onClick={() => setCurrentSong(song)}
              className={`w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors ${currentSong.id === song.id ? 'bg-white/10' : ''
                }`}
            >
              <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: accentColor }}>
                <Music2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-white text-sm truncate">{song.title}</div>
                <div className="text-white/60 text-xs truncate">{song.artist}</div>
              </div>
              {!isNarrow && <div className="text-white/60 text-xs truncate w-1/3 text-right">{song.album}</div>}
              <div className="text-white/40 text-xs shrink-0">{song.duration}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Now Playing Bar */}
      <div
        className="h-20 border-t border-white/10 px-4 flex items-center justify-between gap-4 shrink-0"
        style={{ background: getBackgroundColor(0.8), ...blurStyle }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded shrink-0" style={{ backgroundColor: accentColor }}>
            <Music2 className="w-6 h-6 text-white m-3" />
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm truncate">{currentSong.title}</div>
            <div className="text-white/60 text-xs truncate">{currentSong.artist}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button className="text-white/70 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-105"
            style={{ backgroundColor: accentColor }}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button className="text-white/70 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume - Hide on mobile/narrow */}
        {!isMobile && (
          <div className="flex items-center gap-2 flex-1 justify-end min-w-0 hidden sm:flex">
            <Volume2 className="w-4 h-4 text-white/70" />
            <input
              type="range"
              min="0"
              max="100"
              value={appState.volume}
              onChange={(e) => setAppState(s => ({ ...s, volume: parseInt(e.target.value) }))}
              className="w-20 md:w-24"
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppTemplate
      sidebar={musicSidebar}
      toolbar={toolbar}
      content={content}
      activeItem={appState.activeCategory}
      onItemClick={(id) => setAppState(s => ({ ...s, activeCategory: id }))}
    />
  );
}
