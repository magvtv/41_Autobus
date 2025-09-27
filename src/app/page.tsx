"use client";

import { useState } from "react";
import { FleetDashboard } from "@/components/FleetDashboard";
import { DriverView } from "@/components/DriverView";
import { InvestorView } from "@/components/InvestorView";
import { BatteryHealthMonitor } from "@/components/BatteryHealthMonitor";
import { StationPlacementDemo } from "@/components/StationPlacementDemo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, MapPin, TrendingUp, Zap, Battery, Building2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  MatatuMind
                </h1>
                <p className="text-sm text-muted-foreground">
                  Smarter routes. Reliable rides. Greener cities.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Nairobi Fleet Operations</span>
                {/* <span>Live Demo</span> */}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="fleet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="fleet" className="flex items-center space-x-2">
              <Car className="w-4 h-4" />
              <span>Fleet Manager</span>
            </TabsTrigger>
            <TabsTrigger value="driver" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Driver View</span>
            </TabsTrigger>
            <TabsTrigger value="battery" className="flex items-center space-x-2">
              <Battery className="w-4 h-4" />
              <span>Battery Health</span>
            </TabsTrigger>
            <TabsTrigger value="stations" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Station Placement</span>
            </TabsTrigger>
            <TabsTrigger
              value="investor"
              className="flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Investor Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fleet" className="space-y-6">
            <FleetDashboard />
          </TabsContent>

          <TabsContent value="driver" className="space-y-6">
            <DriverView />
          </TabsContent>

          <TabsContent value="battery" className="space-y-6">
            <BatteryHealthMonitor />
          </TabsContent>

          <TabsContent value="stations" className="space-y-6">
            <StationPlacementDemo />
          </TabsContent>

          <TabsContent value="investor" className="space-y-6">
            <InvestorView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
