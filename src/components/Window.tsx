import { Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState, useEffect, memo, useCallback } from 'react';
import type { WindowState } from '../App';

interface WindowProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onUpdatePosition: (position: { x: number; y: number }) => void;
  onUpdateSize?: (size: { width: number; height: number }) => void;
  isFocused: boolean;
}

function WindowComponent({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdatePosition,
  isFocused
}: WindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    });
    onFocus();
  }, [window.position.x, window.position.y, onFocus]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !window.isMaximized) {
        onUpdatePosition({
          x: e.clientX - dragOffset.x,
          y: Math.max(28, e.clientY - dragOffset.y),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, window.isMaximized, onUpdatePosition]);

  const position = window.isMaximized
    ? { x: 0, y: 28 }
    : window.position;

  const size = window.isMaximized
    ? { width: '100vw', height: 'calc(100vh - 28px)' }
    : { width: window.size.width, height: window.size.height };

  return (
    <motion.div
      ref={windowRef}
      className={`absolute bg-gray-800/70 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-white/20 ${isDragging ? '' : 'transition-all'
        } ${!isFocused ? 'brightness-75 saturate-50' : ''
        }`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: window.zIndex,
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      onMouseDown={onFocus}
    >

      {/* Title Bar */}
      <div
        className="h-11 bg-gray-900/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 window-controls">
          <button
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            onClick={onClose}
          />
          <button
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
            onClick={onMinimize}
          />
          <button
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
            onClick={onMaximize}
          />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 text-sm text-white/80">
          {window.title}
        </div>

        <div className="window-controls opacity-0">
          <Maximize2 className="w-4 h-4" />
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-44px)] overflow-auto bg-gray-800/50 backdrop-blur-md">
        {window.content}
      </div>
    </motion.div>
  );
}

export const Window = memo(WindowComponent);