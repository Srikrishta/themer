import ThemeCreator from './ThemeCreator';
import FlightJourneyBar from './FlightJourneyBar';

export default function Dashboard() {
  return (
    <div className="h-screen overflow-auto">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold themer-gradient">Themer</span>
          </div>
        </div>
      </header>
      {/* Figma Flight Journey Bar */}
      <div className="w-full flex justify-center py-6">
        <FlightJourneyBar />
      </div>
      {/* Main Content */}
      <div className="p-8">
        {/* ThemeCreator is now positioned absolutely and draggable */}
        <ThemeCreator />
      </div>
    </div>
  );
} 