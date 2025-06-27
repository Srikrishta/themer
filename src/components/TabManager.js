import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function TabManager({ tabs, activeTab, onTabChange, onTabClose, onTabAdd }) {
  return (
    <div className="flex items-center space-x-1 overflow-x-auto pb-2">
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          className={`
            flex items-center px-3 py-2 rounded-t-lg cursor-pointer
            ${activeTab === tab.id ? 'bg-white border-t border-x border-gray-200' : 'bg-gray-50 hover:bg-gray-100'}
          `}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="text-sm font-medium truncate">
            {tab.dates.length > 0 
              ? `Theme ${index + 1}`
              : 'New Theme'
            }
          </span>
          {tabs.length > 1 && (
            <button
              className="ml-2 p-0.5 rounded-full hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              <XMarkIcon className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
} 