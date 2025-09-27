import { NextRequest, NextResponse } from 'next/server';
import { mockVehicles, mockChargerStations, type Vehicle, type ChargerStation } from '@/lib/mockData';

// POST /api/station-placement - Analyze optimal charging station placement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      candidateLocations = [], 
      analysisType = 'roi', 
      timeHorizon = 12, // months
      includeTrafficData = true 
    } = body;
    
    // If no candidate locations provided, generate some based on high-traffic areas
    const locationsToAnalyze = candidateLocations.length > 0 
      ? candidateLocations 
      : generateHighTrafficLocations();

    // Analyze each candidate location
    const analyses = locationsToAnalyze.map((location: CandidateLocation) => 
      analyzeStationPlacement(location, timeHorizon, includeTrafficData)
    );

    // Rank locations by ROI and other factors
    const rankedAnalyses = rankStationLocations(analyses);

    // Generate fleet impact analysis
    const fleetImpact = calculateFleetImpact(rankedAnalyses);

    return NextResponse.json({
      success: true,
      data: {
        analyses: rankedAnalyses,
        fleetImpact,
        recommendations: generatePlacementRecommendations(rankedAnalyses),
        timeHorizon,
        analysisDate: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing station placement:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze station placement',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/station-placement - Get high-traffic location suggestions
export async function GET() {
  try {
    const highTrafficLocations = generateHighTrafficLocations();
    const existingStations = mockChargerStations.map(station => ({
      id: station.id,
      name: station.name,
      location: station.location,
      utilization: calculateStationUtilization(station)
    }));

    return NextResponse.json({
      success: true,
      data: {
        highTrafficLocations,
        existingStations,
        recommendations: {
          priorityAreas: ['CBD', 'Westlands', 'Kasarani'],
          underservedAreas: ['Kibera', 'Mathare', 'Dandora'],
          expansionOpportunities: ['Airport Road', 'Thika Road', 'Mombasa Road']
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching station placement data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch station placement data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Station Placement Analysis Types
interface CandidateLocation {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  area: string;
  trafficDensity: 'high' | 'medium' | 'low';
  populationDensity: 'high' | 'medium' | 'low';
  existingInfrastructure: 'excellent' | 'good' | 'fair' | 'poor';
}

interface StationPlacementAnalysis {
  location: CandidateLocation;
  roi: {
    totalInvestment: number;
    monthlyRevenue: number;
    paybackPeriod: number; // months
    netPresentValue: number;
    internalRateOfReturn: number;
  };
  utilization: {
    projectedDailySessions: number;
    peakHourUtilization: number;
    averageSessionDuration: number; // minutes
    monthlyEnergySold: number; // kWh
  };
  impact: {
    vehiclesServed: number;
    timeSaved: number; // minutes per day
    emissionsReduced: number; // kg CO2 per month
    gridLoadReduction: number; // kW
  };
  feasibility: {
    landCost: number;
    installationCost: number;
    gridConnectionCost: number;
    permitsRequired: string[];
    estimatedTimeline: number; // months
  };
  risk: {
    competitionRisk: 'low' | 'medium' | 'high';
    demandRisk: 'low' | 'medium' | 'high';
    technicalRisk: 'low' | 'medium' | 'high';
    overallRisk: 'low' | 'medium' | 'high';
  };
  score: number; // 0-100
}

// Generate high-traffic locations for analysis
function generateHighTrafficLocations(): CandidateLocation[] {
  return [
    {
      id: 'CBD-EXPANSION',
      name: 'CBD Central Expansion',
      location: { lat: -1.2921, lng: 36.8219 },
      area: 'CBD',
      trafficDensity: 'high',
      populationDensity: 'high',
      existingInfrastructure: 'excellent'
    },
    {
      id: 'WESTLANDS-HUB',
      name: 'Westlands Business Hub',
      location: { lat: -1.2676, lng: 36.8108 },
      area: 'Westlands',
      trafficDensity: 'high',
      populationDensity: 'high',
      existingInfrastructure: 'good'
    },
    {
      id: 'KASARANI-MALL',
      name: 'Kasarani Shopping Center',
      location: { lat: -1.2198, lng: 36.8975 },
      area: 'Kasarani',
      trafficDensity: 'medium',
      populationDensity: 'high',
      existingInfrastructure: 'good'
    },
    {
      id: 'KIBERA-ACCESS',
      name: 'Kibera Access Point',
      location: { lat: -1.3133, lng: 36.7894 },
      area: 'Kibera',
      trafficDensity: 'medium',
      populationDensity: 'high',
      existingInfrastructure: 'fair'
    },
    {
      id: 'EMBAKASI-DEPOT',
      name: 'Embakasi Industrial Zone',
      location: { lat: -1.3197, lng: 36.8947 },
      area: 'Embakasi',
      trafficDensity: 'high',
      populationDensity: 'medium',
      existingInfrastructure: 'good'
    },
    {
      id: 'AIRPORT-ROAD',
      name: 'Airport Road Corridor',
      location: { lat: -1.3197, lng: 36.8947 },
      area: 'Airport Road',
      trafficDensity: 'high',
      populationDensity: 'medium',
      existingInfrastructure: 'excellent'
    }
  ];
}

// Analyze station placement for a specific location
function analyzeStationPlacement(
  location: CandidateLocation, 
  timeHorizon: number, 
  includeTrafficData: boolean
): StationPlacementAnalysis {
  
  // Calculate utilization based on location characteristics
  const utilization = calculateProjectedUtilization(location, includeTrafficData);
  
  // Calculate ROI
  const roi = calculateROI(location, utilization, timeHorizon);
  
  // Calculate impact
  const impact = calculateImpact(location, utilization);
  
  // Calculate feasibility
  const feasibility = calculateFeasibility(location);
  
  // Assess risks
  const risk = assessRisks(location, utilization);
  
  // Calculate overall score
  const score = calculateOverallScore(roi, utilization, impact, feasibility, risk);
  
  return {
    location,
    roi,
    utilization,
    impact,
    feasibility,
    risk,
    score
  };
}

// Calculate projected utilization
function calculateProjectedUtilization(location: CandidateLocation, includeTrafficData: boolean) {
  // Base utilization factors
  const trafficFactor = location.trafficDensity === 'high' ? 1.5 : 
                       location.trafficDensity === 'medium' ? 1.0 : 0.6;
  
  const populationFactor = location.populationDensity === 'high' ? 1.3 : 
                          location.populationDensity === 'medium' ? 1.0 : 0.7;
  
  const infrastructureFactor = location.existingInfrastructure === 'excellent' ? 1.2 :
                              location.existingInfrastructure === 'good' ? 1.0 :
                              location.existingInfrastructure === 'fair' ? 0.8 : 0.6;
  
  // Calculate base daily sessions
  const baseSessions = 20; // Base sessions per day
  const projectedDailySessions = Math.round(
    baseSessions * trafficFactor * populationFactor * infrastructureFactor
  );
  
  // Peak hour utilization (typically 30% of daily sessions in 2-hour peak)
  const peakHourUtilization = Math.round(projectedDailySessions * 0.3);
  
  // Average session duration (45-60 minutes for matatus)
  const averageSessionDuration = 50;
  
  // Monthly energy sold (assuming 30kWh per session)
  const monthlyEnergySold = projectedDailySessions * 30 * 30; // 30 days
  
  return {
    projectedDailySessions,
    peakHourUtilization,
    averageSessionDuration,
    monthlyEnergySold
  };
}

// Calculate ROI metrics
function calculateROI(location: CandidateLocation, utilization: {
  projectedDailySessions: number;
  peakHourUtilization: number;
  averageSessionDuration: number;
  monthlyEnergySold: number;
}, timeHorizon: number) {
  // Investment costs
  const landCost = location.area === 'CBD' ? 5000000 : 
                   location.area === 'Westlands' ? 4000000 : 3000000; // KSh
  
  const installationCost = 2000000; // KSh for 4 charging points
  const gridConnectionCost = location.existingInfrastructure === 'excellent' ? 500000 :
                            location.existingInfrastructure === 'good' ? 800000 :
                            location.existingInfrastructure === 'fair' ? 1200000 : 1500000;
  
  const totalInvestment = landCost + installationCost + gridConnectionCost;
  
  // Revenue calculations
  const costPerKwh = 25; // KSh per kWh
  const monthlyRevenue = utilization.monthlyEnergySold * costPerKwh;
  const annualRevenue = monthlyRevenue * 12;
  
  // Operating costs (30% of revenue)
  const annualOperatingCosts = annualRevenue * 0.3;
  const annualNetRevenue = annualRevenue - annualOperatingCosts;
  
  // Payback period
  const paybackPeriod = totalInvestment / (annualNetRevenue / 12);
  
  // NPV calculation (assuming 10% discount rate)
  const discountRate = 0.10;
  let npv = -totalInvestment;
  for (let year = 1; year <= Math.ceil(timeHorizon / 12); year++) {
    npv += annualNetRevenue / Math.pow(1 + discountRate, year);
  }
  
  // IRR approximation (simplified)
  const irr = (annualNetRevenue / totalInvestment) * 100;
  
  return {
    totalInvestment,
    monthlyRevenue,
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    netPresentValue: Math.round(npv),
    internalRateOfReturn: Math.round(irr * 10) / 10
  };
}

// Calculate impact metrics
function calculateImpact(location: CandidateLocation, utilization: {
  projectedDailySessions: number;
  peakHourUtilization: number;
  averageSessionDuration: number;
  monthlyEnergySold: number;
}) {
  // Vehicles served (assuming 2 sessions per vehicle per day)
  const vehiclesServed = Math.round(utilization.projectedDailySessions / 2);
  
  // Time saved (assuming 15 minutes saved per charging session)
  const timeSaved = utilization.projectedDailySessions * 15;
  
  // Emissions reduced (assuming 0.5kg CO2 per kWh saved)
  const emissionsReduced = utilization.monthlyEnergySold * 0.5;
  
  // Grid load reduction (assuming 50kW average load)
  const gridLoadReduction = 50;
  
  return {
    vehiclesServed,
    timeSaved,
    emissionsReduced: Math.round(emissionsReduced),
    gridLoadReduction
  };
}

// Calculate feasibility metrics
function calculateFeasibility(location: CandidateLocation) {
  const landCost = location.area === 'CBD' ? 5000000 : 
                   location.area === 'Westlands' ? 4000000 : 3000000;
  
  const installationCost = 2000000;
  const gridConnectionCost = location.existingInfrastructure === 'excellent' ? 500000 :
                            location.existingInfrastructure === 'good' ? 800000 :
                            location.existingInfrastructure === 'fair' ? 1200000 : 1500000;
  
  const permitsRequired = [
    'Environmental Impact Assessment',
    'County Planning Permission',
    'Electrical Installation License',
    'Business Registration'
  ];
  
  const estimatedTimeline = location.existingInfrastructure === 'excellent' ? 6 :
                           location.existingInfrastructure === 'good' ? 8 :
                           location.existingInfrastructure === 'fair' ? 12 : 18;
  
  return {
    landCost,
    installationCost,
    gridConnectionCost,
    permitsRequired,
    estimatedTimeline
  };
}

// Assess risks
function assessRisks(location: CandidateLocation, utilization: {
  projectedDailySessions: number;
  peakHourUtilization: number;
  averageSessionDuration: number;
  monthlyEnergySold: number;
}): StationPlacementAnalysis['risk'] {
  // Competition risk (based on existing stations nearby)
  const competitionRisk = location.area === 'CBD' ? 'high' : 
                         location.area === 'Westlands' ? 'medium' : 'low';
  
  // Demand risk (based on traffic and population density)
  const demandRisk = location.trafficDensity === 'high' && location.populationDensity === 'high' ? 'low' :
                    location.trafficDensity === 'medium' || location.populationDensity === 'medium' ? 'medium' : 'high';
  
  // Technical risk (based on infrastructure)
  const technicalRisk = location.existingInfrastructure === 'excellent' ? 'low' :
                       location.existingInfrastructure === 'good' ? 'low' :
                       location.existingInfrastructure === 'fair' ? 'medium' : 'high';
  
  // Overall risk assessment
  const riskScores = {
    low: 1, medium: 2, high: 3
  };
  
  const avgRiskScore = (riskScores[competitionRisk] + riskScores[demandRisk] + riskScores[technicalRisk]) / 3;
  const overallRisk = avgRiskScore <= 1.5 ? 'low' : avgRiskScore <= 2.5 ? 'medium' : 'high';
  
  return {
    competitionRisk,
    demandRisk,
    technicalRisk,
    overallRisk
  };
}

// Calculate overall score
function calculateOverallScore(
  roi: { internalRateOfReturn: number },
  utilization: { projectedDailySessions: number },
  impact: { vehiclesServed: number },
  feasibility: { estimatedTimeline: number },
  risk: { overallRisk: 'low' | 'medium' | 'high' }
): number {
  // Weighted scoring system
  const roiScore = Math.min(100, (roi.internalRateOfReturn / 20) * 100); // 20% IRR = 100 points
  const utilizationScore = Math.min(100, (utilization.projectedDailySessions / 50) * 100); // 50 sessions = 100 points
  const impactScore = Math.min(100, (impact.vehiclesServed / 25) * 100); // 25 vehicles = 100 points
  const feasibilityScore = feasibility.estimatedTimeline <= 8 ? 100 : 
                          feasibility.estimatedTimeline <= 12 ? 80 : 60;
  const riskScore = risk.overallRisk === 'low' ? 100 : 
                   risk.overallRisk === 'medium' ? 70 : 40;
  
  // Weighted average
  const score = (roiScore * 0.3 + utilizationScore * 0.25 + impactScore * 0.2 + 
                feasibilityScore * 0.15 + riskScore * 0.1);
  
  return Math.round(score);
}

// Rank station locations
function rankStationLocations(analyses: StationPlacementAnalysis[]): StationPlacementAnalysis[] {
  return analyses.sort((a, b) => b.score - a.score);
}

// Calculate fleet impact
function calculateFleetImpact(rankedAnalyses: StationPlacementAnalysis[]) {
  const totalVehiclesServed = rankedAnalyses.reduce((sum, analysis) => sum + analysis.impact.vehiclesServed, 0);
  const totalTimeSaved = rankedAnalyses.reduce((sum, analysis) => sum + analysis.impact.timeSaved, 0);
  const totalEmissionsReduced = rankedAnalyses.reduce((sum, analysis) => sum + analysis.impact.emissionsReduced, 0);
  const totalInvestment = rankedAnalyses.reduce((sum, analysis) => sum + analysis.roi.totalInvestment, 0);
  
  return {
    totalVehiclesServed,
    totalTimeSaved,
    totalEmissionsReduced,
    totalInvestment,
    averageROI: rankedAnalyses.reduce((sum, analysis) => sum + analysis.roi.internalRateOfReturn, 0) / rankedAnalyses.length,
    topPerformingLocation: rankedAnalyses[0]?.location.name || 'None'
  };
}

// Generate placement recommendations
function generatePlacementRecommendations(rankedAnalyses: StationPlacementAnalysis[]): string[] {
  const recommendations = [];
  
  if (rankedAnalyses.length === 0) return ['No suitable locations found'];
  
  const topLocation = rankedAnalyses[0];
  
  recommendations.push(`🏆 Top recommendation: ${topLocation.location.name} (Score: ${topLocation.score}/100)`);
  recommendations.push(`💰 ROI: ${topLocation.roi.internalRateOfReturn}% with ${topLocation.roi.paybackPeriod}-month payback`);
  recommendations.push(`🚐 Will serve ${topLocation.impact.vehiclesServed} vehicles daily`);
  recommendations.push(`⏱️ Save ${topLocation.impact.timeSaved} minutes of charging time per day`);
  
  if (topLocation.risk.overallRisk === 'low') {
    recommendations.push('✅ Low risk investment with high success probability');
  } else if (topLocation.risk.overallRisk === 'medium') {
    recommendations.push('⚠️ Medium risk - monitor market conditions closely');
  } else {
    recommendations.push('🚨 High risk - consider alternative locations or phased approach');
  }
  
  // Additional recommendations based on analysis
  const highROILocations = rankedAnalyses.filter(a => a.roi.internalRateOfReturn > 15);
  if (highROILocations.length > 1) {
    recommendations.push(`💡 Consider multi-location strategy: ${highROILocations.length} locations with >15% ROI`);
  }
  
  const quickPaybackLocations = rankedAnalyses.filter(a => a.roi.paybackPeriod < 24);
  if (quickPaybackLocations.length > 0) {
    recommendations.push(`⚡ Quick payback opportunities: ${quickPaybackLocations.length} locations under 24 months`);
  }
  
  return recommendations;
}

// Calculate existing station utilization
function calculateStationUtilization(station: ChargerStation): number {
  const utilizationRate = (station.plugsTotal - station.plugsAvailable) / station.plugsTotal;
  return Math.round(utilizationRate * 100);
}
