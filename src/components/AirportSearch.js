import { useState, useRef, useCallback } from 'react';
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

const ITEM_TYPE = 'ROUTE_CARD';

function RouteCard({ route, index, moveCard, onRemove }) {
  const ref = useRef(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      return { id: route.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Separate drag handle from the preview
  const opacity = isDragging ? 0.5 : 1;

  // Combine drop and preview refs
  drop(preview(ref));

  return (
    <div
      ref={ref}
      className="relative w-full mb-4"
      style={{ 
        opacity,
        // Ensure consistent layout during drag
        display: 'grid',
        gridTemplateColumns: '24px 1fr',
        gap: '16px',
        alignItems: 'start',
      }}
      data-handler-id={handlerId}
    >
      {/* Dot - moves with the card */}
      <div className="flex items-center justify-center py-4">
        <div className="w-3 h-3 rounded-full border-2 border-white bg-gray-500 relative z-10" />
      </div>

      {/* Card Content - Entire card is draggable */}
      <div 
        ref={drag}
        className="w-full cursor-grab active:cursor-grabbing"
      >
        <div className={`bg-white p-4 rounded-lg border shadow-sm transition-all ${
          isDragging ? 'border-indigo-300 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
              {/* Visual Drag Indicator */}
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
              className="p-1 rounded-full hover:bg-gray-100 transition-colors z-10 relative"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteList({ routes, setRoutes, onRemoveRoute }) {
  const moveCard = useCallback((dragIndex, hoverIndex) => {
    const newRoutes = [...routes];
    const [reorderedRoute] = newRoutes.splice(dragIndex, 1);
    newRoutes.splice(hoverIndex, 0, reorderedRoute);
    
    // Recalculate types after reordering
    const updatedRoutes = newRoutes.map((route, index) => ({
      ...route,
      type: index === 0 ? 'origin' : index === newRoutes.length - 1 ? 'destination' : `leg ${index}`
    }));
    
    setRoutes(updatedRoutes);
  }, [routes, setRoutes]);

  return (
    <div className="relative">
      {/* Static Line - stays in place during drag operations */}
      {routes.length > 1 && (
        <div 
          className="absolute w-0.5 bg-gray-200 z-0"
          style={{
            left: '12px',
            top: '32px',
            bottom: '32px'
          }}
        />
      )}
      
      {/* Route Cards */}
      <div className="relative z-10">
        {routes.map((route, index) => (
          <RouteCard
            key={route.id}
            route={route}
            index={index}
            moveCard={moveCard}
            onRemove={() => onRemoveRoute(index)}
          />
        ))}
      </div>
    </div>
  );
}

function AirportSearchCore({ routes = [], setRoutes, usedAirports = [], onRemoveRoute }) {
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

  return (
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
            className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
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
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
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

      {/* Route Cards with Drag and Drop */}
      {routes.length > 0 && (
        <RouteList 
          routes={routes} 
          setRoutes={setRoutes} 
          onRemoveRoute={onRemoveRoute} 
        />
      )}
    </div>
  );
}

export default function AirportSearch(props) {
  return (
    <DndProvider backend={HTML5Backend}>
      <AirportSearchCore {...props} />
    </DndProvider>
  );
}