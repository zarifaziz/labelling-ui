'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface PanelConfig {
  id: string;
  minWidth: number;
  defaultWidth: number;
  maxWidth?: number;
  content: ReactNode;
}

interface ResizableLayoutProps {
  panels: PanelConfig[];
  className?: string;
}

export function ResizableLayout({ panels, className = '' }: ResizableLayoutProps) {
  // Find the flex panel (the one with defaultWidth === 0)
  const flexPanelIndex = panels.findIndex(p => p.defaultWidth === 0);
  
  // Initialize widths from panel configs
  const [widths, setWidths] = useState<number[]>(() => 
    panels.map(p => p.defaultWidth)
  );
  
  const [isDragging, setIsDragging] = useState(false);
  const draggingIndex = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startWidths = useRef<number[]>([]);

  // Handle mouse down on a divider
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    draggingIndex.current = index;
    startX.current = e.clientX;
    startWidths.current = [...widths];
    setIsDragging(true);
  };

  // Handle mouse move and mouse up
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (draggingIndex.current === null) return;
      
      const index = draggingIndex.current;
      const delta = e.clientX - startX.current;
      
      const newWidths = [...startWidths.current];
      const leftPanel = panels[index];
      const rightPanel = panels[index + 1];
      
      // If we're dragging next to the flex panel, only adjust the non-flex side
      const leftIsFlex = index === flexPanelIndex;
      const rightIsFlex = index + 1 === flexPanelIndex;
      
      if (rightIsFlex) {
        // Only adjust left panel, flex panel absorbs the change
        let newLeftWidth = startWidths.current[index] + delta;
        newLeftWidth = Math.max(newLeftWidth, leftPanel.minWidth);
        if (leftPanel.maxWidth) {
          newLeftWidth = Math.min(newLeftWidth, leftPanel.maxWidth);
        }
        newWidths[index] = newLeftWidth;
      } else if (leftIsFlex) {
        // Only adjust right panel, flex panel absorbs the change
        let newRightWidth = startWidths.current[index + 1] - delta;
        newRightWidth = Math.max(newRightWidth, rightPanel.minWidth);
        if (rightPanel.maxWidth) {
          newRightWidth = Math.min(newRightWidth, rightPanel.maxWidth);
        }
        newWidths[index + 1] = newRightWidth;
      } else {
        // Both are fixed width, balance between them
        let newLeftWidth = startWidths.current[index] + delta;
        let newRightWidth = startWidths.current[index + 1] - delta;
        
        // Apply constraints
        if (newLeftWidth < leftPanel.minWidth) {
          newLeftWidth = leftPanel.minWidth;
          newRightWidth = startWidths.current[index] + startWidths.current[index + 1] - newLeftWidth;
        }
        if (leftPanel.maxWidth && newLeftWidth > leftPanel.maxWidth) {
          newLeftWidth = leftPanel.maxWidth;
          newRightWidth = startWidths.current[index] + startWidths.current[index + 1] - newLeftWidth;
        }
        if (newRightWidth < rightPanel.minWidth) {
          newRightWidth = rightPanel.minWidth;
          newLeftWidth = startWidths.current[index] + startWidths.current[index + 1] - newRightWidth;
        }
        if (rightPanel.maxWidth && newRightWidth > rightPanel.maxWidth) {
          newRightWidth = rightPanel.maxWidth;
          newLeftWidth = startWidths.current[index] + startWidths.current[index + 1] - newRightWidth;
        }
        
        newWidths[index] = newLeftWidth;
        newWidths[index + 1] = newRightWidth;
      }
      
      setWidths(newWidths);
    };

    const handleMouseUp = () => {
      draggingIndex.current = null;
      setIsDragging(false);
    };

    // Set cursor style on body during drag
    const body = document.body;
    body.classList.add('resizing-panels');

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      body.classList.remove('resizing-panels');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, panels, flexPanelIndex]);

  return (
    <div className={`flex h-full ${className}`}>
      {panels.map((panel, index) => {
        const isFlexPanel = index === flexPanelIndex;

        return (
          <div
            key={panel.id}
            className="flex h-full"
            style={{
              flex: isFlexPanel ? '1 1 0%' : '0 0 auto',
              minWidth: isFlexPanel ? `${panel.minWidth}px` : undefined,
            }}
          >
            {/* Panel content */}
            <div
              className="h-full overflow-hidden"
              style={{
                width: isFlexPanel ? '100%' : `${widths[index]}px`,
                flex: isFlexPanel ? 1 : undefined,
                minWidth: isFlexPanel ? undefined : `${panel.minWidth}px`,
                maxWidth: panel.maxWidth ? `${panel.maxWidth}px` : undefined,
              }}
            >
              {panel.content}
            </div>

            {/* Divider (not after the last panel) */}
            {index < panels.length - 1 && (
              <div
                className="relative w-1 flex-shrink-0 group cursor-col-resize z-10 hover:bg-[#7C3AED]/20"
                onMouseDown={(e) => handleMouseDown(e, index)}
              >
                {/* Visible line */}
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center">
                  <div className="w-px h-full bg-gray-200 group-hover:bg-[#7C3AED] transition-colors" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
