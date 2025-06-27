import { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, Bars3Icon } from '@heroicons/react/24/outline';

// Airport data
const AIRPORTS = [
  // European Airports
  { code: 'CDG', name: 'Paris Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy' },
  
  // Southeast Asian Airports
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia' },
  { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia' },
  { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines' }
];

const ItemTypes = {
  ROUTE_CARD: 'route_card'
};

function DraggableRouteCard({ route, onRemove, isFirst, isLast, index, moveCard }) {
  const ref = useRef(null);

  const [{ handlerId, isOver }, drop] = useDrop({
    accept: ItemTypes.ROUTE_CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Get the bounding rectangle of the hover target
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverHeight = hoverBoundingRect.bottom - hoverBoundingRect.top;
      
      // Calculate position as percentage (0 = top, 1 = bottom)
      const hoverPosition = hoverClientY / hoverHeight;

      // Dragging downwards (moving item to higher index)
      // Only swap when we're past 30% into the target
      if (dragIndex < hoverIndex && hoverPosition < 0.3) {
        return;
      }

      // Dragging upwards (moving item to lower index)
      // Only swap when we're past 70% into the target (closer to top)
      if (dragIndex > hoverIndex && hoverPosition > 0.7) {
        return;
      }

      // Perform the move
      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ROUTE_CARD,
    item: () => ({ id: route.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Make the entire card draggable
  drag(drop(ref));

  return (
    <div className="relative flex">
      {/* Static Progress Dot */}
      <div className="flex-none w-6 flex items-center justify-center py-4">
        <div className="w-3 h-3 rounded-full border-2 border-white bg-gray-500 relative z-10" />
      </div>

      {/* Draggable Card Content */}
      <div 
        ref={ref}
        data-handler-id={handlerId}
        className={`flex-1 ml-4 transition-all duration-150 ease-out transform cursor-move ${
          isDragging ? 'opacity-50 scale-105 rotate-1 shadow-xl z-50' : 'opacity-100 scale-100 rotate-0'
        } ${isOver && !isDragging ? 'translate-y-1 border-indigo-300' : 'translate-y-0'}`}
        style={{
          transformOrigin: 'center',
        }}
      >
        <div className={`bg-white p-4 rounded-lg border shadow-sm transition-all duration-150 ${
          isDragging ? 'border-indigo-300 shadow-lg' : 'border-gray-200'
        } ${isOver && !isDragging ? 'border-indigo-400 shadow-md' : ''}`}>
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
              {/* Drag Handle - Visual indicator only */}
              <div className="mt-1 p-1 rounded">
                <Bars3Icon className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {route.type.charAt(0).toUpperCase() + route.type.slice(1)}
                </span>
                <h3 className="mt-2 text-lg font-medium text-gray-900">{route.airport.code}</h3>
                <p className="text-sm text-gray-500">{route.airport.city}, {route.airport.country}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded-full hover:bg-gray-100 transition-all duration-150"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Drop Indicator */}
      {isOver && !isDragging && (
        <div className="absolute inset-0 pointer-events-none flex items-center">
          <div className="w-full mx-6 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent opacity-60"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full mx-2 opacity-80 animate-pulse"></div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent opacity-60"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AirportSearch({ routes = [], setRoutes, usedAirports = [], onRemoveRoute }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAirports = AIRPORTS.filter(airport => {
    const matchesSearch = (
      airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const isNotUsed = !usedAirports.includes(airport.code);
    return matchesSearch && isNotUsed;
  });

  // Group airports by region
  const groupedAirports = filteredAirports.reduce((groups, airport) => {
    const region = ['France', 'Italy', 'Germany', 'Netherlands'].includes(airport.country) 
      ? 'Europe' 
      : 'Southeast Asia';
    
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(airport);
    return groups;
  }, {});

  const handleAirportSelect = (airport) => {
    if (routes.length < 5 && !usedAirports.includes(airport.code)) {
      const newRoute = {
        id: Date.now(),
        airport,
        type: routes.length === 0 ? 'origin' : routes.length === 4 ? 'destination' : 'leg'
      };
      setRoutes([...routes, newRoute]);
      setSearchTerm('');
      setIsDropdownOpen(false);
    }
  };

  const moveCard = (dragIndex, hoverIndex) => {
    const newRoutes = [...routes];
    const [movedRoute] = newRoutes.splice(dragIndex, 1);
    newRoutes.splice(hoverIndex, 0, movedRoute);
    
    // Recalculate types after reordering
    const updatedRoutes = newRoutes.map((route, index) => ({
      ...route,
      type: index === 0 ? 'origin' : index === newRoutes.length - 1 ? 'destination' : `leg ${index}`
    }));
    
    setRoutes(updatedRoutes);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4 relative">
        <div className="relative">
          <label htmlFor="airport-search" className="block text-sm font-bold text-gray-700 mb-2">
            Add route
          </label>
          <div className="relative">
            <input
              id="airport-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={() => setIsDropdownOpen(true)}
              placeholder="Search airports..."
              className="w-full p-2 pr-10 border border-gray-300 rounded-md"
            />
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              {isDropdownOpen ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {Object.keys(groupedAirports).length > 0 ? (
                Object.entries(groupedAirports).map(([region, airports]) => (
                  <div key={region}>
                    {/* Region Header */}
                    <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-100">
                      {region}
                    </div>
                    {/* Airports in Region */}
                    {airports.map(airport => (
                      <button
                        key={airport.code}
                        onClick={() => handleAirportSelect(airport)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <h3 className="text-lg font-medium text-gray-900">{airport.code}</h3>
                        <p className="text-sm text-gray-500">{airport.city}, {airport.country}</p>
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-center">
                  {searchTerm ? 'No airports found' : 'All airports have been selected'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Route Cards */}
        <div className="relative">
          {/* Single Continuous Line */}
          {routes.length > 1 && (
            <div 
              className="absolute w-0.5 bg-gray-200 z-0"
              style={{
                left: '11.5px',
                top: '32px',
                bottom: '32px'
              }}
            />
          )}
          
          {/* Cards */}
          <div className="space-y-4">
            {routes.map((route, index) => (
              <DraggableRouteCard
                key={route.id}
                route={route}
                onRemove={() => onRemoveRoute(index)}
                isFirst={index === 0}
                isLast={index === routes.length - 1}
                index={index}
                moveCard={moveCard}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}