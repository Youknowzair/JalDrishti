import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Plus, 
  Search, 
  Layers, 
  Download, 
  Upload, 
  Navigation, 
  Satellite,
  Filter,
  Info
} from "lucide-react";

interface WaterAsset {
  id: string;
  hamletId: string;
  hamletName: string;
  type: 'handpump' | 'well' | 'borewell' | 'tank' | 'tap';
  name: string;
  latitude: number;
  longitude: number;
  status: 'functional' | 'non-functional' | 'needs-maintenance';
  condition: 'good' | 'fair' | 'poor';
  lastInspection?: string;
  populationServed?: number;
  waterQuality?: 'safe' | 'moderate' | 'high-risk';
}

interface Hamlet {
  id: string;
  name: string;
  nameHindi: string;
  latitude: number;
  longitude: number;
  population: number;
  riskLevel: 'low' | 'medium' | 'high';
  mappedAssets: number;
  totalAssets: number;
}

interface EnhancedMapComponentProps {
  waterAssets: WaterAsset[];
  hamlets: Hamlet[];
  userRole: 'community' | 'agent' | 'admin';
  height?: string;
  onAssetSelect?: (asset: WaterAsset) => void;
  onAssetAdd?: (asset: Partial<WaterAsset>) => void;
  onAssetUpdate?: (id: string, updates: Partial<WaterAsset>) => void;
}

