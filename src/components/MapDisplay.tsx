import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Car, MapPin, Loader, X, User, Navigation2, AlertCircle } from 'lucide-react';
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
  userLocation?: { lat: number; lng: number };
}

interface MapDisplayProps {
  drivers?: Driver[];
  userLocation?: { lat: number; lng: number };
  onDriverClick?: (driver: Driver) => void;
  height?: string;
  simulateArrival?: boolean;
  showFullScreenButton?: boolean;
}

const DEFAULT_CENTER = { lat: -24.6282, lng: 25.9231 };

const MAPBOX_TOKEN = 'pk.eyJ1IjoidGhhbGVmYW5nbiIsImEiOiJjbTduZWxmeGcwMGVsMmpxdHdnNDE5eWV5In0.3vBZkIw59Js0YIlogvKuzQ';

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
  simulateArrival = false,
  showFullScreenButton = true
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
  const allDrivers = [...drivers, ...additionalDrivers];
  
  const [journeyProgress, setJourneyProgress] = useState(0);
  const lastUpdateTimeRef = useRef<number>(0);
  const simulationStartTimeRef = useRef<number>(0);
  const SIMULATION_DURATION_MS = 120000;
  const [userLocationPermission, setUserLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const userMarkerIsFixed = useRef(true);

  const cleanupMapResources = useCallback(() => {
    try {
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

      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

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

      if (map.current) {
        try {
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
        if (navigator.permissions) {
          navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
            setUserLocationPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
            
            if (permissionStatus.state === 'granted') {
              getUserLocation();
            } else if (permissionStatus.state === 'prompt') {
              toast.info("Location access required", {
                description: "Please allow access to your location for cab booking",
                duration: 5000
              });
              getUserLocation();
            } else {
              setLocationError('Location access denied. Please enable location services.');
              setGeolocating(false);
              toast.error("Location access denied", {
                description: "Please enable location services in your browser settings",
                duration: 5000
              });
            }
            
            permissionStatus.onchange = () => {
              setUserLocationPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
              if (permissionStatus.state === 'granted') {
                getUserLocation();
              }
            };
          });
        } else {
          getUserLocation();
        }
      } else {
        setLocationError('Geolocation is not supported by your browser. Using default position.');
        setGeolocating(false);
        toast.error("Location not supported", {
          description: "Your browser doesn't support location services"
        });
      }
    }
  }, [initialUserLocation]);

  const getUserLocation = () => {
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
          
          if (userMarkerRef.current) {
            userMarkerRef.current.setLngLat([userPos.lng, userPos.lat]);
          }
          
          if (selectedDriver && !simulationActive) {
            const driverCoords: [number, number] = [selectedDriver.lng, selectedDriver.lat];
            const userCoords: [number, number] = [userPos.lng, userPos.lat];
            drawRoute(selectedDriver.id, driverCoords, userCoords);
          }
        }
        
        toast.success("Location found", {
          description: "Using your current location"
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Could not access your location. Using default position.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Using default position.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Using default position.';
            break;
        }
        
        setLocationError(errorMessage);
        setGeolocating(false);
        toast.error("Location error", {
          description: errorMessage
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const drawRoute = useCallback(async (driverId: number, driverCoords: [number, number], userCoords: [number, number]) => {
    if (!map.current || !mapLoaded) return;
    
    const sourceId = `route-source-${driverId}`;
    const layerId = `route-layer-${driverId}`;
    
    if (map.current.getSource(sourceId)) {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      map.current.removeSource(sourceId);
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${driverCoords[0]},${driverCoords[1]};${userCoords[0]},${userCoords[1]}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      
      const data = await response.json();
      
      if (data.code !== 'Ok' || !data.routes || !data.routes[0]) {
        console.error('No route found:', data);
        throw new Error('No route found');
      }
      
      const route = data.routes[0];
      const routeCoordinates = route.geometry.coordinates;
      
      routePointsRef.current = routeCoordinates;
      
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
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
          'line-color': '#1E90FF',
          'line-width': 5,
          'line-opacity': 0.85,
        }
      });
      
      routeLinesRef.current.push(layerId);
      routeLinesRef.current.push(sourceId);
      
      return routeCoordinates;
    } catch (error) {
      console.error('Error fetching route:', error);
      
      const numPoints = 200;
      const points: [number, number][] = [];
      
      const midX = (driverCoords[0] + userCoords[0]) / 2;
      const midY = (driverCoords[1] + userCoords[1]) / 2;
      
      const distance = Math.sqrt(
        Math.pow(userCoords[0] - driverCoords[0], 2) + 
        Math.pow(userCoords[1] - driverCoords[1], 2)
      );
      
      const offsetScale = distance * 0.25;
      const jitter = distance * 0.05;
      const randomOffset = (Math.random() - 0.5) * jitter;
      
      const dx = userCoords[0] - driverCoords[0];
      const dy = userCoords[1] - driverCoords[1];
      const perpX = -dy;
      const perpY = dx;
      
      const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
      const normPerpX = perpX / perpLength;
      const normPerpY = perpY / perpLength;
      
      const offsetX = normPerpX * offsetScale + randomOffset;
      const offsetY = normPerpY * offsetScale + randomOffset;
      
      const controlPoint1: [number, number] = [
        midX + offsetX * 0.8, 
        midY + offsetY * 0.8
      ];
      
      const controlPoint2: [number, number] = [
        midX + offsetX * 0.3, 
        midY + offsetY * 0.3
      ];
      
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        
        const omt = 1 - t;
        const omt2 = omt * omt;
        const omt3 = omt2 * omt;
        const t2 = t * t;
        const t3 = t2 * t;
        
        const x = omt3 * driverCoords[0] + 
                  3 * omt2 * t * controlPoint1[0] + 
                  3 * omt * t2 * controlPoint2[0] + 
                  t3 * userCoords[0];
                  
        const y = omt3 * driverCoords[1] + 
                  3 * omt2 * t * controlPoint1[1] + 
                  3 * omt * t2 * controlPoint2[1] + 
                  t3 * userCoords[1];
        
        points.push([x, y]);
      }
      
      routePointsRef.current = points;
      
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
      
      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#1E90FF',
          'line-width': 5,
          'line-opacity': 0.85,
        }
      });
      
      routeLinesRef.current.push(layerId);
      routeLinesRef.current.push(sourceId);
      
      toast.error("Using simplified route", {
        description: "Couldn't load road route, using approximate path"
      });
      
      return points;
    }
  }, [mapLoaded]);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    cleanupMapResources();
    
    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      console.log("Initializing map with center:", [userLocation.lng, userLocation.lat]);
      
      const centerCoordinates: [number, number] = [userLocation.lng, userLocation.lat];
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: centerCoordinates,
        zoom: 14,
        attributionControl: false,
        failIfMajorPerformanceCaveat: false,
        pitchWithRotate: true,
        dragRotate: true
      });

      map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-right');
      map.current.addControl(new mapboxgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true
      }), 'top-right');
      
      map.current.touchZoomRotate.enable();
      map.current.scrollZoom.enable();
      
      map.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        
        addUserMarker();
        addDriverMarkers();
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

    return cleanupMapResources;
  }, [userLocation, cleanupMapResources]);

  const addUserMarker = () => {
    if (!map.current) return;
    
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    
    const userMarkerEl = document.createElement('div');
    userMarkerEl.className = 'fixed-user-marker';
    userMarkerEl.innerHTML = `
      <div class="relative">
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white z-50 relative shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="absolute top-0 left-0 w-12 h-12 -mt-2 -ml-2 bg-blue-500 rounded-full animate-ping opacity-60"></div>
        <div class="absolute -bottom-1 w-6 h-1 bg-black/20 rounded-full mx-auto left-0 right-0"></div>
      </div>
    `;
    
    // Create the user marker with higher z-index to ensure it stays on top
    const userMarker = new mapboxgl.Marker({
      element: userMarkerEl,
      anchor: 'bottom',
      offset: [0, 0]
    })
    .setLngLat([userLocation.lng, userLocation.lat])
    .addTo(map.current);
    
    userMarkerRef.current = userMarker;
  };

  useEffect(() => {
    if (map.current && mapLoaded) {
      addDriverMarkers();
    }
  }, [allDrivers, mapLoaded, showProfile]);

  useEffect(() => {
    if (map.current && mapLoaded && drivers.length > 0) {
      // Set the first driver as selected if none is selected
      if (!selectedDriver) {
        setSelectedDriver(drivers[0]);
      }
      
      // Draw route between driver and user when user location changes
      if (selectedDriver && userLocation) {
        const driverCoords: [number, number] = [selectedDriver.lng, selectedDriver.lat];
        const userCoords: [number, number] = [userLocation.lng, userLocation.lat];
        drawRoute(selectedDriver.id, driverCoords, userCoords);
      }
    }
  }, [selectedDriver, mapLoaded, userLocation, drawRoute, drivers]);

  useEffect(() => {
    if (simulateArrival && selectedDriver && !simulationActive && mapLoaded) {
      simulateCarMovement(selectedDriver.id);
    }
  }, [simulateArrival, selectedDriver, simulationActive, mapLoaded]);

  // Enhanced map event handlers to keep user marker fixed
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Function to update user marker position after any map movement
    const updateUserMarkerPosition = () => {
      if (userMarkerRef.current && userMarkerIsFixed.current) {
        userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
      }
    };
    
    // Add event listeners for all map movement events
    map.current.on('zoom', updateUserMarkerPosition);
    map.current.on('drag', updateUserMarkerPosition);
    map.current.on('move', updateUserMarkerPosition);
    map.current.on('pitch', updateUserMarkerPosition);
    map.current.on('rotate', updateUserMarkerPosition);
    
    // Cleanup function with proper handler references
    return () => {
      if (map.current) {
        map.current.off('zoom', updateUserMarkerPosition);
        map.current.off('drag', updateUserMarkerPosition);
        map.current.off('move', updateUserMarkerPosition);
        map.current.off('pitch', updateUserMarkerPosition);
        map.current.off('rotate', updateUserMarkerPosition);
      }
    };
  }, [mapLoaded, userLocation]);

  const addDriverMarkers = () => {
    if (!map.current) return;
    
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
    
    // Filter out drivers from additionalDrivers if they're already in main drivers array
    const mainDriverIds = drivers.map(d => d.id);
    const filteredAdditionalDrivers = additionalDrivers.filter(d => !mainDriverIds.includes(d.id));
    
    // If we have actual drivers from props, use only those if there are any
    const driversToShow = drivers.length > 0 ? drivers : filteredAdditionalDrivers;
    
    driversToShow.forEach(driver => {
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
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
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
        
        // Ensure we have valid coordinates
        if (typeof driver.lng !== 'number' || typeof driver.lat !== 'number') {
          console.error('Invalid driver coordinates:', driver);
          return;
        }
        
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
            setSelectedDriver(driver);
            setShowProfile(true);
            if (onDriverClick) {
              onDriverClick(driver);
            }
            
            // Draw route when driver is selected
            if (map.current && mapLoaded && userLocation) {
              const driverCoords: [number, number] = [driver.lng, driver.lat];
              const userCoords: [number, number] = [userLocation.lng, userLocation.lat];
              drawRoute(driver.id, driverCoords, userCoords);
            }
          });

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
    
    // If we have a selected driver, ensure we have a route drawn to the user
    if (selectedDriver && map.current && mapLoaded && userLocation) {
      const driverCoords: [number, number] = [selectedDriver.lng, selectedDriver.lat];
      const userCoords: [number, number] = [userLocation.lng, userLocation.lat];
      drawRoute(selectedDriver.id, driverCoords, userCoords);
    }
  };

  const hideDriverProfile = (driverId: number) => {
    if (selectedDriver?.id === driverId) {
      setShowProfile(false);
    }
  };

  const showDriverProfile = (driverId: number) => {
    if (selectedDriver?.id === driverId) {
      setShowProfile(true);
    }
  };

  useEffect(() => {
    window.hideDriverProfile = hideDriverProfile;
    window.showDriverProfile = showDriverProfile;
    return () => {
      delete window.hideDriverProfile;
      delete window.showDriverProfile;
    };
  }, [selectedDriver]);

  const simulateCarMovement = (driverId: number) => {
    if (!map.current || !selectedDriver) {
      console.error("Map or selected driver not available for animation");
      return;
    }

    // Make sure we have a user location to drive to
    if (!userLocation) {
      console.error("User location not available for animation");
      toast.error("User location not available", {
        description: "Cannot simulate driver approach without a destination"
      });
      return;
    }

    // First ensure we have a route to follow
    if (!routePointsRef.current || routePointsRef.current.length === 0) {
      console.log("No route points available, generating route first...");
      
      // Get driver and user coordinates
      const driverCoords: [number, number] = [selectedDriver.lng, selectedDriver.lat];
      const userCoords: [number, number] = [userLocation.lng, userLocation.lat];
      
      // Draw the route first, then start simulation after route is available
      drawRoute(selectedDriver.id, driverCoords, userCoords).then((points) => {
        if (points && points.length > 0) {
          console.log("Route generated, starting simulation");
          startCarAnimation(driverId);
        } else {
          console.error("Failed to generate route for animation");
          toast.error("Could not generate route", {
            description: "Please try again or check your network connection"
          });
        }
      }).catch(error => {
        console.error("Error generating route:", error);
        toast.error("Route generation failed", {
          description: "Could not simulate driver movement"
        });
      });
    } else {
      startCarAnimation(driverId);
    }
  };
  
  const startCarAnimation = (driverId: number) => {
    if (!map.current || !selectedDriver) return;
    
    // Ensure routePointsRef.current has valid points
    if (!routePointsRef.current || routePointsRef.current.length === 0) {
      console.error("No route points available for animation");
      toast.error("Could not simulate driver movement", {
        description: "Route information is not available"
      });
      return;
    }
    
    setSimulationActive(true);
    setDriverArrived(false);
    setJourneyProgress(0);
    
    currentPointIndexRef.current = 0;
    simulationStartTimeRef.current = Date.now();
    
    const carMarkerEl = document.createElement('div');
    carMarkerEl.className = 'car-marker-animated';
    
    carMarkerEl.innerHTML = `
      <div class="relative">
        <div class="w-10 h-10 rounded-full bg-getmore-purple flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
        </div>
        <div class="absolute inset-0 w-12 h-12 -ml-1 -mt-1 rounded-full border-2 border-getmore-purple animate-pulse opacity-70"></div>
        <div class="absolute -bottom-1 w-8 h-2 bg-black/20 rounded-full mx-auto left-0 right-0"></div>
      </div>
    `;
    
    if (driverMarkerRef.current) {
      driverMarkerRef.current.remove();
    }
    
    // Validate the first point before using it
    const firstPoint = routePointsRef.current[0];
    if (!firstPoint || 
        !Array.isArray(firstPoint) || 
        firstPoint.length < 2 || 
        typeof firstPoint[0] !== 'number' || 
        typeof firstPoint[1] !== 'number') {
      console.error("Invalid first route point:", firstPoint);
      toast.error("Could not simulate driver movement", {
        description: "Invalid route coordinates"
      });
      return;
    }
    
    // Add the car marker at the first point of the route
    try {
      const animatedCarMarker = new mapboxgl.Marker({ element: carMarkerEl })
        .setLngLat(firstPoint)
        .addTo(map.current);
      
      driverMarkerRef.current = animatedCarMarker;
    } catch (error) {
      console.error("Error adding car marker:", error);
      toast.error("Could not add driver marker", {
        description: "Please try again later"
      });
      return;
    }
    
    const calculateBearing = (startPoint: [number, number], endPoint: [number, number]): number => {
      const startLat = startPoint[1] * Math.PI / 180;
      const startLng = startPoint[0] * Math.PI / 180;
      const endLat = endPoint[1] * Math.PI / 180;
      const endLng = endPoint[0] * Math.PI / 180;
      
      const y = Math.sin(endLng - startLng) * Math.cos(endLat);
      const x = Math.cos(startLat) * Math.sin(endLat) - 
                Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
      
      let bearing = Math.atan2(y, x) * 180 / Math.PI;
      bearing = (bearing + 360) % 360;
      
      return bearing;
    };
    
    // Make sure the user marker is visible and fixed
    if (!userMarkerRef.current && map.current) {
      addUserMarker();
    } else if (userMarkerRef.current) {
      // Make sure user marker is at the correct position
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    }

    const animateCar = () => {
      // Validate map is still available
      if (!map.current) {
        console.log("Map no longer available during animation");
        return;
      }
      
      const currentTime = Date.now();
      const elapsedTime = currentTime - simulationStartTimeRef.current;
      const progress = Math.min(elapsedTime / SIMULATION_DURATION_MS, 1);
      setJourneyProgress(Math.floor(progress * 100));
      
      if (progress >= 1) {
        if (!driverArrived) {
          // Get the user's location for the final position
          const finalPosition: [number, number] = [userLocation.lng, userLocation.lat];
          
          if (driverMarkerRef.current) {
            try {
              driverMarkerRef.current.setLngLat(finalPosition);
            } catch (error) {
              console.error("Error setting final marker position:", error);
            }
          }
          
          setDriverArrived(true);
          setSimulationActive(false);
          // Attempt to play an audio notification
          try {
            const audio = new Audio('/arrival-sound.mp3');
            audio.play().catch(e => console.log('Auto-play prevented:', e));
          } catch (e) {
            console.log("Audio playback error:", e);
          }
          
          toast.success("Driver has arrived!", {
            description: `${selectedDriver.name} has arrived at your location.`,
            duration: 5000
          });
          
          return;
        }
      }
      
      // Make sure routePointsRef.current is valid
      if (!routePointsRef.current || routePointsRef.current.length === 0) {
        console.error("Route points not available during animation");
        return;
      }
      
      const routeLength = routePointsRef.current.length - 1;
      const routeIndex = Math.min(Math.floor(progress * routeLength), routeLength);
      
      // Make sure we have valid points and index
      if (routeIndex < 0 || routeIndex >= routePointsRef.current.length) {
        console.error("Invalid route index:", routeIndex, "for length:", routePointsRef.current.length);
        return;
      }
      
      const currentPoint = routePointsRef.current[routeIndex];
      const nextPoint = routePointsRef.current[Math.min(routeIndex + 1, routePointsRef.current.length - 1)];
      
      // Validate points
      if (!currentPoint || !nextPoint || 
          !Array.isArray(currentPoint) || !Array.isArray(nextPoint) ||
          currentPoint.length < 2 || nextPoint.length < 2 ||
          typeof currentPoint[0] !== 'number' || typeof currentPoint[1] !== 'number' ||
          typeof nextPoint[0] !== 'number' || typeof nextPoint[1] !== 'number') {
        console.error("Invalid route points at index", routeIndex, currentPoint, nextPoint);
        return;
      }
      
      const bearing = calculateBearing(currentPoint, nextPoint);
      
      if (driverMarkerRef.current && map.current) {
        try {
          driverMarkerRef.current.setLngLat(currentPoint);
          
          const markerEl = driverMarkerRef.current.getElement();
          if (markerEl) {
            const carIcon = markerEl.querySelector('svg');
            if (carIcon) {
              carIcon.style.transform = `rotate(${bearing}deg)`;
            }
          }
          
          // Ensure user marker stays fixed during animation
          if (userMarkerRef.current) {
            userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
          }
        } catch (error) {
          console.error("Error updating car marker position:", error);
        }
      }
      
      if (!driverArrived) {
        animationRef.current = window.requestAnimationFrame(animateCar);
      }
    };
    
    animateCar();
  };

  const showETA = () => {
    if (!selectedDriver || !simulateArrival) return null;
    
    if (driverArrived) {
      return (
        <div className="bg-getmore-purple text-white rounded-lg p-3 absolute top-4 left-1/2 transform -translate-x-1/2 shadow-lg z-40">
          <div className="flex items-center">
            <Car size={18} className="mr-2" />
            <span>Driver has arrived!</span>
          </div>
        </div>
      );
    }
    
    if (simulationActive) {
      const remainingPercent = 100 - journeyProgress;
      const minutesRemaining = Math.ceil((remainingPercent / 100) * (SIMULATION_DURATION_MS / 60000));
      
      return (
        <div className="bg-white rounded-lg p-3 absolute top-4 left-1/2 transform -translate-x-1/2 shadow-lg z-40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center">
              <Car size={18} className="mr-2 text-getmore-purple" />
              <span>
                {minutesRemaining <= 1 
                  ? 'Arriving now' 
                  : `Arriving in ${minutesRemaining} min`}
              </span>
            </div>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-getmore-purple" 
                style={{ width: `${journeyProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const renderToggleProfileButton = () => {
    if (!selectedDriver) return null;
    
    return (
      <div className="absolute bottom-4 right-4 z-40">
        <button 
          onClick={() => setShowProfile(!showProfile)}
          className="bg-getmore-purple text-white px-3 py-2 rounded-lg shadow-lg flex items-center"
        >
          {showProfile ? (
            <>
              <X size={16} className="mr-1" />
              <span>Hide Driver Profile</span>
            </>
          ) : (
            <>
              <User size={16} className="mr-1" />
              <span>Show Driver Profile</span>
            </>
          )}
        </button>
      </div>
    );
  };

  const renderRecenterButton = () => {
    if (!mapLoaded || userLocationPermission === 'denied') return null;
    
    return (
      <div className="absolute bottom-4 left-4 z-40">
        <button 
          onClick={getUserLocation}
          className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center"
        >
          <Navigation2 size={16} className="mr-1" />
          <span>Recenter Location</span>
        </button>
      </div>
    );
  };

  return (
    <div className="relative" style={{ height }}>
      {locationError && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-gray-100 bg-opacity-80 rounded-lg">
          <div className="text-center p-4 bg-white rounded-lg shadow-lg">
            <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
            <p className="text-gray-700">{locationError}</p>
            {userLocationPermission === 'denied' && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Please enable location services in your browser settings</p>
                <button 
                  onClick={getUserLocation}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {geolocating && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-gray-100 bg-opacity-60 rounded-lg">
          <div className="text-center p-4">
            <Loader className="text-getmore-purple mx-auto animate-spin mb-2" size={32} />
            <p className="text-gray-700">Detecting your location...</p>
          </div>
        </div>
      )}
      
      {showETA()}
      {selectedDriver && renderToggleProfileButton()}
      {renderRecenterButton()}
      
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden"></div>
    </div>
  );
};

export default MapDisplay;

declare global {
  interface Window {
    hideDriverProfile: (driverId: number) => void;
    showDriverProfile: (driverId: number) => void;
  }
}
