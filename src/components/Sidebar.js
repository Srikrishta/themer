import ThemeCreator from './ThemeCreator';

export default function Sidebar() {
  return (
    <div className="h-full p-4">
      <div className="h-full flex flex-col rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-6 relative">
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="mt-4">
            <ThemeCreator isInHeader={true} />
          </div>
        </div>
      </div>
    </div>
  );
} 