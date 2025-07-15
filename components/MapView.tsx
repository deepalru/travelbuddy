

import React, { useEffect, useRef, useCallback } from 'react';
import { Place, SupportPoint, SupportPointType } from '@/types';
import { Colors } from '@/constants';

interface MapViewProps {
  places?: Place[];
  supportPoints?: SupportPoint[];
  onSelectPlaceDetail: (place: Place) => void;
  userLocation: { latitude: number; longitude: number } | null;
}

const mapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];

const getIconForSupportPoint = (type: SupportPointType) => {
    const iconDiv = document.createElement('div');
    iconDiv.style.width = '32px';
    iconDiv.style.height = '32px';
    iconDiv.style.borderRadius = '50%';
    iconDiv.style.display = 'flex';
    iconDiv.style.alignItems = 'center';
    iconDiv.style.justifyContent = 'center';
    iconDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    iconDiv.style.border = '2px solid white';
    
    let SvgIcon = '';
    switch (type) {
        case 'hospital':
            iconDiv.style.backgroundColor = Colors.accentError;
            SvgIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>`;
            break;
        case 'police':
            iconDiv.style.backgroundColor = Colors.primary;
            SvgIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`;
            break;
        case 'embassy':
            iconDiv.style.backgroundColor = Colors.primaryDark;
            SvgIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>`;
            break;
        default:
            iconDiv.style.backgroundColor = Colors.text_secondary;
            break;
    }
    iconDiv.innerHTML = SvgIcon;
    return iconDiv;
};

export const MapView: React.FC<MapViewProps> = ({ places, supportPoints, onSelectPlaceDetail, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const createPlaceInfoWindowContent = useCallback((place: Place) => {
    const contentDiv = document.createElement('div');
    contentDiv.className = 'info-window-content';
    
    const title = document.createElement('h3');
    title.textContent = place.name;
    contentDiv.appendChild(title);
    
    const type = document.createElement('p');
    type.textContent = `Type: ${place.type}`;
    contentDiv.appendChild(type);
    
    const button = document.createElement('button');
    button.className = 'map-popup-button';
    button.textContent = 'View Details';
    button.onclick = () => onSelectPlaceDetail(place);
    contentDiv.appendChild(button);

    return contentDiv;
  }, [onSelectPlaceDetail]);

  const createSupportPointInfoWindowContent = useCallback((supportPoint: SupportPoint) => {
    const contentDiv = document.createElement('div');
    contentDiv.className = 'info-window-content';
    
    const title = document.createElement('h3');
    title.textContent = supportPoint.name;
    contentDiv.appendChild(title);
    
    const type = document.createElement('p');
    type.textContent = `Type: ${supportPoint.type.charAt(0).toUpperCase() + supportPoint.type.slice(1)}`;
    contentDiv.appendChild(type);
    
    const button = document.createElement('button');
    button.className = 'map-popup-button';
    button.textContent = 'Get Directions';
    button.onclick = () => {
      const encodedAddress = encodeURIComponent(supportPoint.address);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    };
    contentDiv.appendChild(button);
    
    return contentDiv;
  }, []);

  useEffect(() => {
    if (mapRef.current && !googleMapRef.current) {
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : { lat: 37.7749, lng: -122.4194 },
        zoom: userLocation ? 14 : 12,
        mapId: 'TRAVEL_BUDDY_MAP',
        disableDefaultUI: true,
        zoomControl: true,
        styles: mapStyles
      });
      googleMapRef.current = map;
      infoWindowRef.current = new (window as any).google.maps.InfoWindow({
        pixelOffset: new (window as any).google.maps.Size(0, -35),
      });
    }
  }, [userLocation]); 

  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !(window as any).google?.maps?.marker) return;

    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];

    const bounds = new (window as any).google.maps.LatLngBounds();
    
    if (places) {
        places.forEach(place => {
          if (place.geometry?.location?.lat && place.geometry?.location?.lng) {
            const position = { lat: place.geometry.location.lat, lng: place.geometry.location.lng };
            const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
              map,
              position,
              title: place.name,
            });
            
            marker.addListener('click', () => {
              if (infoWindowRef.current) {
                infoWindowRef.current.setContent(createPlaceInfoWindowContent(place));
                infoWindowRef.current.open({ anchor: marker, map });
              }
            });
            
            markersRef.current.push(marker);
            bounds.extend(position);
          }
        });
    }
    
    if (supportPoints) {
        supportPoints.forEach(point => {
            if (point.geometry?.location?.lat && point.geometry?.location?.lng) {
                const position = { lat: point.geometry.location.lat, lng: point.geometry.location.lng };
                const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
                    map,
                    position,
                    title: point.name,
                    content: getIconForSupportPoint(point.type),
                });

                marker.addListener('click', () => {
                    if (infoWindowRef.current) {
                        infoWindowRef.current.setContent(createSupportPointInfoWindowContent(point));
                        infoWindowRef.current.open({ anchor: marker, map });
                    }
                });

                markersRef.current.push(marker);
                bounds.extend(position);
            }
        });
    }

    if (userLocation) {
        const userPosition = { lat: userLocation.latitude, lng: userLocation.longitude };
        if (userMarkerRef.current) {
            userMarkerRef.current.position = userPosition;
        } else {
            const userMarkerDiv = document.createElement('div');
            userMarkerDiv.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36px" height="36px" style="transform: translate(-50%, -50%);">
                    <circle cx="12" cy="12" r="10" fill="${Colors.primary}" fill-opacity="0.3"/>
                    <circle cx="12" cy="12" r="6" fill="${Colors.primary}" stroke="white" stroke-width="2"/>
                </svg>
            `;
            userMarkerRef.current = new (window as any).google.maps.marker.AdvancedMarkerElement({
                map,
                position: userPosition,
                title: 'Your Location',
                content: userMarkerDiv,
                zIndex: 1000,
            });
        }
        bounds.extend(userPosition);
    } else {
        if (userMarkerRef.current) {
            userMarkerRef.current.map = null;
            userMarkerRef.current = null;
        }
    }
    
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 100); // 100px padding
    }

  }, [places, supportPoints, userLocation, createPlaceInfoWindowContent, createSupportPointInfoWindowContent]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '0.75rem', boxShadow: Colors.boxShadow }} aria-label="Interactive map of places"></div>;
};
