import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { cn } from '../ui/utils';
import { useElementSize } from '../../hooks/useElementSize';

interface AppTemplateProps {
  sidebar?: {
    sections: {
      title: string;
      items: {
        id: string;
        label: string;
        icon: LucideIcon;
        badge?: string;
        action?: () => void;
      }[];
    }[];
  };
  toolbar?: ReactNode;
  content: ReactNode;
  hasSidebar?: boolean;
  className?: string;
  contentClassName?: string;
  toolbarClassName?: string;
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

export function AppTemplate({
  sidebar,
  toolbar,
  content,
  hasSidebar = true,
  className,
  contentClassName,
  toolbarClassName,
  activeItem,
  onItemClick
}: AppTemplateProps) {
  const { accentColor } = useAppContext();
  const { windowBackground, sidebarBackground, titleBarBackground, blurStyle } = useThemeColors();
  const [containerRef, { width }] = useElementSize();

  // Explicit breakpoint for collapsing sidebar
  const isCompact = width < 500;

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col h-full", className)}
      style={{ background: windowBackground, ...blurStyle }}
    >
      {/* Toolbar */}
      {toolbar && (
        <div
          className={cn("h-12 border-b border-white/10 flex items-center px-4 shrink-0", toolbarClassName)}
          style={{ background: titleBarBackground, ...blurStyle }}
        >
          {toolbar}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {hasSidebar && sidebar && (
          <div
            className={cn(
              "border-r border-white/10 py-3 px-2 overflow-y-auto transition-all duration-300 ease-in-out shrink-0",
              isCompact ? "w-16 items-center" : "w-64"
            )}
            style={{ background: sidebarBackground, ...blurStyle }}
          >
            {sidebar.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-4' : ''}>
                {section.title && !isCompact && (
                  <div className="px-3 py-1 text-xs text-white/40 mb-1 truncate">
                    {section.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => item.action ? item.action() : onItemClick?.(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-md transition-colors group",
                        isCompact ? "justify-center" : "justify-start",
                        activeItem === item.id
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:bg-white/5"
                      )}
                      title={isCompact ? item.label : undefined}
                      style={{
                        '--accent-color': accentColor,
                      } as React.CSSProperties}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 flex-shrink-0",
                        activeItem === item.id ? "text-white" : "text-white/50 group-hover:text-white/70"
                      )} />
                      {!isCompact && (
                        <>
                          <span className="flex-1 text-left truncate transition-opacity duration-200">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-xs text-white/40 transition-opacity duration-200">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className={cn("flex-1 overflow-y-auto", contentClassName)}>
          {content}
        </div>
      </div>
    </div >
  );
}
