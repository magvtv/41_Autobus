"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Vehicle, mockChargingSchedule } from "@/lib/mockData";
import { Battery, Clock, Zap, AlertCircle } from "lucide-react";
import { format, addMinutes, differenceInMinutes } from "date-fns";

interface ChargingQueueProps {
  vehicles: Vehicle[];
}

export function ChargingQueue({ vehicles }: ChargingQueueProps) {
  const chargingVehicles = vehicles.filter((v) => v.status === "charging");
  const lowBatteryVehicles = vehicles.filter(
    (v) =>
      v.type === "electric" &&
      v.socPercent &&
      v.socPercent < 30 &&
      v.status !== "charging",
  );

  const getChargingProgress = (vehicle: Vehicle) => {
    // Simulate charging progress based on vehicle ID (deterministic)
    const hash = vehicle.id.charCodeAt(vehicle.id.length - 1);
    const baseProgress = 20 + (hash % 60); // Deterministic progress between 20-80%
    return Math.round(baseProgress);
  };

  const getEstimatedCompletion = (vehicle: Vehicle) => {
    const now = new Date();
    const hash = vehicle.id.charCodeAt(vehicle.id.length - 1);
    const minutesRemaining = 30 + (hash % 90); // Deterministic 30-120 minutes
    return addMinutes(now, minutesRemaining);
  };

  const getPriorityLevel = (vehicle: Vehicle) => {
    if (!vehicle.socPercent) return "medium";
    if (vehicle.socPercent < 15) return "high";
    if (vehicle.socPercent < 30) return "medium";
    return "low";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const formatTimeRemaining = (date: Date) => {
    const now = new Date();
    const minutes = differenceInMinutes(date, now);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-4">
      {/* Currently Charging */}
      {chargingVehicles.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-green-500" />
            Currently Charging ({chargingVehicles.length})
          </h3>
          <div className="space-y-3">
            {chargingVehicles.map((vehicle) => {
              const progress = getChargingProgress(vehicle);
              const completion = getEstimatedCompletion(vehicle);

              return (
                <div
                  key={vehicle.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-sm">
                        {vehicle.plate}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {vehicle.socPercent}% →{" "}
                      {Math.min(100, vehicle.socPercent! + progress)}%
                    </Badge>
                  </div>

                  <Progress value={progress} className="h-2" />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Battery className="w-3 h-3" />
                      <span>Charging at 50kW</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeRemaining(completion)} remaining</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Station:{" "}
                    {vehicle.currentRoute?.replace(
                      "Scheduled charging at ",
                      "",
                    ) || "Unknown"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charging Queue */}
      {lowBatteryVehicles.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-yellow-500" />
            Charging Queue ({lowBatteryVehicles.length})
          </h3>
          <div className="space-y-2">
            {lowBatteryVehicles
              .sort((a, b) => (a.socPercent || 0) - (b.socPercent || 0))
              .map((vehicle, index) => {
                const priority = getPriorityLevel(vehicle);
                const estimatedStart = addMinutes(new Date(), index * 30 + 15);

                return (
                  <div key={vehicle.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="font-medium text-sm">
                          {vehicle.plate}
                        </span>
                        <Badge
                          variant={getPriorityColor(priority) as "default" | "secondary" | "destructive" | "outline"}
                          className="text-xs"
                        >
                          {priority} priority
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Battery
                          className={`w-4 h-4 ${
                            vehicle.socPercent! < 15
                              ? "text-red-500"
                              : "text-yellow-500"
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {vehicle.socPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Driver: {vehicle.driver}</span>
                      <span>Est. start: {format(estimatedStart, "HH:mm")}</span>
                    </div>

                    {vehicle.socPercent! < 15 && (
                      <div className="flex items-center space-x-1 mt-2 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>
                          Critical battery level - priority charging needed
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* No Charging Activity */}
      {chargingVehicles.length === 0 && lowBatteryVehicles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No charging activity</p>
          <p className="text-xs">All vehicles have sufficient charge</p>
        </div>
      )}

      {/* Charging Statistics */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-sm mb-2">Charging Stats</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground">Active Sessions</div>
            <div className="font-medium">{chargingVehicles.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Queue Length</div>
            <div className="font-medium">{lowBatteryVehicles.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg Wait Time</div>
            <div className="font-medium">{lowBatteryVehicles.length * 15}m</div>
          </div>
          <div>
            <div className="text-muted-foreground">Est. Complete</div>
            <div className="font-medium">
              {format(
                addMinutes(new Date(), chargingVehicles.length * 45),
                "HH:mm",
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
