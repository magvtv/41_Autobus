"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { optimizeRoute, type RouteOptimizationResponse } from "@/lib/api";
import {
  MapPin,
  Navigation,
  Clock,
  Battery,
  Zap,
  Route,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface RouteOptimizerProps {
  vehicleId: string;
  currentSoc?: number;
  vehicleType: 'electric' | 'diesel';
}

export function RouteOptimizer({ vehicleId, currentSoc = 50, vehicleType }: RouteOptimizerProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [trafficMultiplier, setTrafficMultiplier] = useState(1.0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteOptimizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Nairobi locations for quick selection
  const nairobiLocations = [
    { name: "CBD", lat: -1.2921, lng: 36.8219 },
    { name: "Westlands", lat: -1.2676, lng: 36.8108 },
    { name: "Kasarani", lat: -1.2198, lng: 36.8975 },
    { name: "Embakasi", lat: -1.3197, lng: 36.8947 },
    { name: "Kibera", lat: -1.3133, lng: 36.7894 },
    { name: "Mathare", lat: -1.2584, lng: 36.8584 },
    { name: "Kariobangi", lat: -1.2532, lng: 36.8916 },
    { name: "Kawangware", lat: -1.2905, lng: 36.7372 },
    { name: "Umoja", lat: -1.2779, lng: 36.8916 },
    { name: "Dandora", lat: -1.2532, lng: 36.8916 },
  ];

  const getLocationCoords = (locationName: string) => {
    return nairobiLocations.find(loc => loc.name === locationName);
  };

  const handleOptimizeRoute = async () => {
    if (!origin || !destination) {
      setError("Please select both origin and destination");
      return;
    }

    const originCoords = getLocationCoords(origin);
    const destCoords = getLocationCoords(destination);

    if (!originCoords || !destCoords) {
      setError("Invalid location selected");
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const response = await optimizeRoute({
        origin: { ...originCoords, name: origin },
        destination: { ...destCoords, name: destination },
        vehicleType,
        currentSoc,
        trafficMultiplier,
      });

      if (response.success) {
        setRouteResult(response.data);
      } else {
        setError(response.error || "Route optimization failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours}h ${mins}m`;
    }
  };

  const formatDistance = (km: number) => {
    return `${Math.round(km * 100) / 100} km`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="w-5 h-5" />
            <span>Route Optimizer</span>
          </CardTitle>
          <CardDescription>
            Get optimized routes with A* algorithm and charging recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Route Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">From</Label>
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger>
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  {nairobiLocations.map((location) => (
                    <SelectItem key={location.name} value={location.name}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">To</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {nairobiLocations.map((location) => (
                    <SelectItem key={location.name} value={location.name}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Traffic Conditions */}
          <div className="space-y-2">
            <Label htmlFor="traffic">Traffic Conditions</Label>
            <Select 
              value={trafficMultiplier.toString()} 
              onValueChange={(value) => setTrafficMultiplier(parseFloat(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.0">Normal Traffic</SelectItem>
                <SelectItem value="1.5">Light Traffic</SelectItem>
                <SelectItem value="2.0">Heavy Traffic</SelectItem>
                <SelectItem value="2.5">Rush Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Battery className="w-4 h-4" />
              <span className="text-sm">
                {vehicleType === 'electric' ? `${currentSoc}% Battery` : 'Diesel Vehicle'}
              </span>
            </div>
            <Badge variant="outline">
              {vehicleId}
            </Badge>
          </div>

          {/* Optimize Button */}
          <Button 
            onClick={handleOptimizeRoute} 
            disabled={isOptimizing || !origin || !destination}
            className="w-full"
          >
            <Route className="w-4 h-4 mr-2" />
            {isOptimizing ? "Optimizing Route..." : "Optimize Route"}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Results */}
      {routeResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Optimized Route</span>
            </CardTitle>
            <CardDescription>
              {routeResult.origin.name} → {routeResult.destination.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Route Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatDistance(routeResult.distance.total)}
                </div>
                <div className="text-xs text-blue-600">Total Distance</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatTime(routeResult.time.total)}
                </div>
                <div className="text-xs text-green-600">Travel Time</div>
              </div>

              {routeResult.time.savings > 0 && (
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    -{formatTime(routeResult.time.savings)}
                  </div>
                  <div className="text-xs text-purple-600">Time Saved</div>
                </div>
              )}

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {routeResult.optimization.costReduction}%
                </div>
                <div className="text-xs text-orange-600">Efficiency Gain</div>
              </div>
            </div>

            {/* Energy Information */}
            {vehicleType === 'electric' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Battery className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Energy Analysis</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-yellow-600">Consumption:</span>
                    <span className="ml-2 font-medium">{routeResult.energy.consumption.toFixed(1)} kWh</span>
                  </div>
                  <div>
                    <span className="text-yellow-600">Remaining:</span>
                    <span className="ml-2 font-medium">{routeResult.energy.remaining?.toFixed(1)}%</span>
                  </div>
                </div>
                {routeResult.energy.needsCharging && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-700">Charging required before destination</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Charging Stations */}
            {routeResult.chargingStations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Available Charging Stations</span>
                </div>
                <div className="space-y-2">
                  {routeResult.chargingStations.map((station, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <div>
                        <div className="font-medium text-sm">{station.name}</div>
                        <div className="text-xs text-green-600">{station.distance}km away</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{station.estimatedChargingTime} min</div>
                        <div className="text-xs text-green-600">KSh {station.cost}/kWh</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {routeResult.recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Recommendations</span>
                </div>
                <div className="space-y-1">
                  {routeResult.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Algorithm Info */}
            <div className="text-xs text-gray-500 text-center">
              Powered by {routeResult.optimization.algorithm} • {routeResult.optimization.pathNodes} waypoints
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
