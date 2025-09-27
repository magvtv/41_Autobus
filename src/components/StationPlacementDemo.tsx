"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StationPlacementAnalysis {
  location: {
    id: string;
    name: string;
    location: { lat: number; lng: number };
    area: string;
    trafficDensity: 'high' | 'medium' | 'low';
    populationDensity: 'high' | 'medium' | 'low';
    existingInfrastructure: 'excellent' | 'good' | 'fair' | 'poor';
  };
  roi: {
    totalInvestment: number;
    monthlyRevenue: number;
    paybackPeriod: number;
    netPresentValue: number;
    internalRateOfReturn: number;
  };
  utilization: {
    projectedDailySessions: number;
    peakHourUtilization: number;
    averageSessionDuration: number;
    monthlyEnergySold: number;
  };
  impact: {
    vehiclesServed: number;
    timeSaved: number;
    emissionsReduced: number;
    gridLoadReduction: number;
  };
  feasibility: {
    landCost: number;
    installationCost: number;
    gridConnectionCost: number;
    permitsRequired: string[];
    estimatedTimeline: number;
  };
  risk: {
    competitionRisk: 'low' | 'medium' | 'high';
    demandRisk: 'low' | 'medium' | 'high';
    technicalRisk: 'low' | 'medium' | 'high';
    overallRisk: 'low' | 'medium' | 'high';
  };
  score: number;
}

interface FleetImpact {
  totalVehiclesServed: number;
  totalTimeSaved: number;
  totalEmissionsReduced: number;
  totalInvestment: number;
  averageROI: number;
  topPerformingLocation: string;
}

