import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart3, 
  PieChart, 
  Map, 
  Users, 
  Droplets, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Activity
} from "lucide-react";

interface EquityData {
  hamletId: string;
  hamletName: string;
  hamletNameHindi: string;
  population: number;
  waterAssets: number;
  functionalAssets: number;
  populationPerAsset: number;
  equityScore: number; // 0-100, higher is better
  underservedPopulation: number;
  riskLevel: 'low' | 'medium' | 'high';
  casteGroups: {
    sc: number;
    st: number;
    obc: number;
    general: number;
  };
  genderDistribution: {
    male: number;
    female: number;
  };
  waterAccess: {
    household: number; // percentage
    individual: number; // percentage
  };
}

interface EquityMetrics {
  overallEquityScore: number;
  underservedHamlets: number;
  totalUnderservedPopulation: number;
  averageAssetsPerPerson: number;
  genderGap: number;
  casteGap: number;
}

export function EquityVisualizationDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<'equity' | 'access' | 'demographics'>('equity');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'current' | 'monthly' | 'yearly'>('current');

  // Fetch equity data
  const { data: equityData = [], isLoading } = useQuery({
    queryKey: ['equity-data', selectedTimeframe],
    queryFn: async (): Promise<EquityData[]> => {
      // In real implementation, this would fetch from the database
      return [
        {
          hamletId: '1',
          hamletName: 'Rampur',
          hamletNameHindi: 'रामपुर',
          population: 2500,
          waterAssets: 8,
          functionalAssets: 6,
          populationPerAsset: 312.5,
          equityScore: 45,
          underservedPopulation: 800,
          riskLevel: 'high',
          casteGroups: { sc: 400, st: 300, obc: 800, general: 1000 },
          genderDistribution: { male: 1200, female: 1300 },
          waterAccess: { household: 65, individual: 72 }
        },
        {
          hamletId: '2',
          hamletName: 'Sundarpur',
          hamletNameHindi: 'सुंदरपुर',
          population: 1800,
          waterAssets: 12,
          functionalAssets: 11,
          populationPerAsset: 150,
          equityScore: 78,
          underservedPopulation: 200,
          riskLevel: 'medium',
          casteGroups: { sc: 200, st: 150, obc: 600, general: 850 },
          genderDistribution: { male: 900, female: 900 },
          waterAccess: { household: 88, individual: 92 }
        },
        {
          hamletId: '3',
          hamletName: 'Greenfield',
          hamletNameHindi: 'ग्रीनफील्ड',
          population: 3200,
          waterAssets: 15,
          functionalAssets: 14,
          populationPerAsset: 213.3,
          equityScore: 82,
          underservedPopulation: 150,
          riskLevel: 'low',
          casteGroups: { sc: 300, st: 200, obc: 1000, general: 1700 },
          genderDistribution: { male: 1600, female: 1600 },
          waterAccess: { household: 95, individual: 98 }
        }
      ];
    },
  });

  // Calculate overall metrics
  const equityMetrics: EquityMetrics = {
    overallEquityScore: Math.round(equityData.reduce((sum, h) => sum + h.equityScore, 0) / equityData.length),
    underservedHamlets: equityData.filter(h => h.equityScore < 60).length,
    totalUnderservedPopulation: equityData.reduce((sum, h) => sum + h.underservedPopulation, 0),
    averageAssetsPerPerson: Math.round(equityData.reduce((sum, h) => sum + h.populationPerAsset, 0) / equityData.length),
    genderGap: Math.abs(equityData.reduce((sum, h) => sum + (h.genderDistribution.male - h.genderDistribution.female), 0) / equityData.length),
    casteGap: Math.max(...equityData.map(h => Math.max(h.casteGroups.sc, h.casteGroups.st, h.casteGroups.obc, h.casteGroups.general) - Math.min(h.casteGroups.sc, h.casteGroups.st, h.casteGroups.obc, h.casteGroups.general)))
  };

  const getEquityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const underservedHamlets = equityData.filter(h => h.equityScore < 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equity & Visualization Dashboard</h2>
          <p className="text-gray-600">समानता विज़ुअलाइज़ेशन | Fair distribution analysis and underserved area identification</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equity">Equity Score</SelectItem>
              <SelectItem value="access">Water Access</SelectItem>
              <SelectItem value="demographics">Demographics</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Critical Alerts */}
      {underservedHamlets.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Equity Alert:</strong> {underservedHamlets.length} hamlets identified as underserved. 
            {equityMetrics.totalUnderservedPopulation.toLocaleString()} people affected.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Equity Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equityMetrics.overallEquityScore}/100</div>
            <Progress value={equityMetrics.overallEquityScore} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {equityMetrics.overallEquityScore >= 80 ? 'Excellent' : 
               equityMetrics.overallEquityScore >= 60 ? 'Good' : 'Needs Improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Underserved Hamlets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{equityMetrics.underservedHamlets}</div>
            <p className="text-xs text-muted-foreground">
              {equityMetrics.totalUnderservedPopulation.toLocaleString()} people affected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Assets/Person</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equityMetrics.averageAssetsPerPerson}</div>
            <p className="text-xs text-muted-foreground">
              Target: 200 people per asset
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gender Gap</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equityMetrics.genderGap}</div>
            <p className="text-xs text-muted-foreground">
              {equityMetrics.genderGap < 50 ? 'Low gap' : 'High gap'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Equity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-blue-500" />
            Equity Heatmap - Hamlet Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equityData.map((hamlet) => (
              <div key={hamlet.hamletId} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{hamlet.hamletName}</h4>
                    <p className="text-sm text-gray-600">{hamlet.hamletNameHindi}</p>
                  </div>
                  <Badge className={getEquityColor(hamlet.equityScore)}>
                    {hamlet.equityScore}/100
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Population:</span>
                    <span>{hamlet.population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Assets:</span>
                    <span>{hamlet.functionalAssets}/{hamlet.waterAssets}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>People/Asset:</span>
                    <span>{hamlet.populationPerAsset}</span>
                  </div>
                </div>
                
                <Progress 
                  value={hamlet.equityScore} 
                  className="h-2"
                  style={{
                    background: `linear-gradient(90deg, 
                      ${hamlet.equityScore >= 80 ? '#22c55e' : hamlet.equityScore >= 60 ? '#eab308' : '#ef4444'} 
                      ${hamlet.equityScore}%, #e5e7eb ${hamlet.equityScore}%)`
                  }}
                />
                
                <div className="flex items-center justify-between">
                  <Badge className={getRiskColor(hamlet.riskLevel)}>
                    {hamlet.riskLevel} risk
                  </Badge>
                  {hamlet.underservedPopulation > 0 && (
                    <span className="text-xs text-red-600">
                      {hamlet.underservedPopulation} underserved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demographics Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Caste Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Caste-wise Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equityData.map((hamlet) => (
                <div key={hamlet.hamletId} className="border rounded-lg p-3">
                  <h4 className="font-medium mb-3">{hamlet.hamletName}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">SC:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(hamlet.casteGroups.sc / hamlet.population) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{hamlet.casteGroups.sc}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ST:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(hamlet.casteGroups.st / hamlet.population) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{hamlet.casteGroups.st}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">OBC:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(hamlet.casteGroups.obc / hamlet.population) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{hamlet.casteGroups.obc}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">General:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${(hamlet.casteGroups.general / hamlet.population) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{hamlet.casteGroups.general}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Water Access Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              Water Access Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equityData.map((hamlet) => (
                <div key={hamlet.hamletId} className="border rounded-lg p-3">
                  <h4 className="font-medium mb-3">{hamlet.hamletName}</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Household Access:</span>
                        <span>{hamlet.waterAccess.household}%</span>
                      </div>
                      <Progress value={hamlet.waterAccess.household} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Individual Access:</span>
                        <span>{hamlet.waterAccess.individual}%</span>
                      </div>
                      <Progress value={hamlet.waterAccess.individual} className="h-2" />
                    </div>
                    <div className="text-xs text-gray-600">
                      Gap: {hamlet.waterAccess.individual - hamlet.waterAccess.household}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Equity Improvement Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-red-600">High Priority Actions</h4>
              <ul className="space-y-2 text-sm">
                {underservedHamlets.map(hamlet => (
                  <li key={hamlet.hamletId} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>{hamlet.hamletName}:</strong> Add {Math.ceil(hamlet.underservedPopulation / 200)} new water assets
                    </div>
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>Prioritize SC/ST communities in Rampur for new infrastructure</div>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-yellow-600">Medium Priority Actions</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>Improve maintenance schedules for existing assets</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>Implement community awareness programs</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>Establish water quality monitoring in underserved areas</div>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equity Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Equity Trends Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {equityData.map((hamlet, index) => (
              <div key={hamlet.hamletId} className="flex-1 flex flex-col items-center">
                <div className="text-center mb-2">
                  <div className="text-sm font-medium">{hamlet.hamletName}</div>
                  <div className="text-xs text-gray-500">{hamlet.equityScore}/100</div>
                </div>
                <div 
                  className={`w-full rounded-t transition-all duration-300 ${
                    hamlet.equityScore >= 80 ? 'bg-green-500' : 
                    hamlet.equityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${hamlet.equityScore * 2}px` }}
                ></div>
                <div className="text-xs text-gray-500 mt-1">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index % 6]}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Equity scores over the last 6 months - Target: 80+ for all hamlets
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
