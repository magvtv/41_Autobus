"use client";

import { useEffect, useRef } from "react";
import { Vehicle, ChargerStation } from "@/lib/mockData";

interface MapViewProps {
  vehicles: Vehicle[];
  chargerStations: ChargerStation[];
}

export function MapView({ vehicles, chargerStations }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Set up Leaflet CSS and icons
      // Note: CSS is loaded from CDN in production

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current && mapRef.current) {
        // Initialize map centered on Nairobi
        mapInstanceRef.current = L.map(mapRef.current).setView(
          [-1.2921, 36.8219],
          11,
        );

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current);
      }

      // Clear existing markers
      markersRef.current.forEach((marker) => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      // Add vehicle markers
      vehicles.forEach((vehicle) => {
        const color = getVehicleColor(vehicle);
        const icon = L.divIcon({
          html: `
            <div style="
              background-color: ${color};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: white;
              font-weight: bold;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
              ${vehicle.type === "electric" ? "⚡" : "🚐"}
            </div>
          `,
          className: "custom-div-icon",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(
          [vehicle.lastKnownLocation.lat, vehicle.lastKnownLocation.lng],
          {
            icon,
          },
        ).addTo(mapInstanceRef.current);

        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${vehicle.plate}</h3>
            <div style="margin-bottom: 4px;"><strong>Driver:</strong> ${vehicle.driver}</div>
            <div style="margin-bottom: 4px;"><strong>Status:</strong> ${vehicle.status}</div>
            <div style="margin-bottom: 4px;"><strong>${vehicle.type === "electric" ? "Battery" : "Fuel"}:</strong>
              ${vehicle.type === "electric" ? `${vehicle.socPercent}%` : `${vehicle.fuelLiters}L`}
            </div>
            <div style="margin-bottom: 4px;"><strong>Trips Today:</strong> ${vehicle.totalTripsToday}</div>
            <div style="margin-bottom: 4px;"><strong>Revenue:</strong> KSh ${vehicle.revenue.toLocaleString()}</div>
            ${vehicle.currentRoute ? `<div><strong>Route:</strong> ${vehicle.currentRoute}</div>` : ""}
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      });

      // Add charging station markers
      chargerStations.forEach((station) => {
        const color = getStationColor(station);
        const icon = L.divIcon({
          html: `
            <div style="
              background-color: ${color};
              width: 32px;
              height: 32px;
              border-radius: 6px;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              color: white;
              font-weight: bold;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
              🔌
            </div>
          `,
          className: "custom-div-icon",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([station.location.lat, station.location.lng], {
          icon,
        }).addTo(mapInstanceRef.current);

        const popupContent = `
          <div style="min-width: 220px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${station.name}</h3>
            <div style="margin-bottom: 4px;"><strong>Status:</strong> ${station.status}</div>
            <div style="margin-bottom: 4px;"><strong>Available Plugs:</strong> ${station.plugsAvailable}/${station.plugsTotal}</div>
            <div style="margin-bottom: 4px;"><strong>Power Output:</strong> ${station.powerOutput}kW</div>
            <div style="margin-bottom: 4px;"><strong>Cost:</strong> KSh ${station.costPerKwh}/kWh</div>
            <div style="
              padding: 4px 8px;
              border-radius: 4px;
              background-color: ${station.plugsAvailable > 0 ? "#10b981" : "#ef4444"};
              color: white;
              text-align: center;
              margin-top: 8px;
              font-size: 12px;
            ">
              ${station.plugsAvailable > 0 ? "Available" : "All Plugs Occupied"}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      });
    });

    return () => {
      // Cleanup function
      if (mapInstanceRef.current) {
        markersRef.current.forEach((marker) => {
          mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = [];
      }
    };
  }, [vehicles, chargerStations]);

  const getVehicleColor = (vehicle: Vehicle) => {
    switch (vehicle.status) {
      case "in-route":
        return "#3b82f6"; // blue
      case "charging":
        return "#10b981"; // green
      case "idle":
        return "#f59e0b"; // yellow
      case "maintenance":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const getStationColor = (station: ChargerStation) => {
    if (station.status !== "operational") return "#ef4444"; // red
    if (station.plugsAvailable === 0) return "#f59e0b"; // yellow
    return "#10b981"; // green
  };

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg overflow-hidden border"
        style={{ minHeight: "400px" }}
      />

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border">
        <h4 className="font-semibold text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>On Route</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Charging</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Maintenance</span>
          </div>
          <hr className="my-2" />
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center text-white text-xs">
              🔌
            </div>
            <span>Charging Station</span>
          </div>
        </div>
      </div>

      {/* Map Controls Info */}
      <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-md border">
        <div className="text-xs text-gray-600">
          Click markers for details • Zoom with mouse wheel
        </div>
      </div>
    </div>
  );
}
