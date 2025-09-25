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
import { Switch } from "@/components/ui/switch";
import { scenarios } from "@/lib/mockData";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Clock,
  Zap,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface SimulationControlsProps {
  onScenarioChange: (scenario: string) => void;
  onSimulationToggle: (isRunning: boolean) => void;
  onTimeStep: () => void;
  onReset: () => void;
  isSimulating: boolean;
  currentScenario: string;
}

export function SimulationControls({
  onScenarioChange,
  onSimulationToggle,
  onTimeStep,
  onReset,
  isSimulating,
  currentScenario,
}: SimulationControlsProps) {
  const [simulationSpeed, setSimulationSpeed] = useState<string>("1x");
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [simulationTime, setSimulationTime] = useState("14:30");

  const handlePlayPause = () => {
    onSimulationToggle(!isSimulating);
  };

  const getScenarioColor = (scenarioKey: string) => {
    if (scenarioKey === "rush-hour-brownout") return "destructive";
    if (scenarioKey === "depot-failure") return "default";
    return "secondary";
  };

  const scenario = scenarios[currentScenario as keyof typeof scenarios];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Simulation Controls</span>
        </CardTitle>
        <CardDescription>
          Control demo scenarios and time acceleration for presentation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Active Scenario</h3>
          <Select value={currentScenario} onValueChange={onScenarioChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(scenarios).map(([key, scenario]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center space-x-2">
                    <span>{scenario.name}</span>
                    <Badge
                      variant={getScenarioColor(key) as any}
                      className="text-xs"
                    >
                      {key.replace("-", " ")}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Scenario Description */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {scenario.description}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Traffic: {scenario.trafficMultiplier}x</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Grid: {scenario.gridStatus}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Vehicles: {scenario.activeVehicles}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Playback</h3>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePlayPause}
              className="flex items-center space-x-1"
            >
              {isSimulating ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Play</span>
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onTimeStep}
              disabled={isSimulating}
            >
              <SkipForward className="w-4 h-4" />
              Step
            </Button>

            <Button size="sm" variant="outline" onClick={onReset}>
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {/* Simulation Speed */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Speed:</span>
            <Select value={simulationSpeed} onValueChange={setSimulationSpeed}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5x">0.5x</SelectItem>
                <SelectItem value="1x">1x</SelectItem>
                <SelectItem value="2x">2x</SelectItem>
                <SelectItem value="5x">5x</SelectItem>
                <SelectItem value="10x">10x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Simulation Options */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Options</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-optimize charging</span>
              <Switch
                checked={autoOptimize}
                onCheckedChange={setAutoOptimize}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Real-time updates</span>
              <Switch checked={true} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Show notifications</span>
              <Switch checked={true} />
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Simulation Time</span>
            <span className="text-lg font-mono">{simulationTime}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Status:</span>
            <span className={isSimulating ? "text-green-600" : "text-gray-600"}>
              {isSimulating ? "Running" : "Paused"}
            </span>
          </div>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Quick Scenarios</h3>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onScenarioChange("rush-hour-brownout")}
              className="justify-start"
            >
              <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
              Trigger Grid Brownout
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onScenarioChange("depot-failure")}
              className="justify-start"
            >
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              Simulate Depot Failure
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onScenarioChange("normal-day")}
              className="justify-start"
            >
              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
              Normal Operations
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
