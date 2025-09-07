import React, { useMemo, useCallback } from 'react';
import DottedMap from 'dotted-map/without-countries';
import { AIRPORTS } from './AirportSearch';

// Pre-computed European map data (this would be generated during build time)
// For now, we'll use a simplified version focusing on Europe
const EUROPEAN_MAP_DATA = {
  // This would contain the pre-computed grid data for Europe
  // Generated using: getMapJSON({ height: 60, countries: ['FRA', 'ITA', 'DEU', 'ESP', 'GBR', 'NLD', 'BEL', 'CHE', 'AUT', 'POL', 'CZE', 'HUN', 'PRT', 'GRC', 'SWE', 'NOR', 'DNK', 'FIN', 'IRL', 'LUX', 'SVK', 'SVN', 'EST', 'LVA', 'LTU', 'HRV', 'BGR', 'ROU', 'CYP', 'MLT'] })
  // For development, we'll generate it dynamically but cache it
};

// Create a lookup map for airport coordinates
const AIRPORT_COORDINATES = AIRPORTS.reduce((acc, airport) => {
  acc[airport.code] = {
    lat: airport.lat,
    lng: airport.lng,
    city: airport.city,
    country: airport.country
  };
  return acc;
}, {});

// Generate European map data (cached)
let cachedMapData = null;

const generateEuropeanMapData = () => {
  if (cachedMapData) return cachedMapData;
  
  try {
    // Import the full dotted-map for generation
    const { getMapJSON } = require('dotted-map');
    
    cachedMapData = getMapJSON({
      height: 60,
      countries: ['FRA', 'ITA', 'DEU', 'ESP', 'GBR', 'NLD', 'BEL', 'CHE', 'AUT', 'POL', 'CZE', 'HUN', 'PRT', 'GRC', 'SWE', 'NOR', 'DNK', 'FIN', 'IRL', 'LUX', 'SVK', 'SVN', 'EST', 'LVA', 'LTU', 'HRV', 'BGR', 'ROU', 'CYP', 'MLT'],
      grid: 'diagonal'
    });
    
    return cachedMapData;
  } catch (error) {
    console.warn('Failed to generate map data, using fallback:', error);
    return null;
  }
};

const RouteMap = React.memo(({ routes = [], themeColor = '#1E1E1E' }) => {
  // Always call hooks at the top level - no conditional returns before hooks
  const mapData = useMemo(() => {
    return generateEuropeanMapData();
  }, []);

  const mapInstance = useMemo(() => {
    if (!routes || routes.length === 0 || !mapData) return null;
    
    try {
      const map = new DottedMap({ map: JSON.parse(mapData) });
      
      // Add pins for each route
      routes.forEach((route, index) => {
        const airportCode = route.airport?.code;
        const coordinates = AIRPORT_COORDINATES[airportCode];
        
        if (coordinates) {
          map.addPin({
            lat: coordinates.lat,
            lng: coordinates.lng,
            svgOptions: { 
              color: themeColor, 
              radius: 0.6,
              stroke: '#FFFFFF',
              strokeWidth: 2
            },
            data: { 
              airportCode, 
              city: coordinates.city, 
              country: coordinates.country,
              routeIndex: index,
              type: route.type
            }
          });
        }
      });
      
      return map;
    } catch (error) {
      console.error('Error creating map instance:', error);
      return null;
    }
  }, [routes, mapData, themeColor]);

  const svgMap = useMemo(() => {
    if (!mapInstance) return null;
    
    try {
      return mapInstance.getSVG({
        radius: 0.25,
        color: '#374151', // Gray dots for background
        shape: 'hexagon',
        backgroundColor: 'transparent'
      });
    } catch (error) {
      console.error('Error generating SVG map:', error);
      return null;
    }
  }, [mapInstance]);

  // Generate connection lines between consecutive routes
  const connectionLines = useMemo(() => {
    if (!routes || routes.length < 2) return '';
    
    const lines = [];
    for (let i = 0; i < routes.length - 1; i++) {
      const currentRoute = routes[i];
      const nextRoute = routes[i + 1];
      
      const currentCoords = AIRPORT_COORDINATES[currentRoute.airport?.code];
      const nextCoords = AIRPORT_COORDINATES[nextRoute.airport?.code];
      
      if (currentCoords && nextCoords) {
        // Convert lat/lng to SVG coordinates (simplified projection)
        const x1 = (currentCoords.lng + 180) * 2; // Rough conversion
        const y1 = (90 - currentCoords.lat) * 2;
        const x2 = (nextCoords.lng + 180) * 2;
        const y2 = (90 - nextCoords.lat) * 2;
        
        lines.push(
          `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${themeColor}" stroke-width="3" stroke-dasharray="5,5" opacity="0.8" />`
        );
      }
    }
    
    return lines.join('');
  }, [routes, themeColor]);

  // Early return after all hooks have been called
  if (!routes || routes.length === 0) {
    return null;
  }

  if (!svgMap) {
    return (
      <div className="w-full flex justify-center py-8">
        <div className="text-gray-500 text-sm">Map loading...</div>
      </div>
    );
  }

  // Insert connection lines into the SVG
  const svgWithLines = svgMap.replace('</svg>', `${connectionLines}</svg>`);

  return (
    <div className="w-full flex justify-center py-8">
      <div className="relative">
        {/* Map Container */}
        <div 
          className="relative overflow-hidden rounded-lg shadow-lg"
          style={{ 
            width: '800px', 
            height: '400px',
            backgroundColor: '#1f2937' // Dark background to match theme
          }}
        >
          <img 
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svgWithLines)}`}
            alt="Flight Routes Map"
            className="w-full h-full object-contain"
            style={{ filter: 'brightness(0.8) contrast(1.2)' }}
          />
          
          {/* Route Labels Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {routes.map((route, index) => {
              const coordinates = AIRPORT_COORDINATES[route.airport?.code];
              if (!coordinates) return null;
              
              // Position labels (simplified positioning)
              const x = ((coordinates.lng + 180) / 360) * 100;
              const y = ((90 - coordinates.lat) / 180) * 100;
              
              return (
                <div
                  key={route.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${x}%`, 
                    top: `${y}%`,
                    zIndex: 10
                  }}
                >
                  <div 
                    className="px-2 py-1 rounded text-xs font-semibold text-white shadow-lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    {route.airport.city} ({route.airport.code})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: themeColor }}></span>
            Selected Routes
            <span className="mx-4">•</span>
            <span className="text-gray-400">European Flight Network</span>
          </div>
        </div>
      </div>
    </div>
  );
});

RouteMap.displayName = 'RouteMap';

export default RouteMap;
