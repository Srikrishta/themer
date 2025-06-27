import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';

export default function Dashboard() {
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const sidebarRef = useRef(null);
  const resizerRef = useRef(null);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseDown = (e) => {
      isResizing.current = true;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 320 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const resizer = resizerRef.current;
    resizer?.addEventListener('mousedown', handleMouseDown);

    return () => {
      resizer?.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with min-width: 320px and max-width: 400px */}
      <div 
        ref={sidebarRef}
        className="flex-shrink-0 bg-white border-r border-gray-200"
        style={{ 
          width: `${sidebarWidth}px`,
          minWidth: '320px',
          maxWidth: '400px'
        }}
      >
        <Sidebar />
      </div>

      {/* Resizer */}
      <div
        ref={resizerRef}
        className="w-1 hover:w-2 bg-transparent hover:bg-gray-200 cursor-col-resize transition-all duration-200 ease-in-out"
        style={{ margin: '0 -2px' }}
      />

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
        </div>
      </div>
    </div>
  );
} 