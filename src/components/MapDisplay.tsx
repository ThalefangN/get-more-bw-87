
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Car } from 'lucide-react';

interface Driver {
  id: number;
  name: string;
  car: string;
  cabType: string;
  lat: number;
  lng: number;
  rating: number;
  phone: string;
  image: string;
}

interface MapDisplayProps {
  drivers?: Driver[];
  userLocation?: { lat: number; lng: number };
  onDriverClick?: (driver: Driver) => void;
  height?: string;
}

// Default mock locations for Gaborone if no locations provided
const DEFAULT_CENTER = { lat: -24.6282, lng: 25.9231 };

const MapDisplay = ({ drivers = [], userLocation = DEFAULT_CENTER, onDriverClick, height = "400px" }: MapDisplayProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    // Check for token in localStorage first
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
      setShowTokenInput(false);
    }
  }, []);

  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mapboxToken) {
      localStorage.setItem('mapbox_token', mapboxToken);
      setShowTokenInput(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || showTokenInput) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [userLocation.lng, userLocation.lat],
        zoom: 13,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add user location marker
      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Add user marker
        const userMarkerEl = document.createElement('div');
        userMarkerEl.className = 'w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white';
        userMarkerEl.innerHTML = '<div class="w-2 h-2 bg-white rounded-full"></div>';
        
        new mapboxgl.Marker({ element: userMarkerEl })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map.current!);
        
        // Add driver markers
        drivers.forEach(driver => {
          const markerEl = document.createElement('div');
          let color = '';
          
          switch (driver.cabType) {
            case 'standard':
              color = 'bg-blue-500';
              break;
            case 'comfort':
              color = 'bg-green-500';
              break;
            case 'premium':
              color = 'bg-purple-600';
              break;
            case 'suv':
              color = 'bg-orange-500';
              break;
            default:
              color = 'bg-gray-500';
          }
          
          markerEl.className = `w-8 h-8 rounded-full ${color} flex items-center justify-center border-2 border-white cursor-pointer hover:scale-110 transition-transform`;
          markerEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>';
          
          // Add popup
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <div class="flex items-center">
                <img src="${driver.image}" alt="${driver.name}" class="w-8 h-8 rounded-full mr-2 object-cover" />
                <div>
                  <div class="font-medium text-sm">${driver.name}</div>
                  <div class="text-xs text-gray-500">${driver.car}</div>
                </div>
              </div>
              <div class="mt-1 text-xs">Rating: ${driver.rating}/5</div>
            </div>
          `);
          
          const marker = new mapboxgl.Marker({ element: markerEl })
            .setLngLat([driver.lng, driver.lat])
            .setPopup(popup)
            .addTo(map.current!);
          
          // Add click handler
          markerEl.addEventListener('click', () => {
            if (onDriverClick) {
              onDriverClick(driver);
            }
          });
        });
      });
    } catch (error) {
      console.error('Error initializing Mapbox map:', error);
      setMapLoaded(false);
    }

    // Cleanup
    return () => {
      if (map.current) map.current.remove();
    };
  }, [drivers, userLocation, mapboxToken, showTokenInput, onDriverClick]);

  if (showTokenInput) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col justify-center items-center">
        <Car size={48} className="text-getmore-purple mb-4" />
        <h3 className="text-xl font-bold mb-2">Mapbox Token Required</h3>
        <p className="text-gray-600 text-center mb-4">To display the interactive map, please enter your Mapbox public token:</p>
        
        <form onSubmit={handleTokenSubmit} className="w-full max-w-md">
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              placeholder="Enter Mapbox public token"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-getmore-purple"
              required
            />
            <button 
              type="submit" 
              className="bg-getmore-purple text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Save and Load Map
            </button>
          </div>
        </form>
        
        <p className="text-xs text-gray-500 mt-4 text-center">
          You can get a free Mapbox public token by signing up at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-getmore-purple underline">mapbox.com</a>
        </p>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="bg-gray-100 rounded-xl flex flex-col items-center justify-center" style={{ height }}>
        <div className="w-12 h-12 border-4 border-getmore-purple border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height }}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white py-2 px-4 rounded-md shadow-md text-sm z-10">
        <p className="font-medium">Available Drivers</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div><span className="text-xs">Standard</span></div>
          <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div><span className="text-xs">Comfort</span></div>
          <div className="flex items-center"><div className="w-3 h-3 bg-purple-600 rounded-full mr-1"></div><span className="text-xs">Premium</span></div>
          <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div><span className="text-xs">SUV</span></div>
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;
