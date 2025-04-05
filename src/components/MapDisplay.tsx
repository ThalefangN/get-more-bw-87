
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Car, MapPin, Loader, X, User } from 'lucide-react';
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
  simulateArrival?: boolean;
}

const DEFAULT_CENTER = { lat: -24.6282, lng: 25.9231 };

// Updated Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoidGhhbGVmYW5nbiIsImEiOiJjbTduZWxmeGcwMGVsMmpxdHdnNDE5eWV5In0.3vBZkIw59Js0YIlogvKuzQ';

// Additional sample drivers to populate the map
const additionalDrivers: Driver[] = [
  { id: 101, name: "Mpho Kgosidintsi", car: "Toyota Corolla", cabType: 'comfort', lat: -24.6392, lng: 25.9131, rating: 4.7, phone: "+267 71112233", image: "https://randomuser.me/api/portraits/men/42.jpg" },
  { id: 102, name: "Gorata Tlotleng", car: "Honda Fit", cabType: 'standard', lat: -24.6182, lng: 25.9431, rating: 4.8, phone: "+267 72223344", image: "https://randomuser.me/api/portraits/women/35.jpg" },
  { id: 103, name: "Kagiso Molefhi", car: "BMW 5 Series", cabType: 'premium', lat: -24.6452, lng: 25.9031, rating: 4.9, phone: "+267 73334455", image: "https://randomuser.me/api/portraits/men/64.jpg" },
  { id: 104, name: "Naledi Moremi", car: "Toyota Fortuner", cabType: 'suv', lat: -24.6352, lng: 25.9531, rating: 4.7, phone: "+267 74445566", image: "https://randomuser.me/api/portraits/women/52.jpg" },
  { id: 105, name: "Thabo Seretse", car: "Mazda 3", cabType: 'comfort', lat: -24.6082, lng: 25.9131, rating: 4.6, phone: "+267 75556677", image: "https://randomuser.me/api/portraits/men/18.jpg" },
];

