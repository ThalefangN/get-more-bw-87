
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Car, MapPin, Loader } from 'lucide-react';
import { toast } from 'sonner';

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

const DEFAULT_CENTER = { lat: -24.6282, lng: 25.9231 };

// Updated Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoidGhhbGVmYW5nbiIsImEiOiJjbTduZWxmeGcwMGVsMmpxdHdnNDE5eWV5In0.3vBZkIw59Js0YIlogvKuzQ';

const MapDisplay = ({ drivers = [], userLocation: initialUserLocation, onDriverClick, height = "400px" }: MapDisplayProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(initialUserLocation || DEFAULT_CENTER);
  const [geolocating, setGeolocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const routeLinesRef = useRef<mapboxgl.Map['id'] | null[]>([]);
  const driverProfilesRef = useRef<HTMLDivElement[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const animationRef = useRef<number | null>(null);

  // Clean up function to safely remove markers, route lines and event listeners
  const cleanupMapResources = useCallback(() => {
    try {
      // Clear all markers
      if (markersRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          if (marker) {
            try {
              marker.remove();
            } catch (e) {
              console.error('Error removing marker during cleanup:', e);
            }
          }
        });
        markersRef.current = [];
      }

      // Remove animation frame if it exists
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      // Remove route lines if they exist
      if (map.current && routeLinesRef.current.length > 0) {
        routeLinesRef.current.forEach(id => {
          if (id && map.current?.getLayer(id)) {
            try {
              map.current.removeLayer(id);
              map.current.removeSource(id);
            } catch (e) {
              console.error('Error removing route layer/source:', e);
            }
          }
        });
        routeLinesRef.current = [];
      }

      // Remove the map instance safely
      if (map.current) {
        try {
          // Check if map container element still exists before trying to remove the map
          if (mapContainer.current && document.body.contains(mapContainer.current)) {
            map.current.remove();
          } else {
            console.log('Map container no longer in DOM, skipping map.remove()');
          }
        } catch (e) {
          console.error('Error during map removal:', e);
        }
        map.current = null;
      }
    } catch (error) {
      console.error('Error during map cleanup:', error);
    }
  }, []);

  useEffect(() => {
    if (!initialUserLocation) {
      setGeolocating(true);
      if ('geolocation' in navigator) {
        toast.info("Location access required", {
          description: "Please allow access to your location for better experience"
        });

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(userPos);
            setGeolocating(false);
            
            if (map.current && mapLoaded) {
              map.current.flyTo({
                center: [userPos.lng, userPos.lat] as [number, number],
                zoom: 14,
                essential: true
              });
            }
            
            toast.success("Location found", {
              description: "Using your current location"
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            setLocationError('Could not access your location. Using default position.');
            setGeolocating(false);
            toast.error("Location error", {
              description: "Using default location instead"
            });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setLocationError('Geolocation is not supported by your browser. Using default position.');
        setGeolocating(false);
        toast.error("Location not supported", {
          description: "Your browser doesn't support location services"
        });
      }
    }
  }, [initialUserLocation, mapLoaded]);

  // Function to draw route between driver and user
  const drawRoute = useCallback((driverId: number, driverCoords: [number, number], userCoords: [number, number]) => {
    if (!map.current || !mapLoaded) return;
    
    const sourceId = `route-source-${driverId}`;
    const layerId = `route-layer-${driverId}`;
    
    // Check if source already exists and remove it
    if (map.current.getSource(sourceId)) {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      map.current.removeSource(sourceId);
    }
    
    // Add the route line
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [driverCoords, userCoords]
        }
      }
    });
    
    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#4285F4',
        'line-width': 4,
        'line-opacity': 0.8,
        'line-dasharray': [0, 2]
      }
    });
    
    // Add to refs for cleanup
    routeLinesRef.current.push(layerId);
    routeLinesRef.current.push(sourceId);
    
    // Animate the dash pattern for moving effect
    let dashArraySequence = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5]
    ];
    
    let step = 0;
    
    function animateDashArray(timestamp: number) {
      if (!map.current || !map.current.getLayer(layerId)) return;
      
      // Update the dasharray
      map.current.setPaintProperty(
        layerId,
        'line-dasharray',
        dashArraySequence[step % dashArraySequence.length]
      );
      
      step = (step + 1) % dashArraySequence.length;
      animationRef.current = window.requestAnimationFrame(animateDashArray);
    }
    
    animationRef.current = window.requestAnimationFrame(animateDashArray);
  }, [mapLoaded]);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Cleanup any existing map resources first
    cleanupMapResources();
    
    // Set the token and initialize map with error handling
    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      console.log("Initializing map with center:", [userLocation.lng, userLocation.lat]);
      
      const centerCoordinates: [number, number] = [userLocation.lng, userLocation.lat];
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: centerCoordinates,
        zoom: 13,
        attributionControl: false,
        failIfMajorPerformanceCaveat: false
      });

      map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-right');
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      map.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        
        const userMarkerEl = document.createElement('div');
        userMarkerEl.className = 'relative';
        userMarkerEl.innerHTML = `
          <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white z-10 relative">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div class="absolute top-0 left-0 w-12 h-12 -mt-3 -ml-3 bg-blue-500 rounded-full animate-ping opacity-60"></div>
        `;
        
        if (map.current) {
          new mapboxgl.Marker({ element: userMarkerEl })
            .setLngLat([userLocation.lng, userLocation.lat] as [number, number])
            .addTo(map.current);
        
          addDriverMarkers();
        }
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapLoaded(false);
        setLocationError('Error loading map. Please try again later.');
        toast.error("Map error", {
          description: "Couldn't load the map. Please check your internet connection and try again."
        });
      });
    } catch (error) {
      console.error('Error initializing Mapbox map:', error);
      setMapLoaded(false);
      setLocationError('Failed to initialize map. Please reload the page.');
      toast.error("Map initialization failed", {
        description: "Please check your internet connection and try again"
      });
    }

    // Cleanup function with safety checks
    return cleanupMapResources;
  }, [userLocation, cleanupMapResources]);

  useEffect(() => {
    if (map.current && mapLoaded) {
      addDriverMarkers();
    }
  }, [drivers, mapLoaded]);

  // Effect to update route when selected driver changes
  useEffect(() => {
    if (selectedDriver && map.current && mapLoaded) {
      const driverCoords: [number, number] = [selectedDriver.lng, selectedDriver.lat];
      const userCoords: [number, number] = [userLocation.lng, userLocation.lat];
      drawRoute(selectedDriver.id, driverCoords, userCoords);
    }
  }, [selectedDriver, mapLoaded, userLocation, drawRoute]);

  const addDriverMarkers = () => {
    if (!map.current) return;
    
    // Clear existing markers first
    markersRef.current.forEach(marker => {
      if (marker) {
        try {
          marker.remove();
        } catch (e) {
          console.error('Error removing marker during update:', e);
        }
      }
    });
    markersRef.current = [];
    
    drivers.forEach(driver => {
      try {
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
            ${driver.id === selectedDriver?.id ? `
            <div class="absolute -top-28 w-44 bg-white p-2 rounded-md shadow-lg z-20 left-1/2 transform -translate-x-1/2">
              <div class="flex flex-col items-center">
                <img src="${driver.image}" alt="${driver.name}" class="w-12 h-12 rounded-full border-2 border-getmore-purple object-cover" />
                <div class="text-center mt-1">
                  <div class="font-bold">${driver.name}</div>
                  <div class="text-sm text-gray-500">${driver.car}</div>
                  <div class="flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="yellow" stroke="orange" stroke-width="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span class="text-sm ml-1">${driver.rating}/5</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-white"></div>
            ` : ''}
            <div class="absolute -bottom-1 w-6 h-1 bg-black/20 rounded-full mx-auto left-0 right-0"></div>
          </div>
        `;
        
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
        
        const driverCoordinates: [number, number] = [driver.lng, driver.lat];
        
        if (map.current) {
          const marker = new mapboxgl.Marker({ element: markerEl })
            .setLngLat(driverCoordinates)
            .setPopup(popup)
            .addTo(map.current);
          
          markersRef.current.push(marker);
          
          markerEl.addEventListener('click', () => {
            // Set this driver as selected
            setSelectedDriver(driver);
            
            if (onDriverClick) {
              onDriverClick(driver);
            }
          });

          // For non-selected drivers, show popup on hover
          if (driver.id !== selectedDriver?.id) {
            markerEl.addEventListener('mouseenter', () => {
              if (map.current) {
                popup.addTo(map.current);
              }
            });

            markerEl.addEventListener('mouseleave', () => {
              popup.remove();
            });
          }
        }
      } catch (e) {
        console.error('Error adding driver marker:', e);
      }
    });
  };

  // Function to simulate car movement along the route
  const simulateCarMovement = (driverId: number) => {
    if (!map.current || !selectedDriver) return;
    
    const marker = markersRef.current.find(m => {
      const markerEl = m.getElement();
      return markerEl.querySelector('.driver-marker');
    });
    
    if (!marker) return;
    
    const startPoint = [selectedDriver.lng, selectedDriver.lat];
    const endPoint = [userLocation.lng, userLocation.lat];
    
    // Calculate points along the route
    const numPoints = 100;
    const points = Array.from({ length: numPoints }).map((_, i) => {
      const t = i / (numPoints - 1);
      return [
        startPoint[0] + (endPoint[0] - startPoint[0]) * t,
        startPoint[1] + (endPoint[1] - startPoint[1]) * t
      ] as [number, number];
    });
    
    let currentPointIndex = 0;
    
    function animate() {
      if (currentPointIndex >= points.length || !marker) {
        return;
      }
      
      marker.setLngLat(points[currentPointIndex]);
      currentPointIndex++;
      
      if (currentPointIndex < points.length) {
        setTimeout(() => {
          window.requestAnimationFrame(animate);
        }, 100); // Control speed of movement
      }
    }
    
    animate();
  };

  if (geolocating) {
    return (
      <div className="bg-gray-100 rounded-xl flex flex-col items-center justify-center" style={{ height }}>
        <Loader className="w-12 h-12 text-getmore-purple animate-spin mb-4" />
        <p>Getting your location...</p>
        <p className="text-sm text-gray-500 mt-2">Please allow location access when prompted</p>
      </div>
    );
  }

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

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height }}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      <div className="absolute bottom-4 right-4 bg-white py-2 px-4 rounded-md shadow-md text-sm z-10">
        <p className="font-medium">Available Drivers</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div><span className="text-xs">Standard</span></div>
          <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div><span className="text-xs">Comfort</span></div>
          <div className="flex items-center"><div className="w-3 h-3 bg-purple-600 rounded-full mr-1"></div><span className="text-xs">Premium</span></div>
          <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div><span className="text-xs">SUV</span></div>
        </div>
      </div>

      <div className="absolute top-4 left-4 bg-white rounded-md shadow-md z-10 p-2">
        {selectedDriver ? (
          <div className="flex items-center">
            <img src={selectedDriver.image} alt={selectedDriver.name} className="w-8 h-8 rounded-full mr-2 border border-getmore-purple" />
            <div>
              <p className="font-medium text-sm">{selectedDriver.name}</p>
              <p className="text-xs text-gray-500">{selectedDriver.car}</p>
            </div>
            <button 
              onClick={() => {
                if (selectedDriver) {
                  simulateCarMovement(selectedDriver.id);
                }
              }}
              className="ml-3 bg-getmore-purple text-white text-xs px-2 py-1 rounded hover:bg-purple-700"
            >
              Simulate
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Select a driver to see route</p>
        )}
      </div>

      <button 
        onClick={() => {
          if (map.current) {
            const centerCoordinates: [number, number] = [userLocation.lng, userLocation.lat];
            
            map.current.flyTo({
              center: centerCoordinates,
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
