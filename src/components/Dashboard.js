import Sidebar from './Sidebar';

export default function Dashboard() {
  return (
    <div className="h-screen" style={{ display: 'grid', gridTemplateColumns: '480px 1fr' }}>
      {/* Fixed-width Sidebar */}
      <div className="h-screen overflow-hidden">
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