const MapDisplay = ({ 
  drivers = [], 
  userLocation: initialUserLocation, 
  onDriverClick, 
  height = "400px",
  simulateArrival = false 
}: MapDisplayProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(initialUserLocation || DEFAULT_CENTER);
  const [geolocating, setGeolocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routeLinesRef = useRef<string[]>([]);
  const driverProfilesRef = useRef<HTMLDivElement[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const animationRef = useRef<number | null>(null);
  const [driverArrived, setDriverArrived] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const routePointsRef = useRef<[number, number][]>([]);
  const currentPointIndexRef = useRef(0);
  const [showProfile, setShowProfile] = useState(true);
  // Combine provided drivers with additional sample drivers
  const allDrivers = [...drivers, ...additionalDrivers];

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
          if (id && map.current) {
            try {
              if (map.current.getLayer(id)) {
                map.current.removeLayer(id);
              }
              if (map.current.getSource(id)) {
                map.current.removeSource(id);
              }
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

  // Enhanced function to draw route between driver and user
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

    // Calculate bezier curve points for a more natural path
    const numPoints = 100;
    const points: [number, number][] = [];
    
    // Midpoint calculation for bezier control point
    const midX = (driverCoords[0] + userCoords[0]) / 2;
    const midY = (driverCoords[1] + userCoords[1]) / 2;
    
    // Add slight offset to make curve look more like a road path
    const offsetX = (driverCoords[1] - userCoords[1]) * 0.2; // perpendicular offset
    const controlPoint: [number, number] = [midX + offsetX, midY];
    
    // Generate bezier curve points
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      
      // Quadratic bezier curve formula
      const x = Math.pow(1-t, 2) * driverCoords[0] + 
               2 * (1-t) * t * controlPoint[0] + 
               Math.pow(t, 2) * userCoords[0];
               
      const y = Math.pow(1-t, 2) * driverCoords[1] + 
               2 * (1-t) * t * controlPoint[1] + 
               Math.pow(t, 2) * userCoords[1];
      
      points.push([x, y]);
    }
    
    // Store points for animation
    routePointsRef.current = points;
    
    // Add the route line with enhanced styling
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: points
        }
      }
    });
    
    // Add the main route line with bold styling
    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#6528F7', // GetMore purple
        'line-width': 6,         // Bold line
        'line-opacity': 0.8,
      }
    });
    
    // Add to refs for cleanup - store the string IDs
    routeLinesRef.current.push(layerId);
    routeLinesRef.current.push(sourceId);
    
    return points;
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
        
        // Add user marker with pulsing effect and user icon
        const userMarkerEl = document.createElement('div');
        userMarkerEl.className = 'relative';
        userMarkerEl.innerHTML = `
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white z-10 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="absolute top-0 left-0 w-12 h-12 -mt-2 -ml-2 bg-blue-500 rounded-full animate-ping opacity-60"></div>
          <div class="absolute -bottom-1 w-6 h-1 bg-black/20 rounded-full mx-auto left-0 right-0"></div>
        `;
        
        if (map.current) {
          const userMarker = new mapboxgl.Marker({ element: userMarkerEl })
            .setLngLat([userLocation.lng, userLocation.lat] as [number, number])
            .addTo(map.current);
          
          userMarkerRef.current = userMarker;
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
  }, [allDrivers, mapLoaded, showProfile]);

  // Effect to update route when selected driver changes
  useEffect(() => {
    if (selectedDriver && map.current && mapLoaded) {
      const driverCoords: [number, number] = [selectedDriver.lng, selectedDriver.lat];
      const userCoords: [number, number] = [userLocation.lng, userLocation.lat];
      drawRoute(selectedDriver.id, driverCoords, userCoords);
    }
  }, [selectedDriver, mapLoaded, userLocation, drawRoute]);

  // Effect to auto-simulate arrival when prop is set
  useEffect(() => {
    if (simulateArrival && selectedDriver && !simulationActive && mapLoaded) {
      simulateCarMovement(selectedDriver.id);
    }
  }, [simulateArrival, selectedDriver, simulationActive, mapLoaded]);

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
    
    allDrivers.forEach(driver => {
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
            ${driver.id === selectedDriver?.id && showProfile ? `
            <div class="absolute -top-28 w-44 bg-white p-2 rounded-md shadow-lg z-20 left-1/2 transform -translate-x-1/2">
              <div class="absolute top-1 right-1 cursor-pointer hover:bg-gray-100 p-1 rounded-full z-50" onclick="window.hideDriverProfile(${driver.id})">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
                </svg>
              </div>
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
          
          if (driver.id === selectedDriver?.id) {
            driverMarkerRef.current = marker;
          }
          
          markerEl.addEventListener('click', () => {
            // Set this driver as selected
            setSelectedDriver(driver);
            setShowProfile(true); // Show profile when selecting a driver
            
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

  // Function to hide driver profile
  const hideDriverProfile = (driverId: number) => {
    if (selectedDriver?.id === driverId) {
      setShowProfile(false);
    }
  };

  // Add the function to the window object so the onclick handler can access it
  useEffect(() => {
    // @ts-ignore - Adding custom function to window
    window.hideDriverProfile = hideDriverProfile;
    
    return () => {
      // @ts-ignore - Clean up
      delete window.hideDriverProfile;
    };
  }, [selectedDriver]);

  // Enhanced function to simulate car movement along the route with arrival notification
  const simulateCarMovement = (driverId: number) => {
    if (!map.current || !selectedDriver) return;

    // Set simulation active flag
    setSimulationActive(true);
    setDriverArrived(false);
    
    // Reset current point index
    currentPointIndexRef.current = 0;
    
    // Create new car marker element
    const carMarkerEl = document.createElement('div');
    carMarkerEl.className = 'car-marker-animated';
    carMarkerEl.innerHTML = `
      <div class="relative">
        <div class="w-10 h-10 rounded-full bg-getmore-purple flex items-center justify-center border-2 border-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
        </div>
        <div class="absolute -bottom-1 w-8 h-2 bg-black/20 rounded-full mx-auto left-0 right-0"></div>
      </div>
    `;
    
    // Remove previous driver marker if exists
    if (driverMarkerRef.current) {
      driverMarkerRef.current.remove();
    }
    
    // Create new animated car marker
    const animatedCarMarker = new mapboxgl.Marker({ element: carMarkerEl })
      .setLngLat(routePointsRef.current[0])
      .addTo(map.current);
    
    driverMarkerRef.current = animatedCarMarker;
    
    // Calculate bearing between points for rotation
    const calculateBearing = (startPoint: [number, number], endPoint: [number, number]): number => {
      const startLat = startPoint[1] * Math.PI / 180;
      const startLng = startPoint[0] * Math.PI / 180;
      const endLat = endPoint[1] * Math.PI / 180;
      const endLng = endPoint[0] * Math.PI / 180;
      
      const y = Math.sin(endLng - startLng) * Math.cos(endLat);
      const x = Math.cos(startLat) * Math.sin(endLat) - 
                Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
      
      let bearing = Math.atan2(y, x) * 180 / Math.PI;
      bearing = (bearing + 360) % 360; // Normalize to 0-360
      
      return bearing;
    };
    
    // Animate car along route
    const animateCar = () => {
      if (currentPointIndexRef.current >= routePointsRef.current.length - 1) {
        // Car has arrived at destination
        if (!driverArrived) {
          setDriverArrived(true);
          setSimulationActive(false);
          // Play notification sound (small beep)
          const audio = new Audio('data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vm//Lz////zs///Oc///nP//8L///yH5BAEAAAEALAAAAAAQABAAAAeCEAEUhDAQolB4Ew8QEVZCwkBkokgVPlkKd8qkKvNlCkYhDwNhGGQMDJ6GGAOlhBkDQsEwoKViGFAIZW+KgpCNhmuMwICQwz5TDQaTxeCEBIYSwnAEJYZChdDY2JgwwkDBMAQlhkLr7OzsQhUSDINK5+fn8xjDf+iIubq5Eri5ucTDxMTIvsjIyiEAOw==');
          audio.play();
          
          toast.success("Your driver has arrived!", {
            description: `${selectedDriver?.name} has reached your location`
          });
          
          // Make the user marker pulse more intensely to indicate arrival
          if (userMarkerRef.current) {
            const userEl = userMarkerRef.current.getElement();
            userEl.querySelector('.animate-ping')?.classList.add('opacity-90', 'scale-125');
          }
          
          return;
        }
      }

      // Get current and next points
      const currentPoint = routePointsRef.current[currentPointIndexRef.current];
      const nextPoint = routePointsRef.current[currentPointIndexRef.current + 1];
      
      if (currentPoint && nextPoint) {
        // Calculate bearing for car rotation
        const bearing = calculateBearing(currentPoint, nextPoint);
        
        // Update car position and rotation
        animatedCarMarker.setLngLat(currentPoint);
        
        // Rotate car icon in direction of travel
        const carEl = animatedCarMarker.getElement().querySelector('svg');
        if (carEl) {
          carEl.style.transform = `rotate(${bearing}deg)`;
        }
        
        // Move map to follow car if it's out of view
        if (map.current && currentPointIndexRef.current % 10 === 0) {
          map.current.easeTo({
            center: currentPoint,
            duration: 1000,
            easing: (t) => t
          });
        }
        
        // Move to next point
        currentPointIndexRef.current++;
        
        // Continue animation at appropriate speed (slower at beginning and end)
        const totalPoints = routePointsRef.current.length;
        const progress = currentPointIndexRef.current / totalPoints;
        
        // Ease in/out timing for more natural movement
        let delay = 100; // Base delay in ms
        
        if (progress < 0.2) {
          // Slow at beginning (acceleration)
          delay = 200 - progress * 500;
        } else if (progress > 0.8) {
          // Slow at end (deceleration)
          delay = 100 + (progress - 0.8) * 500;
        }
        
        setTimeout(() => {
          if (!driverArrived) {
            animationRef.current = requestAnimationFrame(animateCar);
          }
        }, delay);
      }
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animateCar);
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
            <div className="flex ml-2 gap-2">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded transition-colors"
              >
                {showProfile ? 'Hide' : 'Show'} Profile
              </button>
              <button 
                onClick={() => simulateCarMovement(selectedDriver.id)}
                disabled={simulationActive}
                className={`${simulationActive ? 'bg-gray-300' : 'bg-getmore-purple'} text-white text-xs px-2 py-1 rounded hover:bg-purple-700 transition-colors`}
              >
                {simulationActive ? 'En Route' : 'Simulate'}
              </button>
            </div>
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

      {driverArrived && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-xl z-50 animate-scale-in">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Car className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-bold">Driver Arrived!</h3>
            <p className="text-gray-600">{selectedDriver?.name} has reached your location</p>
            <button 
              onClick={() => setDriverArrived(false)}
              className="mt-3 bg-getmore-purple text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;

