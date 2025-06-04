import { ReactNode } from 'react';

// API Response Types
export interface AttackAnalysis {
  success: boolean;
  confidence: number;
  evidence: string[];
  risk_level: string;
  detected_techniques: string[];
  explanation: string;
}

export interface AttackResult {
  attempt: number;
  generated_prompt: string;
  test_result: {
    success: boolean;
    llm_output: string;
    analysis: AttackAnalysis;
  };
  timestamp: number;
}

export interface AutoAttackResponse {
  session_id: number;
  system_prompt: string;
  total_attempts: number;
  successful_attacks: AttackResult[];
  failed_attacks: AttackResult[];
  final_success: boolean;
  breakthrough_attack: AttackResult | null;
  session_log: string[];
  analysis: {
    success_rate: number;
    vulnerability_severity: string;
    recommendations: string[];
    breakthrough_analysis?: {
      attempt_number: number;
      success_indicators: string[];
      risk_assessment: string;
    };
    attack_progression: unknown[];
  };
}

export interface LLMResponse {
  llm_output: string;
  error?: string;
  [key: string]: unknown; // Allow additional properties
}

export interface PromptfooInstallation {
  installed: boolean;
  error?: string;
  version?: string;
  node_version?: string;
  promptfoo_version?: string;
  ollama_host?: string;
}

// Component Props Types
export interface AttackAnalysisProps {
  analysis: AttackAnalysis;
}

export interface AttackLevelSelectorProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
}

export interface ThemeContextType {
  theme: Theme;
  changeTheme: (newTheme: Theme) => void;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'hacker';

// Vulnerability types
export type VulnerabilityType = 
  | 'prompt-injection'
  | 'sensitive-disclosure'
  | 'system-prompt-leakage'
  | 'misinformation'
  | 'harmful-content'
  | 'role-hijacking'
  | 'excessive-agency';

export interface Vulnerability {
  id: string;
  name: string;
  has_demo: boolean;
}