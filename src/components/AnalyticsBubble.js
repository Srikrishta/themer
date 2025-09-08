import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function AnalyticsBubble({ 
  isVisible, 
  position, 
  elementData, 
  onClose, 
  themeColor = '#1E1E1E' 
}) {
  if (!isVisible) return null;

  const { x, y } = position;
  const cardType = elementData?.cardType || 'promo-card';
  const cardIndex = elementData?.cardIndex || 0;

  return (
    <div
      className="fixed z-50"
      style={{ 
        left: x, 
        top: y,
        zIndex: 999999999
      }}
    >
      <div
        className="rounded-lg shadow-2xl border-2 border-white/20 backdrop-blur-sm"
        style={{
          backgroundColor: themeColor,
          minWidth: '300px',
          maxWidth: '400px',
          padding: '20px',
          color: '#FFFFFF'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Analytics</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Performance Metrics */}
          <div className="bg-white/10 rounded-lg p-3">
            <h4 className="font-semibold mb-2">Performance Metrics</h4>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="opacity-70">Impressions:</span>
                <span className="font-mono">12,847</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Clicks:</span>
                <span className="font-mono">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">CTR:</span>
                <span className="font-mono text-green-400">9.6%</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Engagement:</span>
                <span className="font-mono text-blue-400">87.3%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex justify-between items-center text-xs opacity-70">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <span>Data source: Analytics API</span>
          </div>
        </div>
      </div>
    </div>
  );
}
