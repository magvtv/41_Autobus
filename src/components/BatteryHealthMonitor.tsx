"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Battery, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Thermometer,
  Wind,
  Sun
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BatteryHealthData {
  vehicleId: string;
  plate: string;
  currentHealth: {
    socPercent: number;
    estimatedCapacity: number;
    cyclesCompleted: number;
    healthScore: number;
  };
  projections: Array<{
    month: number;
    estimatedCapacity: number;
    healthScore: number;
    degradationRate: number;
    recommendedActions: string[];
  }>;
  climateImpact: {
    temperatureFactor: number;
    humidityFactor: number;
    dustFactor: number;
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    actions: string[];
    estimatedCostSavings: number;
  };
}

interface FleetBatteryStats {
  totalVehicles: number;
  avgCurrentHealth: number;
  avgFinalHealth: number;
  criticalVehicles: number;
  healthyVehicles: number;
  totalCostSavings: number;
  healthDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

export function BatteryHealthMonitor() {
  const [batteryData, setBatteryData] = useState<BatteryHealthData[]>([]);
  const [fleetStats, setFleetStats] = useState<FleetBatteryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const fetchBatteryHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/battery-health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectionMonths: 6,
          includeClimateFactors: true
        }),
      });

      const result = await response.json();
      if (result.success) {
        setBatteryData(result.data.predictions);
        setFleetStats(result.data.fleetStats);
        if (result.data.predictions.length > 0) {
          setSelectedVehicle(result.data.predictions[0].vehicleId);
        }
      }
    } catch (error) {
      console.error('Error fetching battery health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatteryHealth();
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-800">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const selectedVehicleData = batteryData.find(v => v.vehicleId === selectedVehicle);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Battery className="h-6 w-6" />
            Battery Health Monitor
          </h2>
          <p className="text-muted-foreground">
            AI-powered battery degradation prediction for African EV fleets
          </p>
        </div>
        <Button onClick={fetchBatteryHealth} disabled={loading}>
          {loading ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      {/* Fleet Overview */}
      {fleetStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fleet Health</CardTitle>
              <Battery className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fleetStats.avgCurrentHealth}%</div>
              <p className="text-xs text-muted-foreground">
                Average battery health score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Vehicles</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{fleetStats.criticalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                Need immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                KSh {fleetStats.totalCostSavings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Potential monthly savings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Climate Impact</CardTitle>
              <Thermometer className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {selectedVehicleData ? 
                  Math.round((selectedVehicleData.climateImpact.temperatureFactor - 1) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Temperature degradation factor
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="fleet" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fleet">Fleet Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Analysis</TabsTrigger>
          <TabsTrigger value="projections">Health Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Battery Health Distribution</CardTitle>
              <CardDescription>
                Current health status across all electric vehicles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fleetStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{fleetStats.healthDistribution.excellent}</div>
                    <div className="text-sm text-muted-foreground">Excellent (90%+)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{fleetStats.healthDistribution.good}</div>
                    <div className="text-sm text-muted-foreground">Good (70-90%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{fleetStats.healthDistribution.fair}</div>
                    <div className="text-sm text-muted-foreground">Fair (50-70%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{fleetStats.healthDistribution.poor}</div>
                    <div className="text-sm text-muted-foreground">Poor (&lt;50%)</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batteryData.map((vehicle) => (
                  <div key={vehicle.vehicleId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Battery className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{vehicle.plate}</div>
                        <div className="text-sm text-muted-foreground">
                          {vehicle.currentHealth.cyclesCompleted} cycles completed
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`font-bold ${getHealthColor(vehicle.currentHealth.healthScore)}`}>
                          {vehicle.currentHealth.healthScore}%
                        </div>
                        <div className="text-sm text-muted-foreground">Health Score</div>
                      </div>
                      {getHealthBadge(vehicle.currentHealth.healthScore)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          {selectedVehicleData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {batteryData.map((vehicle) => (
                      <Button
                        key={vehicle.vehicleId}
                        variant={selectedVehicle === vehicle.vehicleId ? "default" : "outline"}
                        onClick={() => setSelectedVehicle(vehicle.vehicleId)}
                        className="justify-start"
                      >
                        <Battery className="h-4 w-4 mr-2" />
                        {vehicle.plate}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Health Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Battery Health Score</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={selectedVehicleData.currentHealth.healthScore} className="w-20" />
                        <span className={`font-bold ${getHealthColor(selectedVehicleData.currentHealth.healthScore)}`}>
                          {selectedVehicleData.currentHealth.healthScore}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Current SOC</span>
                      <span className="font-medium">{selectedVehicleData.currentHealth.socPercent}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Estimated Capacity</span>
                      <span className="font-medium">{selectedVehicleData.currentHealth.estimatedCapacity} kWh</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cycles Completed</span>
                      <span className="font-medium">{selectedVehicleData.currentHealth.cyclesCompleted}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Climate Impact Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        <span>Temperature Factor</span>
                      </div>
                      <span className="font-medium">
                        {Math.round((selectedVehicleData.climateImpact.temperatureFactor - 1) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wind className="h-4 w-4 text-blue-500" />
                        <span>Humidity Factor</span>
                      </div>
                      <span className="font-medium">
                        {Math.round((selectedVehicleData.climateImpact.humidityFactor - 1) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4 text-yellow-500" />
                        <span>Dust Factor</span>
                      </div>
                      <span className="font-medium">
                        {Math.round((selectedVehicleData.climateImpact.dustFactor - 1) * 100)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>
                    Priority: <span className={getPriorityColor(selectedVehicleData.recommendations.priority)}>
                      {selectedVehicleData.recommendations.priority.toUpperCase()}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Estimated Cost Savings</span>
                      <span className="text-green-600 font-bold">
                        KSh {selectedVehicleData.recommendations.estimatedCostSavings.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Recommended Actions:</h4>
                      <ul className="space-y-1">
                        {selectedVehicleData.recommendations.actions.map((action, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          {selectedVehicleData && (
            <Card>
              <CardHeader>
                <CardTitle>6-Month Health Projection</CardTitle>
                <CardDescription>
                  Predicted battery health degradation under African climate conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedVehicleData.projections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${value}%`, 
                          name === 'healthScore' ? 'Health Score' : 'Capacity'
                        ]}
                        labelFormatter={(month) => `Month ${month}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="healthScore" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="healthScore"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
