"use client";

import { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  mockVehicles,
  mockChargerStations,
  calculateFleetStats,
  scenarios,
  type Vehicle,
} from "@/lib/mockData";
import { 
  runChargingScheduler, 
  runSimulation as runSimulationAPI, 
  getVehicles, 
  getChargers, 
  getFleetStats,
  type ChargingScheduleResponse 
} from "@/lib/api";
import { MapView } from "@/components/MapView";
import { ChargingQueue } from "@/components/ChargingQueue";
import { SimulationControls } from "@/components/SimulationControls";
import {
  Battery,
  Car,
  MapPin,
  Sun,
  Wind,
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";

interface FleetStats {
  totalVehicles: number;
  evVehicles: number;
  dieselVehicles: number;
  activeVehicles: number;
  chargingVehicles: number;
  totalRevenue: number;
  avgSoc: number;
}

export function FleetDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [chargers, setChargers] = useState(mockChargerStations);
  const [selectedScenario, setSelectedScenario] =
    useState<string>("normal-day");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationTime, setSimulationTime] = useState("16:30");
  const [fleetStats, setFleetStats] = useState<FleetStats>(
    calculateFleetStats(),
  );
  const [chargingSchedule, setChargingSchedule] = useState<ChargingScheduleResponse | null>(null);
  const [useRealAPI, setUseRealAPI] = useState(false);
  const [gridAwareness, setGridAwareness] = useState({
    renewableUtilization: { solarUtilization: 0, windUtilization: 0, renewablePercentage: 0, estimatedSavings: 0 },
    gridOptimization: { peakLoadReduction: 0, offPeakUtilization: 0, gridStabilityScore: 0 },
    costSavings: { renewableSavings: 0, peakAvoidanceSavings: 0, totalMonthlySavings: 0 }
  });

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

  const getStatusText = (status: Vehicle["status"]) => {
    switch (status) {
      case "in-route":
        return "On Route";
      case "charging":
        return "Charging";
      case "idle":
        return "Available";
      case "maintenance":
        return "Maintenance";
      default:
        return "Unknown";
    }
  };

  const getBatteryColor = (socPercent?: number) => {
    if (!socPercent) return "text-gray-500";
    if (socPercent < 20) return "text-red-500";
    if (socPercent < 50) return "text-yellow-500";
    return "text-green-500";
  };

  const handleSmartScheduler = async () => {
    setIsSimulating(true);

    try {
      if (useRealAPI) {
        // Use real API
        const response = await runChargingScheduler({
          vehicles,
          chargers,
          gridStatus: selectedScenario === 'rush-hour-brownout' ? 'brownout' : 'normal',
          includeRenewableEnergy: true
        });

        if (response.success) {
          setChargingSchedule(response.data);
          
          // Update grid awareness data
          if (response.data.summary.renewableEnergyUtilization && response.data.summary.gridLoadOptimization && response.data.summary.costSavings) {
            setGridAwareness({
              renewableUtilization: response.data.summary.renewableEnergyUtilization,
              gridOptimization: response.data.summary.gridLoadOptimization,
              costSavings: response.data.summary.costSavings
            });
          }
          
          // Update vehicles based on real schedule
          const updatedVehicles = vehicles.map((vehicle) => {
            const scheduledVehicle = response.data.schedule.find(s => s.vehicleId === vehicle.id);
            if (scheduledVehicle) {
              return {
                ...vehicle,
                status: "charging" as const,
                currentRoute: `Scheduled charging at ${scheduledVehicle.chargerId}`,
              };
            }
            return vehicle;
          });
          setVehicles(updatedVehicles);
        }
      } else {
        // Fallback to mock simulation
        setTimeout(() => {
          const updatedVehicles = vehicles.map((vehicle) => {
            if (
              vehicle.type === "electric" &&
              vehicle.socPercent &&
              vehicle.socPercent < 30
            ) {
              return {
                ...vehicle,
                status: "charging" as const,
                currentRoute: `Scheduled charging at ${getClosestCharger(vehicle)}`,
              };
            }
            return vehicle;
          });
          setVehicles(updatedVehicles);
          setIsSimulating(false);
        }, 2000);
        return;
      }
    } catch (error) {
      console.error('Smart scheduler failed:', error);
      // Fallback to mock behavior
      setTimeout(() => {
        const updatedVehicles = vehicles.map((vehicle) => {
          if (
            vehicle.type === "electric" &&
            vehicle.socPercent &&
            vehicle.socPercent < 30
          ) {
            return {
              ...vehicle,
              status: "charging" as const,
              currentRoute: `Scheduled charging at ${getClosestCharger(vehicle)}`,
            };
          }
          return vehicle;
        });
        setVehicles(updatedVehicles);
      }, 2000);
    } finally {
      setIsSimulating(false);
    }
  };

  const getClosestCharger = (vehicle: Vehicle) => {
    // Simple logic to assign closest charger
    const chargers = [
      "CBD Central",
      "Westlands Hub",
      "Kasarani Station",
      "Embakasi Depot",
    ];
    return chargers[Math.floor(Math.random() * chargers.length)];
  };

  const runSimulation = async () => {
    setIsSimulating(true);

    try {
      if (useRealAPI) {
        // Use real simulation API
        const response = await runSimulationAPI({
          scenario: selectedScenario,
          duration: 2,
          timeStep: 0.5
        });

        if (response.success) {
          // Update vehicles based on simulation results
          const updatedVehicles = response.data.result.finalState.vehicles;
          setVehicles(updatedVehicles);
          setFleetStats(calculateFleetStats());
        }
      } else {
        // Fallback to mock simulation
        const scenario = scenarios[selectedScenario as keyof typeof scenarios];

        setTimeout(() => {
          const updatedVehicles = vehicles.map((vehicle) => {
            const random = Math.random();

            // Simulate battery drain and status changes
            if (vehicle.type === "electric" && vehicle.socPercent) {
              const drain = scenario.trafficMultiplier * (5 + Math.random() * 10);
              const newSoc = Math.max(0, vehicle.socPercent - drain);

              const newStatus: Vehicle["status"] =
                newSoc < 15 ? "charging" : random < 0.7 ? "in-route" : "idle";

              return {
                ...vehicle,
                socPercent: Math.round(newSoc),
                status: newStatus,
                totalTripsToday: vehicle.totalTripsToday + (random < 0.8 ? 1 : 0),
                revenue:
                  vehicle.revenue +
                  (random < 0.8 ? Math.floor(Math.random() * 200) + 100 : 0),
              };
            }

            return vehicle;
          });

          setVehicles(updatedVehicles);
          setFleetStats(calculateFleetStats());
          setIsSimulating(false);
        }, 3000);
        return;
      }
    } catch (error) {
      console.error('Simulation failed:', error);
      // Fallback to mock behavior
      const scenario = scenarios[selectedScenario as keyof typeof scenarios];
      setTimeout(() => {
        const updatedVehicles = vehicles.map((vehicle) => {
          const random = Math.random();
          if (vehicle.type === "electric" && vehicle.socPercent) {
            const drain = scenario.trafficMultiplier * (5 + Math.random() * 10);
            const newSoc = Math.max(0, vehicle.socPercent - drain);
            const newStatus: Vehicle["status"] =
              newSoc < 15 ? "charging" : random < 0.7 ? "in-route" : "idle";

            return {
              ...vehicle,
              socPercent: Math.round(newSoc),
              status: newStatus,
              totalTripsToday: vehicle.totalTripsToday + (random < 0.8 ? 1 : 0),
              revenue: vehicle.revenue + (random < 0.8 ? Math.floor(Math.random() * 200) + 100 : 0),
            };
          }
          return vehicle;
        });
        setVehicles(updatedVehicles);
        setFleetStats(calculateFleetStats());
      }, 3000);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Fleet Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vehicles
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fleetStats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {fleetStats.evVehicles} EV • {fleetStats.dieselVehicles} Diesel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fleetStats.activeVehicles}
            </div>
            <p className="text-xs text-muted-foreground">
              {fleetStats.chargingVehicles} charging
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Battery</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fleetStats.avgSoc}%</div>
            <p className="text-xs text-muted-foreground">Fleet average SOC</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {fleetStats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Awareness Metrics */}
      {gridAwareness.renewableUtilization.renewablePercentage > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solar Utilization</CardTitle>
              <Sun className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {gridAwareness.renewableUtilization.solarUtilization}%
              </div>
              <p className="text-xs text-muted-foreground">Current solar usage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wind Utilization</CardTitle>
              <Wind className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {gridAwareness.renewableUtilization.windUtilization}%
              </div>
              <p className="text-xs text-muted-foreground">Current wind usage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grid Stability</CardTitle>
              <Zap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {gridAwareness.gridOptimization.gridStabilityScore}%
              </div>
              <p className="text-xs text-muted-foreground">Stability score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                KSh {gridAwareness.costSavings.totalMonthlySavings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Monthly savings</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Operations Control</CardTitle>
          <CardDescription>
            Manage routing, charging, and simulation scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="scenario-select" className="text-sm font-medium">
                Scenario:
              </label>
              <Select
                value={selectedScenario}
                onValueChange={setSelectedScenario}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(scenarios).map(([key, scenario]) => (
                    <SelectItem key={key} value={key}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="api-toggle"
                checked={useRealAPI}
                onCheckedChange={setUseRealAPI}
              />
              <label htmlFor="api-toggle" className="text-sm font-medium">
                Use Real API
              </label>
            </div>

            <Button
              onClick={handleSmartScheduler}
              disabled={isSimulating}
              className="bg-green-600 hover:bg-green-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isSimulating ? "Optimizing..." : "Smart Scheduler"}
            </Button>

            <Button
              onClick={runSimulation}
              disabled={isSimulating}
              variant="outline"
            >
              <Play className="w-4 h-4 mr-2" />
              {isSimulating ? "Simulating..." : "Simulate Day"}
            </Button>

            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">
                Simulation Time: {simulationTime}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout: Map and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Fleet Map</CardTitle>
            <CardDescription>
              Real-time vehicle positions and charging stations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MapView
              vehicles={vehicles}
              chargerStations={mockChargerStations}
            />
          </CardContent>
        </Card>

        {/* Charging Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Charging Queue</CardTitle>
            <CardDescription>
              Current and scheduled charging sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChargingQueue vehicles={vehicles} />
            
            {/* Real API Charging Schedule Results */}
            {useRealAPI && chargingSchedule && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Smart Scheduler Results</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Scheduled:</span>
                    <span className="font-medium">{chargingSchedule.summary.totalScheduled} vehicles</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Queued:</span>
                    <span className="font-medium">{chargingSchedule.summary.totalQueued} vehicles</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Priority:</span>
                    <span className="font-medium">{chargingSchedule.summary.criticalVehiclesScheduled} scheduled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Wait Time:</span>
                    <span className="font-medium">{chargingSchedule.summary.averageWaitTime} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grid Status:</span>
                    <span className={`font-medium ${chargingSchedule.summary.gridStatus === 'brownout' ? 'text-red-600' : 'text-green-600'}`}>
                      {chargingSchedule.summary.gridStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Fleet Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Status</CardTitle>
          <CardDescription>
            Detailed view of all vehicles and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Battery/Fuel</TableHead>
                <TableHead>Current Route</TableHead>
                <TableHead>Trips Today</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Next Dispatch</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(vehicle.status)}`}
                      />
                      <span>{vehicle.plate}</span>
                      <Badge variant="outline" className="text-xs">
                        {vehicle.type === "electric" ? "EV" : "Diesel"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{vehicle.driver}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getStatusText(vehicle.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Battery
                        className={`w-4 h-4 ${getBatteryColor(vehicle.socPercent)}`}
                      />
                      <span className={getBatteryColor(vehicle.socPercent)}>
                        {vehicle.type === "electric"
                          ? `${vehicle.socPercent}%`
                          : `${vehicle.fuelLiters}L`}
                      </span>
                      {vehicle.type === "electric" &&
                        vehicle.socPercent &&
                        vehicle.socPercent < 20 && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {vehicle.currentRoute || "Available"}
                  </TableCell>
                  <TableCell>{vehicle.totalTripsToday}</TableCell>
                  <TableCell>KSh {vehicle.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(vehicle.nextDispatchTimestamp).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
