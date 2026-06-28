export interface Task {
  id: string;
  userId?: string;
  name: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  complexity: "easy" | "medium" | "hard";
  category: "study" | "work" | "health" | "social";
  completed: boolean;
  focusHoursPlanned: number;
  focusHoursLogged: number;
  postponedCount: number;
  createdAt: string;
}

export interface Bill {
  id: string;
  userId?: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  createdAt: string;
}

export interface JobInterview {
  id: string;
  company: string;
  role: string;
  date: string;
  stage: "Applied" | "Screening" | "Interview" | "Offered" | "Rejected";
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  dateTime: string;
  attendees: string[];
  location: string;
  createdAt: string;
}

export interface Commitment {
  id: string;
  title: string;
  deadline: string;
  description: string;
  isImportant: boolean;
  isCompleted: boolean;
  createdAt: string;
}

export interface BurnoutMetrics {
  riskLevel: "Low" | "Medium" | "High";
  burnoutScore: number;
  factors: {
    tasks: string;
    density: string;
    focus: string;
  };
  insights: string[];
  recommendations: string[];
}

export interface TimeMachineScenario {
  type: string;
  probability: number;
  workload: number;
  stress: number;
  prediction: string;
}

export interface RiskRadarResult {
  id: string;
  name: string;
  riskLevel: "High" | "Medium" | "Low";
  riskScore: number;
  reason: string;
  mitigation: string;
}

export interface ProductivityDNAProfile {
  archetype: string;
  title: string;
  percentageMatch: number;
  description: string;
  strengths: string[];
  weaknesses: string[];
  superpower: string;
  improvementTip: string;
}

export interface WhatIfResult {
  consequence: string;
  downstreamDelayRisk: "High" | "Medium" | "Low";
  downstreamDelayScore: number;
  impactedTasks: string[];
  mitigation: string;
}

export interface OptimizedBlock {
  label: string;
  startTime: string;
  endTime: string;
  type: "focus" | "rest" | "collaboration";
  durationMinutes: number;
  tip: string;
}

export interface AICoachMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
  suggestedAction?: string;
  suggestedActionLabel?: string;
}

export interface WeeklyInsightReport {
  productivityTrendScore: number;
  focusTrendScore: number;
  growthReport: string;
  weeklyRecap: string;
  chartData: Array<{
    day: string;
    completed: number;
    focusHours: number;
  }>;
}
