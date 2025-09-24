import { useEffect, useRef, useState } from "react";

interface MapComponentProps {
  waterAssets: any[];
  userRole: 'community' | 'agent' | 'admin';
  height?: string;
  onAssetSelect?: (asset: any) => void;
}

export function MapComponent({ waterAssets, userRole, height = "400px", onAssetSelect }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet to avoid SSR issues
        const L = await import('leaflet');
        
        // Import Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!isMounted || !mapRef.current) return;

        // Create map
        const map = L.map(mapRef.current).setView([23.0225, 72.5714], 10);
        leafletMapRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add water assets as markers
        waterAssets.forEach(asset => {
          const color = getAssetColor(asset.status);
          const icon = getAssetIcon(asset.type);
          
          // Create custom marker
          const marker = L.circleMarker([
            parseFloat(asset.latitude) || 23.0225,
            parseFloat(asset.longitude) || 72.5714
          ], {
            color: color,
            fillColor: color,
            fillOpacity: 0.7,
            radius: userRole === 'admin' ? 6 : 8,
            weight: 2
          }).addTo(map);

          // Add popup with asset details
          const popupContent = `
            <div class="p-2">
              <h4 class="font-semibold text-sm mb-1">${asset.name}</h4>
              <p class="text-xs text-gray-600 mb-1">Type: ${asset.type}</p>
              <p class="text-xs text-gray-600 mb-1">Status: ${asset.status}</p>
              ${userRole !== 'community' ? `<p class="text-xs text-gray-600">Condition: ${asset.condition}</p>` : ''}
            </div>
          `;
          
          marker.bindPopup(popupContent);
          
          // Handle click events for agents/admins
          if (onAssetSelect && userRole !== 'community') {
            marker.on('click', () => onAssetSelect(asset));
          }
        });

        // Add sample hamlet boundaries for admin view
        if (userRole === 'admin') {
          const hamlets = [
            { name: 'Rampur', coords: [23.0225, 72.5714], risk: 'high' },
            { name: 'Sundarpur', coords: [23.0425, 72.5914], risk: 'medium' },
            { name: 'Greenfield', coords: [23.0025, 72.5514], risk: 'low' }
          ];

          hamlets.forEach(hamlet => {
            const color = hamlet.risk === 'high' ? '#D32F2F' : 
                         hamlet.risk === 'medium' ? '#F57C00' : '#388E3C';
            
            L.circle(hamlet.coords as [number, number], {
              color: color,
              fillColor: color,
              fillOpacity: 0.2,
              radius: 2000,
              weight: 2
            }).addTo(map).bindPopup(`
              <div class="p-2">
                <h4 class="font-semibold text-sm">${hamlet.name}</h4>
                <p class="text-xs text-gray-600">Risk Level: ${hamlet.risk}</p>
              </div>
            `);
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(initializeMap, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [waterAssets, userRole, onAssetSelect]);

  const getAssetColor = (status: string) => {
    switch (status) {
      case 'functional': return '#388E3C'; // green
      case 'needs-maintenance': return '#F57C00'; // orange
      case 'non-functional': return '#D32F2F'; // red
      default: return '#757575'; // gray
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'handpump': return 'fa-hand-paper';
      case 'well': return 'fa-circle';
      case 'borewell': return 'fa-dot-circle';
      case 'tank': return 'fa-square';
      default: return 'fa-tint';
    }
  };

  return (
    <div className="relative" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className={`w-full h-full rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        data-testid="map-container"
      />
      
      {/* Map Legend */}
      {!isLoading && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 text-xs">
          <h4 className="font-semibold mb-2">Status</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span>Functional</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span>Maintenance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-error"></div>
              <span>Non-functional</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
