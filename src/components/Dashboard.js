import Sidebar from './Sidebar';

export default function Dashboard() {
  return (
    <div className="h-screen bg-gray-100" style={{ display: 'grid', gridTemplateColumns: '360px 1fr' }}>
      {/* Fixed-width Sidebar */}
      <div className="bg-white border-r border-gray-200 h-screen overflow-hidden">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="overflow-auto">
        <div className="p-8">
        </div>
      </div>
    </div>
  );
} 