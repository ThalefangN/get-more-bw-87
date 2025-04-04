
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Car, MapPin, Loader } from 'lucide-react';

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

// Default location for Gaborone if no locations provided
const DEFAULT_CENTER = { lat: -24.6282, lng: 25.9231 };

// Set your Mapbox token here - replace with your actual token from mapbox.com
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ2V0bW9yZSIsImEiOiJjbG5vbGJqbW8wYTFkMmlwMjRzanRzOGQyIn0.imMKzo-HMMj5NuoXw2j2Zw';

const MapDisplay = ({ drivers = [], userLocation: initialUserLocation, onDriverClick, height = "400px" }: MapDisplayProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(initialUserLocation || DEFAULT_CENTER);
  const [geolocating, setGeolocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get user's real location if available
  useEffect(() => {
    if (!initialUserLocation) {
      setGeolocating(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(userPos);
            setGeolocating(false);
            
            // Center map on user position if map is already initialized
            if (map.current && mapLoaded) {
              map.current.flyTo({
                center: [userPos.lng, userPos.lat],
                zoom: 14,
                essential: true
              });
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            setLocationError('Could not access your location. Using default position.');
            setGeolocating(false);
            // Continue with default location
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        setLocationError('Geolocation is not supported by your browser. Using default position.');
        setGeolocating(false);
      }
    }
  }, [initialUserLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Use the pre-configured token
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      const center = [userLocation.lng, userLocation.lat];
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // You can change this style as needed
        center: center,
        zoom: 13,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add user location marker and drivers when map loads
      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Add pulsating user marker
        const userMarkerEl = document.createElement('div');
        userMarkerEl.className = 'relative';
        userMarkerEl.innerHTML = `
          <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white z-10 relative">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div class="absolute top-0 left-0 w-12 h-12 -mt-3 -ml-3 bg-blue-500 rounded-full animate-ping opacity-60"></div>
        `;
        
        new mapboxgl.Marker({ element: userMarkerEl })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map.current!);
        
        // Add driver markers
        addDriverMarkers();
      });
    } catch (error) {
      console.error('Error initializing Mapbox map:', error);
      setMapLoaded(false);
    }

    // Cleanup
    return () => {
      if (map.current) map.current.remove();
    };
  }, [userLocation]); // Reinitialize map when user location changes

  // Add driver markers whenever drivers array changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      addDriverMarkers();
    }
  }, [drivers, mapLoaded]);

  const addDriverMarkers = () => {
    if (!map.current) return;
    
    // Remove existing markers first to avoid duplicates
    const existingMarkers = document.querySelectorAll('.driver-marker');
    existingMarkers.forEach(marker => marker.remove());
    
    // Add driver markers
    drivers.forEach(driver => {
      const markerEl = document.createElement('div');
      markerEl.className = 'driver-marker';
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
      
      // Create a car icon with shadow and animation
      markerEl.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 rounded-full ${color} flex items-center justify-center border-2 border-white cursor-pointer hover:scale-110 transition-transform shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white transform rotate-${Math.floor(Math.random() * 360)}">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle>
              <path d="M9 17h6"></path>
              <circle cx="17" cy="17" r="2"></circle>
            </svg>
          </div>
          <div class="absolute -bottom-1 w-6 h-1 bg-black/20 rounded-full mx-auto left-0 right-0"></div>
        </div>
      `;
      
      // Add popup with driver info
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <div class="flex items-center">
            <img src="${driver.image}" alt="${driver.name}" class="w-12 h-12 rounded-full mr-3 border-2 border-getmore-purple object-cover" />
            <div>
              <div class="font-bold">${driver.name}</div>
              <div class="flex items-center">
                <Car size={14} class="mr-1 text-getmore-purple" />
                <span class="text-gray-500 text-sm">${driver.car}</span>
              </div>
              <div class="flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="yellow" stroke="orange" stroke-width="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span class="text-sm ml-1">${driver.rating}/5</span>
              </div>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-gray-100">
            <button class="w-full bg-getmore-purple text-white py-1 px-2 rounded-md text-sm hover:bg-purple-700 transition-colors">
              Select Driver
            </button>
          </div>
        </div>
      `);
      
      // Create marker and add to map
      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([driver.lng, driver.lat])
        .setPopup(popup)
        .addTo(map.current!);
      
      // Add click handler to both marker element and select button
      markerEl.addEventListener('click', () => {
        if (onDriverClick) {
          onDriverClick(driver);
        }
      });

      // Show popup on hover
      markerEl.addEventListener('mouseenter', () => {
        popup.addTo(map.current!);
      });

      markerEl.addEventListener('mouseleave', () => {
        popup.remove();
      });
    });
  };

  // Display loading state while initializing geolocation
  if (geolocating) {
    return (
      <div className="bg-gray-100 rounded-xl flex flex-col items-center justify-center" style={{ height }}>
        <Loader className="w-12 h-12 text-getmore-purple animate-spin mb-4" />
        <p>Getting your location...</p>
        <p className="text-sm text-gray-500 mt-2">Please allow location access when prompted</p>
      </div>
    );
  }

  // Display error state if there was a geolocation error
  if (locationError && !mapLoaded) {
    return (
      <div className="bg-gray-100 rounded-xl flex flex-col items-center justify-center p-6" style={{ height }}>
        <MapPin className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-center mb-4">{locationError}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-getmore-purple text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Display loading state while map initializes
  if (!mapLoaded) {
    return (
      <div className="bg-gray-100 rounded-xl flex flex-col items-center justify-center" style={{ height }}>
        <div className="w-12 h-12 border-4 border-getmore-purple border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  // Render the map container
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

      {/* Recenter button */}
      <button 
        onClick={() => {
          if (map.current) {
            map.current.flyTo({
              center: [userLocation.lng, userLocation.lat],
              zoom: 14,
              essential: true
            });
          }
        }}
        className="absolute top-20 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
        title="Center on my location"
      >
        <MapPin className="h-5 w-5 text-getmore-purple" />
      </button>
    </div>
  );
};

export default MapDisplay;
