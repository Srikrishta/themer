import React, { useMemo } from 'react';
import DottedMap from 'dotted-map/without-countries';
import { AIRPORTS } from './AirportSearch';

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
    
    // Generate a map focused on Europe only
    cachedMapData = getMapJSON({
      width: 140, // Increased width for better resolution
      height: 80, // Increased height for better resolution
      countries: ['FRA', 'ITA', 'DEU', 'ESP', 'GBR', 'NLD', 'BEL', 'CHE', 'AUT', 'POL', 'CZE', 'HUN', 'PRT', 'GRC', 'SWE', 'NOR', 'DNK', 'FIN', 'IRL', 'LUX', 'SVK', 'SVN', 'EST', 'LVA', 'LTU', 'HRV', 'BGR', 'ROU', 'CYP', 'MLT'],
      region: { 
        lat: { min: 35, max: 72 }, // Extended north to include more of Scandinavia
        lng: { min: -10, max: 40 }  // Europe longitude range
      },
      grid: 'diagonal'
    });
    
    return cachedMapData;
  } catch (error) {
    console.error('Failed to generate map data:', error);
    return null;
  }
};

const RouteMap = React.memo(({ routes = [], themeColor = '#1E1E1E' }) => {
  // Always call hooks at the top level - no conditional returns before hooks
  const mapData = useMemo(() => {
    return generateEuropeanMapData();
  }, []);

  const mapInstance = useMemo(() => {
    if (!mapData) return null;
    
    try {
      const map = new DottedMap({ map: JSON.parse(mapData) });
      
      // Add pins for each route (only if routes exist)
      if (routes && routes.length > 0) {
        routes.forEach((route, index) => {
          const airportCode = route.airport?.code;
          const coordinates = AIRPORT_COORDINATES[airportCode];
          
          if (coordinates) {
            map.addPin({
              lat: coordinates.lat,
              lng: coordinates.lng,
              svgOptions: { 
                color: themeColor, 
                radius: 0.4, // Smaller pins for better proportion at full width
                stroke: '#FFFFFF',
                strokeWidth: 1.5
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
      }
      
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
        radius: 0.2, // Smaller dots for better density at full width
        color: '#B8BCC8', // Medium-light grey for balanced visibility
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
          `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${themeColor}" stroke-width="2" stroke-dasharray="4,4" opacity="0.8" />`
        );
      }
    }
    
    return lines.join('');
  }, [routes, themeColor]);

  // Map will show even without routes

  if (!svgMap) {
    return (
      <div className="w-full flex justify-center py-8">
        <div className="text-gray-600 text-sm">Map loading...</div>
      </div>
    );
  }

  // Insert connection lines into the SVG
  const svgWithLines = svgMap.replace('</svg>', `${connectionLines}</svg>`);

  return (
    <div className="w-full">
      <div className="relative w-full">
        {/* Map Container - Full viewport width and height */}
        <div 
          className="relative overflow-hidden w-full"
          style={{ 
            height: 'calc(100vh - 440px)', // Viewport height minus dark container height (360px) + margin (80px)
            minHeight: '200px', // Minimum height to ensure usability
            backgroundColor: '#f3f4f6' // Same as page background (bg-gray-100)
          }}
        >
          <img 
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svgWithLines)}`}
            alt="Flight Routes Map"
            className="w-full h-full object-contain"
            style={{ 
              filter: 'brightness(1.1) contrast(1.1)',
              objectPosition: 'center top' // Align map to top to prevent cut-off
            }}
          />
          
          {/* Route Labels Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {routes && routes.length > 0 && routes.map((route, index) => {
              const airportCode = route.airport?.code;
              const coordinates = AIRPORT_COORDINATES[airportCode];
              if (!coordinates) return null;
              
              // Manual positioning for known airports
              let x, y;
              
              if (airportCode === 'CDG') {
                // Paris CDG - manually positioned
                x = 25; // Approximately 25% from left
                y = 35; // Approximately 35% from top
              } else {
                // Fallback for other airports
                const mapLatMin = 35, mapLatMax = 72;
                const mapLngMin = -10, mapLngMax = 40;
                
                const mapWidth = 140, mapHeight = 80;
                const mapX = ((coordinates.lng - mapLngMin) / (mapLngMax - mapLngMin)) * mapWidth;
                const mapY = ((mapLatMax - coordinates.lat) / (mapLatMax - mapLatMin)) * mapHeight;
                
                x = (mapX / mapWidth) * 100;
                y = (mapY / mapHeight) * 100;
              }
              
              return (
                <div
                  key={route.id}
                  className="absolute transform -translate-x-1/2"
                  style={{ 
                    left: `${x}%`, 
                    top: `${y}%`,
                    zIndex: 10,
                    transform: 'translateX(-50%) translateY(-80%)' // Move label closer above the pin
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
        
      </div>
    </div>
  );
});

RouteMap.displayName = 'RouteMap';

export default RouteMap;