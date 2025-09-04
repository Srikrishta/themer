import React, { useEffect, useState } from 'react';
import DottedMap from 'dotted-map';

const DottedWorldMap = () => {
  const [svgMap, setSvgMap] = useState('');

  useEffect(() => {
    // Create the dotted world map (no specific countries = entire world)
    const map = new DottedMap({
      height: 400,
      width: 800,
      grid: 'diagonal',
      avoidOuterPins: false
    });

    // Add some example location pins (like in the GitHub example)
    map.addPin({
      lat: 40.73061,
      lng: -73.935242, // New York
      svgOptions: { color: '#d6ff79', radius: 0.4 }
    });
    
    map.addPin({
      lat: 48.8534,
      lng: 2.3488, // Paris
      svgOptions: { color: '#ffffff', radius: 0.4 }
    });
    
    map.addPin({
      lat: 51.5074,
      lng: -0.1278, // London
      svgOptions: { color: '#d6ff79', radius: 0.4 }
    });
    
    map.addPin({
      lat: 52.3676,
      lng: 4.9041, // Amsterdam
      svgOptions: { color: '#d6ff79', radius: 0.4 }
    });
    
    map.addPin({
      lat: 37.7749,
      lng: -122.4194, // San Francisco
      svgOptions: { color: '#d6ff79', radius: 0.4 }
    });
    
    map.addPin({
      lat: -33.8688,
      lng: 151.2093, // Sydney
      svgOptions: { color: '#d6ff79', radius: 0.4 }
    });
    
    map.addPin({
      lat: 35.6762,
      lng: 139.6503, // Tokyo
      svgOptions: { color: '#d6ff79', radius: 0.4 }
    });
    
    map.addPin({
      lat: -23.5505,
      lng: -46.6333, // São Paulo
      svgOptions: { color: '#d6ff79', radius: 0.4 }
    });

    // Generate the SVG with the exact style from the GitHub example
    const svgString = map.getSVG({
      radius: 0.22,
      color: '#423B38', // Dark grey dots for continents
      shape: 'circle',
      backgroundColor: '#020300' // Very dark background
    });

    setSvgMap(svgString);
  }, []);

  if (!svgMap) {
    return (
      <div 
        className="w-full flex justify-center"
        style={{
          marginTop: 20,
          marginBottom: 40,
          height: 400,
          backgroundColor: '#020300',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ color: '#fff', fontSize: '14px' }}>Loading world map...</div>
      </div>
    );
  }

  return (
    <div 
      className="w-full flex justify-center"
      style={{
        marginTop: 20,
        marginBottom: 40
      }}
    >
      <div
        style={{
          backgroundColor: '#020300',
          borderRadius: '8px',
          padding: '20px',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: svgMap }}
          style={{
            width: '800px',
            height: '400px'
          }}
        />
      </div>
    </div>
  );
};

export default DottedWorldMap;
