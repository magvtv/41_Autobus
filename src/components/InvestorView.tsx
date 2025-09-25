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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockChargerStations,
  mockVehicles,
  mockGridNodes,
} from "@/lib/mockData";
import {
  TrendingUp,
  MapPin,
  DollarSign,
  Zap,
  BarChart3,
  Calculator,
  Target,
  Lightbulb,
  Building,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LocationAnalysis {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  demandScore: number;
  gridCapacity: number;
  competitorDistance: number;
  trafficDensity: number;
  estimatedROI: number;
  paybackPeriod: number;
  dailyUtilization: number;
  monthlyRevenue: number;
  capexEstimate: number;
  priority: "high" | "medium" | "low";
}

export function InvestorView() {
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Mock location analysis data
  const locationAnalyses: LocationAnalysis[] = [
    {
      id: "LOC-001",
      name: "Thika Road (Garden City)",
      coordinates: { lat: -1.2084, lng: 36.8879 },
      demandScore: 92,
      gridCapacity: 85,
      competitorDistance: 2.3,
      trafficDensity: 94,
      estimatedROI: 34.5,
      paybackPeriod: 2.9,
      dailyUtilization: 78,
      monthlyRevenue: 385000,
      capexEstimate: 1200000,
      priority: "high",
    },
    {
      id: "LOC-002",
      name: "Mombasa Road (SGR Station)",
      coordinates: { lat: -1.3197, lng: 36.928 },
      demandScore: 88,
      gridCapacity: 70,
      competitorDistance: 1.8,
      trafficDensity: 89,
      estimatedROI: 31.2,
      paybackPeriod: 3.2,
      dailyUtilization: 72,
      monthlyRevenue: 360000,
      capexEstimate: 1150000,
      priority: "high",
    },
    {
      id: "LOC-003",
      name: "Ngong Road (Junction Mall)",
      coordinates: { lat: -1.3028, lng: 36.7869 },
      demandScore: 76,
      gridCapacity: 92,
      competitorDistance: 3.1,
      trafficDensity: 82,
      estimatedROI: 26.8,
      paybackPeriod: 3.7,
      dailyUtilization: 65,
      monthlyRevenue: 290000,
      capexEstimate: 1080000,
      priority: "medium",
    },
    {
      id: "LOC-004",
      name: "Outer Ring Road (Ruiru)",
      coordinates: { lat: -1.15, lng: 36.9667 },
      demandScore: 68,
      gridCapacity: 88,
      competitorDistance: 4.2,
      trafficDensity: 71,
      estimatedROI: 22.1,
      paybackPeriod: 4.5,
      dailyUtilization: 58,
      monthlyRevenue: 245000,
      capexEstimate: 1100000,
      priority: "medium",
    },
    {
      id: "LOC-005",
      name: "Langata Road (Karen)",
      coordinates: { lat: -1.3463, lng: 36.7108 },
      demandScore: 54,
      gridCapacity: 95,
      competitorDistance: 5.8,
      trafficDensity: 61,
      estimatedROI: 18.3,
      paybackPeriod: 5.5,
      dailyUtilization: 47,
      monthlyRevenue: 185000,
      capexEstimate: 1020000,
      priority: "low",
    },
  ];

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const calculateMarketMetrics = () => {
    const totalFleetSize = mockVehicles.length;
    const evFleetSize = mockVehicles.filter(
      (v) => v.type === "electric",
    ).length;
    const totalExistingChargers = mockChargerStations.reduce(
      (sum, station) => sum + station.plugsTotal,
      0,
    );
    const evAdoptionRate = (evFleetSize / totalFleetSize) * 100;
    const chargersPerEV = totalExistingChargers / evFleetSize;

    return {
      totalFleetSize,
      evFleetSize,
      totalExistingChargers,
      evAdoptionRate: Math.round(evAdoptionRate),
      chargersPerEV: Math.round(chargersPerEV * 10) / 10,
      estimatedMarketSize: 2.5, // Billion KSh
      projectedGrowth: 85, // %
    };
  };

  const marketMetrics = calculateMarketMetrics();

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EV Fleet Size</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketMetrics.evFleetSize}
            </div>
            <p className="text-xs text-muted-foreground">
              {marketMetrics.evAdoptionRate}% of total fleet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Charging Points
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketMetrics.totalExistingChargers}
            </div>
            <p className="text-xs text-muted-foreground">
              {marketMetrics.chargersPerEV} per EV vehicle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {marketMetrics.estimatedMarketSize}B
            </div>
            <p className="text-xs text-muted-foreground">
              Annual charging revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketMetrics.projectedGrowth}%
            </div>
            <p className="text-xs text-muted-foreground">
              3-year CAGR projection
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="opportunities">
            Investment Opportunities
          </TabsTrigger>
          <TabsTrigger value="analysis">Location Analysis</TabsTrigger>
          <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {/* Priority Locations */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Investment Locations</CardTitle>
              <CardDescription>
                High-demand locations with optimal ROI potential for charging
                station deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Demand Score</TableHead>
                    <TableHead>Est. ROI</TableHead>
                    <TableHead>Payback</TableHead>
                    <TableHead>Monthly Revenue</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locationAnalyses.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{location.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {location.coordinates.lat.toFixed(3)},{" "}
                            {location.coordinates.lng.toFixed(3)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getPriorityColor(location.priority) as any}
                        >
                          {location.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={location.demandScore}
                            className="w-16"
                          />
                          <span
                            className={`text-sm ${getScoreColor(location.demandScore)}`}
                          >
                            {location.demandScore}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {location.estimatedROI.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {location.paybackPeriod.toFixed(1)} years
                      </TableCell>
                      <TableCell>
                        KSh {location.monthlyRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Investment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Top Opportunity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {locationAnalyses[0].name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Prime location with highest ROI potential
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Investment</div>
                      <div className="font-semibold">
                        KSh {locationAnalyses[0].capexEstimate.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Annual Revenue
                      </div>
                      <div className="font-semibold">
                        KSh{" "}
                        {(
                          locationAnalyses[0].monthlyRevenue * 12
                        ).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">ROI</div>
                      <div className="font-semibold text-green-600">
                        {locationAnalyses[0].estimatedROI}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Payback</div>
                      <div className="font-semibold">
                        {locationAnalyses[0].paybackPeriod} years
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">Request Detailed Analysis</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Investment Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 text-sm">
                      Market Timing
                    </h4>
                    <p className="text-xs text-blue-600">
                      EV adoption is accelerating. Early investment in
                      high-traffic corridors offers first-mover advantage.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 text-sm">
                      Grid Integration
                    </h4>
                    <p className="text-xs text-green-600">
                      Partnering with Kenya Power ensures grid stability and
                      preferential connection rates.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 text-sm">
                      Fleet Partnerships
                    </h4>
                    <p className="text-xs text-yellow-600">
                      Pre-negotiated contracts with matatu SACCOs guarantee
                      baseline utilization and revenue.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {/* Location Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Demand Heatmap Analysis</CardTitle>
              <CardDescription>
                Traffic density and charging demand visualization across Nairobi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Simulated heatmap - in a real app this would be an actual map */}
                <div className="w-full h-96 bg-gradient-to-br from-red-100 via-yellow-100 to-green-100 rounded-lg border relative overflow-hidden">
                  {/* Overlay points representing high-demand areas */}
                  {locationAnalyses.slice(0, 3).map((location, index) => (
                    <div
                      key={location.id}
                      className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-2 -translate-y-2"
                      style={{
                        backgroundColor:
                          location.priority === "high"
                            ? "#ef4444"
                            : location.priority === "medium"
                              ? "#f59e0b"
                              : "#10b981",
                        left: `${20 + index * 25}%`,
                        top: `${30 + index * 15}%`,
                      }}
                      title={location.name}
                    />
                  ))}

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
                    <h4 className="font-semibold text-sm mb-2">
                      Demand Intensity
                    </h4>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>High</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Medium</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Low</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Pattern Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Morning Rush (6-9 AM)</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Midday (9 AM-3 PM)</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Evening Rush (3-7 PM)</span>
                      <span>89%</span>
                    </div>
                    <Progress value={89} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Night (7 PM-6 AM)</span>
                      <span>32%</span>
                    </div>
                    <Progress value={32} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grid Capacity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockGridNodes.map((node) => (
                    <div key={node.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{node.region}</span>
                        <span className={getScoreColor(100 - node.loadPercent)}>
                          {node.capacityKw}kW ({100 - node.loadPercent}%
                          available)
                        </span>
                      </div>
                      <Progress value={100 - node.loadPercent} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          {/* ROI Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>ROI Calculator</span>
              </CardTitle>
              <CardDescription>
                Customize parameters to calculate investment returns for your
                charging station
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Investment Parameters</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Number of Charging Points
                      </label>
                      <div className="text-lg font-semibold">6 plugs</div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Power Output per Plug
                      </label>
                      <div className="text-lg font-semibold">50kW</div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Installation Cost
                      </label>
                      <div className="text-lg font-semibold">KSh 1,200,000</div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Electricity Rate
                      </label>
                      <div className="text-lg font-semibold">KSh 18/kWh</div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Charging Rate
                      </label>
                      <div className="text-lg font-semibold">KSh 28/kWh</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Financial Projections</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Daily Revenue
                      </span>
                      <span className="font-semibold">KSh 12,800</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Monthly Revenue
                      </span>
                      <span className="font-semibold">KSh 385,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Annual Revenue
                      </span>
                      <span className="font-semibold">KSh 4,620,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Operating Costs
                      </span>
                      <span className="font-semibold">KSh 2,760,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Net Profit (Annual)
                      </span>
                      <span className="font-semibold text-green-600">
                        KSh 1,860,000
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">ROI</span>
                      <span className="font-bold text-green-600">34.5%</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Payback Period</span>
                      <span className="font-bold">2.9 years</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  Investment Recommendation
                </h4>
                <p className="text-sm text-green-700">
                  Based on current market conditions and projected EV adoption
                  rates, this investment offers strong returns with moderate
                  risk. The 2.9-year payback period is competitive in the
                  infrastructure investment space.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
