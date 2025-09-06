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
          {/* Card Info */}
          <div className="bg-white/10 rounded-lg p-3">
            <h4 className="font-semibold mb-2">Card Information</h4>
            <div className="text-sm space-y-1">
              <div><span className="opacity-70">Type:</span> {cardType === 'content-card' ? 'Content Card' : 'Promo Card'}</div>
              <div><span className="opacity-70">Index:</span> {cardIndex}</div>
            </div>
          </div>

          {/* Dummy Analytics Data */}
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

          {/* Dummy Chart Placeholder */}
          <div className="bg-white/10 rounded-lg p-3">
            <h4 className="font-semibold mb-2">Engagement Over Time</h4>
            <div className="h-20 bg-white/5 rounded flex items-center justify-center">
              <div className="text-sm opacity-50">📊 Chart visualization would go here</div>
            </div>
          </div>

          {/* Dummy Recommendations */}
          <div className="bg-white/10 rounded-lg p-3">
            <h4 className="font-semibold mb-2">Recommendations</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>High engagement rate - consider promoting this content</span>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-400 mr-2">⚠</span>
                <span>Peak hours: 2-4 PM - optimize timing</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-400 mr-2">💡</span>
                <span>Try A/B testing different images</span>
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
