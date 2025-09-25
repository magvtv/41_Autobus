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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockVehicles,
  mockChargerStations,
  type Vehicle,
} from "@/lib/mockData";
import {
  Battery,
  MapPin,
  Navigation,
  Clock,
  AlertTriangle,
  Zap,
  Phone,
  Route,
  TrendingUp,
  Users,
} from "lucide-react";

export function DriverView() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>(
    mockVehicles[0].id,
  );
  const [showRouteAlert, setShowRouteAlert] = useState(true);
  const [showChargingAlert, setShowChargingAlert] = useState(false);

  const vehicle =
    mockVehicles.find((v) => v.id === selectedVehicle) || mockVehicles[0];
  const needsCharging =
    vehicle.type === "electric" &&
    vehicle.socPercent &&
    vehicle.socPercent < 30;
  const criticalBattery =
    vehicle.type === "electric" &&
    vehicle.socPercent &&
    vehicle.socPercent < 15;

  const getBatteryColor = (socPercent?: number) => {
    if (!socPercent) return "bg-gray-500";
    if (socPercent < 20) return "bg-red-500";
    if (socPercent < 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusColor = (status: Vehicle["status"]) => {
    switch (status) {
      case "in-route":
        return "bg-blue-500";
      case "charging":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "maintenance":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const findNearestCharger = () => {
    // Simulate finding nearest available charger
    const availableChargers = mockChargerStations.filter(
      (s) => s.status === "operational" && s.plugsAvailable > 0,
    );
    if (availableChargers.length > 0) {
      return availableChargers[0];
    }
    return mockChargerStations[0];
  };

  const handleAcceptRoute = () => {
    setShowRouteAlert(false);
    if (needsCharging) {
      setShowChargingAlert(true);
      setTimeout(() => setShowChargingAlert(false), 5000);
    }
  };

  const estimatedEarnings = Math.floor(Math.random() * 1000) + 500;
  const tripsRemaining = Math.floor(Math.random() * 5) + 2;

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      {/* Driver Selection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Driver Dashboard</CardTitle>
              <CardDescription>Select your vehicle</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Online</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockVehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.plate} - {v.driver}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalBattery && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">
                  Critical Battery Level
                </h3>
                <p className="text-sm text-red-600">
                  Battery at {vehicle.socPercent}%. Proceed to charging station
                  immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Change Alert */}
      {showRouteAlert && !criticalBattery && (
        <Card className="border-blue-500 bg-blue-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Navigation className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-blue-800">
                    Route Suggestion
                  </h3>
                  <p className="text-sm text-blue-600">
                    Traffic detected on current route. Alternate route available
                    - saves 12 minutes.
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleAcceptRoute}
                  className="flex-1"
                >
                  Accept Route
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRouteAlert(false)}
                  className="flex-1"
                >
                  Keep Current
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charging Alert */}
      {showChargingAlert && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-800">
                  Charging Scheduled
                </h3>
                <p className="text-sm text-green-600">
                  End-of-shift charging slot reserved at Westlands Hub
                  (18:30-20:00)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>{vehicle.plate}</span>
            <Badge
              variant="secondary"
              className={`text-white ${getStatusColor(vehicle.status)}`}
            >
              {vehicle.status === "in-route"
                ? "On Route"
                : vehicle.status === "charging"
                  ? "Charging"
                  : vehicle.status === "idle"
                    ? "Available"
                    : "Maintenance"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Battery/Fuel Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Battery
                  className={`w-5 h-5 ${
                    vehicle.type === "electric"
                      ? vehicle.socPercent! < 20
                        ? "text-red-500"
                        : "text-green-500"
                      : "text-blue-500"
                  }`}
                />
                <span className="font-medium">
                  {vehicle.type === "electric" ? "Battery" : "Fuel"}
                </span>
              </div>
              <span className="text-lg font-bold">
                {vehicle.type === "electric"
                  ? `${vehicle.socPercent}%`
                  : `${vehicle.fuelLiters}L`}
              </span>
            </div>
            {vehicle.type === "electric" && (
              <Progress
                value={vehicle.socPercent}
                className={`h-3 ${getBatteryColor(vehicle.socPercent)}`}
              />
            )}
            <div className="text-xs text-muted-foreground">
              {vehicle.type === "electric"
                ? `Estimated range: ${Math.floor((vehicle.socPercent! / 100) * 180)}km`
                : `Estimated range: ${Math.floor((vehicle.fuelLiters! / 50) * 300)}km`}
            </div>
          </div>

          {/* Current Route */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Route className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Current Route</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm">
                {vehicle.currentRoute || "No active route"}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>
                  Next dispatch:{" "}
                  {new Date(vehicle.nextDispatchTimestamp).toLocaleTimeString()}
                </span>
                <span>ETA: 25 min</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Today's Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {vehicle.totalTripsToday}
              </div>
              <div className="text-xs text-muted-foreground">
                Trips Completed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                KSh {vehicle.revenue.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {tripsRemaining}
              </div>
              <div className="text-xs text-muted-foreground">
                Trips Remaining
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                KSh {estimatedEarnings}
              </div>
              <div className="text-xs text-muted-foreground">
                Est. Day Total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charging Information */}
      {needsCharging && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Charging Needed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 mb-2">
                Battery level is {vehicle.socPercent}%. Consider charging soon.
              </p>
              <div className="space-y-2">
                <div className="text-xs text-yellow-600">
                  <strong>Nearest Station:</strong> {findNearestCharger().name}
                </div>
                <div className="text-xs text-yellow-600">
                  <strong>Available Plugs:</strong>{" "}
                  {findNearestCharger().plugsAvailable}/
                  {findNearestCharger().plugsTotal}
                </div>
                <div className="text-xs text-yellow-600">
                  <strong>Est. Charging Time:</strong> 45 minutes
                </div>
              </div>
            </div>
            <Button className="w-full" size="sm">
              <MapPin className="w-4 h-4 mr-2" />
              Navigate to Charger
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center p-4 h-auto"
            >
              <Phone className="w-5 h-5 mb-1" />
              <span className="text-xs">Call Dispatch</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center p-4 h-auto"
            >
              <AlertTriangle className="w-5 h-5 mb-1" />
              <span className="text-xs">Report Issue</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center p-4 h-auto"
            >
              <Users className="w-5 h-5 mb-1" />
              <span className="text-xs">Passenger Info</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center p-4 h-auto"
            >
              <Route className="w-5 h-5 mb-1" />
              <span className="text-xs">Route History</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