export function StationPlacementDemo() {
  const [analyses, setAnalyses] = useState<StationPlacementAnalysis[]>([]);
  const [fleetImpact, setFleetImpact] = useState<FleetImpact | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const fetchStationPlacementAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/station-placement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeHorizon: 12,
          includeTrafficData: true
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAnalyses(result.data.analyses);
        setFleetImpact(result.data.fleetImpact);
        setRecommendations(result.data.recommendations);
        if (result.data.analyses.length > 0) {
          setSelectedLocation(result.data.analyses[0].location.id);
        }
      }
    } catch (error) {
      console.error('Error fetching station placement analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationPlacementAnalysis();
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrafficDensityColor = (density: string) => {
    switch (density) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedAnalysis = analyses.find(a => a.location.id === selectedLocation);

  // Prepare chart data
  const roiChartData = analyses.map(analysis => ({
    name: analysis.location.name,
    roi: analysis.roi.internalRateOfReturn,
    payback: analysis.roi.paybackPeriod
  }));

  const utilizationChartData = analyses.map(analysis => ({
    name: analysis.location.name,
    sessions: analysis.utilization.projectedDailySessions,
    vehicles: analysis.impact.vehiclesServed
  }));

  const riskDistribution = {
    low: analyses.filter(a => a.risk.overallRisk === 'low').length,
    medium: analyses.filter(a => a.risk.overallRisk === 'medium').length,
    high: analyses.filter(a => a.risk.overallRisk === 'high').length
  };

  const riskChartData = [
    { name: 'Low Risk', value: riskDistribution.low, color: '#10b981' },
    { name: 'Medium Risk', value: riskDistribution.medium, color: '#f59e0b' },
    { name: 'High Risk', value: riskDistribution.high, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Station Placement Analysis
          </h2>
          <p className="text-muted-foreground">
            AI-powered charging station placement optimization for maximum ROI
          </p>
        </div>
        <Button onClick={fetchStationPlacementAnalysis} disabled={loading}>
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {/* Fleet Impact Overview */}
      {fleetImpact && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSh {(fleetImpact.totalInvestment / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">
                Across all locations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehicles Served</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fleetImpact.totalVehiclesServed}</div>
              <p className="text-xs text-muted-foreground">
                Daily capacity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {fleetImpact.averageROI.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Internal rate of return
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(fleetImpact.totalTimeSaved / 60)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Daily charging time saved
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
                <CardDescription>
                  Return on investment across candidate locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roiChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'roi' ? `${value}%` : `${value} months`,
                          name === 'roi' ? 'ROI' : 'Payback Period'
                        ]}
                      />
                      <Bar dataKey="roi" fill="#10b981" name="roi" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>
                  Overall risk assessment across all locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {riskChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Location Rankings</CardTitle>
              <CardDescription>
                Ranked by overall score (0-100)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyses.map((analysis, index) => (
                  <div key={analysis.location.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{analysis.location.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {analysis.location.area} • {analysis.utilization.projectedDailySessions} daily sessions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`font-bold ${getScoreColor(analysis.score)}`}>
                          {analysis.score}/100
                        </div>
                        <div className="text-sm text-muted-foreground">Score</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {analysis.roi.internalRateOfReturn}%
                        </div>
                        <div className="text-sm text-muted-foreground">ROI</div>
                      </div>
                      <Badge className={getRiskColor(analysis.risk.overallRisk)}>
                        {analysis.risk.overallRisk} risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {selectedAnalysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Location Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {analyses.map((analysis) => (
                      <Button
                        key={analysis.location.id}
                        variant={selectedLocation === analysis.location.id ? "default" : "outline"}
                        onClick={() => setSelectedLocation(analysis.location.id)}
                        className="justify-start"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {analysis.location.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>ROI Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total Investment</span>
                      <span className="font-medium">
                        KSh {(selectedAnalysis.roi.totalInvestment / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Monthly Revenue</span>
                      <span className="font-medium">
                        KSh {selectedAnalysis.roi.monthlyRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Payback Period</span>
                      <span className="font-medium">{selectedAnalysis.roi.paybackPeriod} months</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Internal Rate of Return</span>
                      <span className="font-bold text-green-600">
                        {selectedAnalysis.roi.internalRateOfReturn}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Net Present Value</span>
                      <span className="font-medium">
                        KSh {selectedAnalysis.roi.netPresentValue.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Utilization Projections</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Daily Sessions</span>
                      <span className="font-medium">{selectedAnalysis.utilization.projectedDailySessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Peak Hour Utilization</span>
                      <span className="font-medium">{selectedAnalysis.utilization.peakHourUtilization}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average Session Duration</span>
                      <span className="font-medium">{selectedAnalysis.utilization.averageSessionDuration} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Monthly Energy Sold</span>
                      <span className="font-medium">{selectedAnalysis.utilization.monthlyEnergySold} kWh</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Vehicles Served</span>
                      <span className="font-medium">{selectedAnalysis.impact.vehiclesServed}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Impact Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>Time Saved</span>
                      </div>
                      <span className="font-medium">{selectedAnalysis.impact.timeSaved} min/day</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-green-500" />
                        <span>Emissions Reduced</span>
                      </div>
                      <span className="font-medium">{selectedAnalysis.impact.emissionsReduced} kg CO₂/month</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                        <span>Grid Load Reduction</span>
                      </div>
                      <span className="font-medium">{selectedAnalysis.impact.gridLoadReduction} kW</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Competition Risk</span>
                      <Badge className={getRiskColor(selectedAnalysis.risk.competitionRisk)}>
                        {selectedAnalysis.risk.competitionRisk}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Demand Risk</span>
                      <Badge className={getRiskColor(selectedAnalysis.risk.demandRisk)}>
                        {selectedAnalysis.risk.demandRisk}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Technical Risk</span>
                      <Badge className={getRiskColor(selectedAnalysis.risk.technicalRisk)}>
                        {selectedAnalysis.risk.technicalRisk}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Overall Risk</span>
                      <Badge className={getRiskColor(selectedAnalysis.risk.overallRisk)}>
                        {selectedAnalysis.risk.overallRisk}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Location Characteristics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        <Badge className={getTrafficDensityColor(selectedAnalysis.location.trafficDensity)}>
                          {selectedAnalysis.location.trafficDensity}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">Traffic Density</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        <Badge className={getTrafficDensityColor(selectedAnalysis.location.populationDensity)}>
                          {selectedAnalysis.location.populationDensity}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">Population Density</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {selectedAnalysis.location.existingInfrastructure}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">Infrastructure</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Recommendations</CardTitle>
              <CardDescription>
                AI-generated insights for optimal station placement strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {recommendation.includes('🏆') ? (
                        <Target className="h-5 w-5 text-yellow-500" />
                      ) : recommendation.includes('💰') ? (
                        <DollarSign className="h-5 w-5 text-green-500" />
                      ) : recommendation.includes('🚐') ? (
                        <Users className="h-5 w-5 text-blue-500" />
                      ) : recommendation.includes('⏱️') ? (
                        <Clock className="h-5 w-5 text-purple-500" />
                      ) : recommendation.includes('✅') ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : recommendation.includes('⚠️') ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      ) : recommendation.includes('🚨') ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : recommendation.includes('💡') ? (
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                      ) : recommendation.includes('⚡') ? (
                        <Zap className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