export function EnhancedMapComponent({ 
  waterAssets, 
  hamlets, 
  userRole, 
  height = "600px", 
  onAssetSelect,
  onAssetAdd,
  onAssetUpdate 
}: EnhancedMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<'assets' | 'hamlets' | 'satellite'>('assets');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const { toast } = useToast();

  // New asset form state
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'handpump' as const,
    hamletId: '',
    latitude: '',
    longitude: '',
    status: 'functional' as const,
    condition: 'good' as const,
    populationServed: '',
    waterQuality: 'safe' as const
  });

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        const L = await import('leaflet');
        
        // Import Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!isMounted || !mapRef.current) return;

        // Create map with Bhuvan satellite imagery (when available)
        const map = L.map(mapRef.current).setView([23.0225, 72.5714], 12);
        leafletMapRef.current = map;

        // Add OpenStreetMap as base layer
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add satellite layer (Bhuvan equivalent)
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri'
        });

        // Layer control
        const baseMaps = {
          "OpenStreetMap": osmLayer,
          "Satellite": satelliteLayer
        };

        L.control.layers(baseMaps).addTo(map);

        // Add hamlet boundaries
        hamlets.forEach(hamlet => {
          const color = hamlet.riskLevel === 'high' ? '#D32F2F' : 
                       hamlet.riskLevel === 'medium' ? '#F57C00' : '#388E3C';
          
          const circle = L.circle([hamlet.latitude, hamlet.longitude], {
            color: color,
            fillColor: color,
            fillOpacity: 0.2,
            radius: 1500,
            weight: 2
          }).addTo(map);

          circle.bindPopup(`
            <div class="p-3">
              <h4 class="font-semibold text-sm mb-2">${hamlet.name}</h4>
              <p class="text-xs text-gray-600 mb-1">${hamlet.nameHindi}</p>
              <p class="text-xs text-gray-600 mb-1">Population: ${hamlet.population.toLocaleString()}</p>
              <p class="text-xs text-gray-600 mb-1">Risk Level: ${hamlet.riskLevel}</p>
              <p class="text-xs text-gray-600">Assets: ${hamlet.mappedAssets}/${hamlet.totalAssets}</p>
            </div>
          `);
        });

        // Add water assets as markers
        const filteredAssets = waterAssets.filter(asset => {
          const typeMatch = filterType === 'all' || asset.type === filterType;
          const statusMatch = filterStatus === 'all' || asset.status === filterStatus;
          const searchMatch = !searchQuery || 
            asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.hamletName.toLowerCase().includes(searchQuery.toLowerCase());
          return typeMatch && statusMatch && searchMatch;
        });

        filteredAssets.forEach(asset => {
          const color = getAssetColor(asset.status);
          const icon = getAssetIcon(asset.type);
          
          const marker = L.circleMarker([
            asset.latitude,
            asset.longitude
          ], {
            color: color,
            fillColor: color,
            fillOpacity: 0.7,
            radius: userRole === 'admin' ? 8 : 10,
            weight: 2
          }).addTo(map);

          const popupContent = `
            <div class="p-3 min-w-[200px]">
              <h4 class="font-semibold text-sm mb-2">${asset.name}</h4>
              <div class="space-y-1 text-xs text-gray-600">
                <p><strong>Type:</strong> ${asset.type}</p>
                <p><strong>Status:</strong> ${asset.status}</p>
                <p><strong>Condition:</strong> ${asset.condition}</p>
                <p><strong>Hamlet:</strong> ${asset.hamletName}</p>
                ${asset.populationServed ? `<p><strong>Serves:</strong> ${asset.populationServed} people</p>` : ''}
                ${asset.waterQuality ? `<p><strong>Quality:</strong> ${asset.waterQuality}</p>` : ''}
                ${asset.lastInspection ? `<p><strong>Last Inspection:</strong> ${new Date(asset.lastInspection).toLocaleDateString()}</p>` : ''}
              </div>
              ${userRole !== 'community' ? `
                <div class="mt-3 pt-2 border-t">
                  <button onclick="window.assetSelect('${asset.id}')" class="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    View Details
                  </button>
                </div>
              ` : ''}
            </div>
          `;
          
          marker.bindPopup(popupContent);
          
          if (onAssetSelect && userRole !== 'community') {
            marker.on('click', () => onAssetSelect(asset));
          }
        });

        // Add global asset selection function
        (window as any).assetSelect = (assetId: string) => {
          const asset = waterAssets.find(a => a.id === assetId);
          if (asset && onAssetSelect) {
            onAssetSelect(asset);
          }
        };

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    const timer = setTimeout(initializeMap, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [waterAssets, hamlets, userRole, onAssetSelect, filterType, filterStatus, searchQuery]);

  const getAssetColor = (status: string) => {
    switch (status) {
      case 'functional': return '#388E3C';
      case 'needs-maintenance': return '#F57C00';
      case 'non-functional': return '#D32F2F';
      default: return '#757575';
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'handpump': return 'fa-hand-paper';
      case 'well': return 'fa-circle';
      case 'borewell': return 'fa-dot-circle';
      case 'tank': return 'fa-square';
      case 'tap': return 'fa-tint';
      default: return 'fa-tint';
    }
  };

  const captureLocation = () => {
    setIsCapturingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewAsset(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          setIsCapturingLocation(false);
          toast({
            title: "Success",
            description: "स्थान कैप्चर हो गया | Location captured",
          });
        },
        (error) => {
          setIsCapturingLocation(false);
          toast({
            title: "Error",
            description: "Unable to capture location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsCapturingLocation(false);
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.hamletId || !newAsset.latitude || !newAsset.longitude) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const assetData = {
      ...newAsset,
      latitude: parseFloat(newAsset.latitude),
      longitude: parseFloat(newAsset.longitude),
      populationServed: newAsset.populationServed ? parseInt(newAsset.populationServed) : undefined
    };

    if (onAssetAdd) {
      onAssetAdd(assetData);
      setShowAddAssetDialog(false);
      setNewAsset({
        name: '',
        type: 'handpump',
        hamletId: '',
        latitude: '',
        longitude: '',
        status: 'functional',
        condition: 'good',
        populationServed: '',
        waterQuality: 'safe'
      });
    }
  };

  const exportToQGIS = () => {
    // In real implementation, this would export data in QGIS-compatible format
    const data = {
      waterAssets: waterAssets,
      hamlets: hamlets,
      exportDate: new Date().toISOString(),
      format: 'GeoJSON'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water-assets-${new Date().toISOString().split('T')[0]}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Data exported for QGIS import",
    });
  };

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search assets or hamlets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="handpump">Handpump</SelectItem>
              <SelectItem value="well">Well</SelectItem>
              <SelectItem value="borewell">Borewell</SelectItem>
              <SelectItem value="tank">Tank</SelectItem>
              <SelectItem value="tap">Tap</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="functional">Functional</SelectItem>
              <SelectItem value="needs-maintenance">Maintenance</SelectItem>
              <SelectItem value="non-functional">Non-functional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          {userRole !== 'community' && (
            <Dialog open={showAddAssetDialog} onOpenChange={setShowAddAssetDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Water Asset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Asset Name</Label>
                    <Input
                      value={newAsset.name}
                      onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter asset name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={newAsset.type} onValueChange={(value: any) => setNewAsset(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="handpump">Handpump</SelectItem>
                          <SelectItem value="well">Well</SelectItem>
                          <SelectItem value="borewell">Borewell</SelectItem>
                          <SelectItem value="tank">Tank</SelectItem>
                          <SelectItem value="tap">Tap</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Hamlet</Label>
                      <Select value={newAsset.hamletId} onValueChange={(value) => setNewAsset(prev => ({ ...prev, hamletId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hamlet" />
                        </SelectTrigger>
                        <SelectContent>
                          {hamlets.map(hamlet => (
                            <SelectItem key={hamlet.id} value={hamlet.id}>
                              {hamlet.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Latitude</Label>
                      <Input
                        value={newAsset.latitude}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, latitude: e.target.value }))}
                        placeholder="Auto-detected"
                      />
                    </div>
                    
                    <div>
                      <Label>Longitude</Label>
                      <Input
                        value={newAsset.longitude}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, longitude: e.target.value }))}
                        placeholder="Auto-detected"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={captureLocation}
                    disabled={isCapturingLocation}
                    variant="outline"
                    className="w-full"
                  >
                      {isCapturingLocation ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      ) : null}
                    Capture GPS Location
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddAssetDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleAddAsset} className="flex-1">
                      Add Asset
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button variant="outline" size="sm" onClick={exportToQGIS} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export QGIS
          </Button>
        </div>
      </div>

      {/* Map Container */}
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
          data-testid="enhanced-map-container"
        />
        
        {/* Map Legend */}
        {!isLoading && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-4 text-xs">
            <h4 className="font-semibold mb-3">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span>Functional</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Needs Maintenance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span>Non-functional</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-600 opacity-20 border border-red-600"></div>
                  <span>High Risk Hamlet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 opacity-20 border border-orange-500"></div>
                  <span>Medium Risk Hamlet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-600 opacity-20 border border-green-600"></div>
                  <span>Low Risk Hamlet</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{waterAssets.length}</div>
            <div className="text-sm text-gray-600">Total Assets</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {waterAssets.filter(a => a.status === 'functional').length}
            </div>
            <div className="text-sm text-gray-600">Functional</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {waterAssets.filter(a => a.status === 'needs-maintenance').length}
            </div>
            <div className="text-sm text-gray-600">Need Maintenance</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {waterAssets.filter(a => a.status === 'non-functional').length}
            </div>
            <div className="text-sm text-gray-600">Non-functional</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
