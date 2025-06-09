import React from 'react';
import Alert from '../ui/Alert';
import LLMResponse from './LLMResponse';
import MetricsDisplay from './MetricsDisplay';
import Card from '../ui/Card';

interface DemoResult {
  llm_output?: string;
  breakthrough_detected?: boolean;
  detected_issues?: string[];
  system_prompt_hint?: string;
  timestamp?: string;
  input_length?: number;
  error?: string;
  // Enhanced results
  attack_success_score?: number;
  success_level?: string;
  attack_level?: string;
  // LLM10 specific
  processing_time_seconds?: number;
  resource_metrics?: any;
  warnings?: string[];
  // LLM02 specific
  sensitive_output_detected?: boolean;
  detected_sensitive_parts?: string[];
  sensitive_context?: any;
  // Custom fields
  [key: string]: any;
}

interface DemoResultsProps {
  result: DemoResult | null;
  loading?: boolean;
  showSystemPrompt?: boolean;
  showSensitiveContext?: boolean;
  showMetrics?: boolean;
  customMetrics?: Array<{
    label: string;
    value: string | number;
    type?: 'success' | 'danger' | 'warning' | 'info' | 'default';
    unit?: string;
  }>;
  additionalPanels?: React.ReactNode[];
}

const DemoResults: React.FC<DemoResultsProps> = ({
  result,
  loading = false,
  showSystemPrompt = true,
  showSensitiveContext = false,
  showMetrics = true,
  customMetrics = [],
  additionalPanels = [],
}) => {
  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          🔄 Running analysis...
        </div>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  if (result.error) {
    return (
      <Card variant="danger">
        <Alert type="danger" title="Error:">
          {result.error}
        </Alert>
      </Card>
    );
  }

  // Standard metrics
  const isVulnerable = result.breakthrough_detected || result.sensitive_output_detected;
  const standardMetrics = [
    {
      label: 'Status',
      value: isVulnerable ? 'VULNERABLE' : 'SECURE',
      type: isVulnerable ? 'danger' as const : 'success' as const,
    },
    ...(result.input_length ? [{
      label: 'Input Length',
      value: result.input_length,
      type: 'info' as const,
      unit: 'chars'
    }] : []),
    ...(result.processing_time_seconds ? [{
      label: 'Processing Time',
      value: result.processing_time_seconds,
      type: 'info' as const,
      unit: 's'
    }] : []),
    ...(result.attack_success_score !== undefined ? [{
      label: 'Attack Score',
      value: result.attack_success_score,
      type: result.attack_success_score >= 50 ? 'danger' as const : 
            result.attack_success_score >= 25 ? 'warning' as const : 'success' as const,
      unit: 'pts'
    }] : []),
    ...customMetrics,
  ];

  return (
    <div className="output-section">
      {/* Security Alert */}
      {result.breakthrough_detected && result.detected_issues && (
        <Alert type="danger" title="Security Vulnerability Exploited">
          {result.detected_issues.join(', ')}
        </Alert>
      )}

      {/* Sensitive Data Alert for LLM02 */}
      {result.sensitive_output_detected && result.detected_sensitive_parts && (
        <Alert type="danger" title="Sensitive Data Exposed">
          The system revealed the following sensitive information: {result.detected_sensitive_parts.join(', ')}
        </Alert>
      )}

      {/* Success Level Alert for Enhanced Demos */}
      {result.success_level && result.success_level !== 'Failed' && (
        <Alert 
          type={result.success_level === 'Critical' ? 'danger' : 'warning'}
          title={`Attack Success: ${result.success_level}`}
        >
          {result.attack_level && `Attack Level: ${result.attack_level} | `}
          Score: {result.attack_success_score || 0} points
        </Alert>
      )}

      {/* Warnings */}
      {result.warnings && result.warnings.filter(Boolean).length > 0 && (
        <Alert type="warning" title="⚠️ Warnings:">
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {result.warnings.filter(Boolean).map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Sensitive Context (LLM02) */}
      {showSensitiveContext && result.sensitive_context && (
        <Card title="🔒 Simulated Sensitive Context (Normally Hidden)" collapsible defaultCollapsed>
          <pre className="warning">
            {JSON.stringify(result.sensitive_context, null, 2)}
          </pre>
          <small style={{ color: '#856404' }}>
            ℹ️ This data is passed to the LLM as context but should never be revealed to users
          </small>
        </Card>
      )}

      {/* LLM Response */}
      {result.llm_output && (
        <LLMResponse
          response={result.llm_output}
          isVulnerable={isVulnerable}
          sensitiveItems={result.detected_issues || result.detected_sensitive_parts}
          metadata={{
            timestamp: result.timestamp,
            inputLength: result.input_length,
            processingTime: result.processing_time_seconds,
            additionalInfo: result.success_level ? `Attack Level: ${result.success_level}` : undefined,
          }}
        />
      )}

      {/* Metrics */}
      {showMetrics && standardMetrics.length > 0 && (
        <MetricsDisplay
          metrics={standardMetrics}
          title="📊 Analysis Results"
        />
      )}

      {/* Resource Metrics for LLM10 */}
      {result.resource_metrics && (
        <MetricsDisplay
          metrics={[
            {
              label: 'CPU Usage',
              value: Math.round(result.resource_metrics.cpu_usage || 0),
              type: result.resource_metrics.cpu_usage > 80 ? 'danger' as const : 
                    result.resource_metrics.cpu_usage > 50 ? 'warning' as const : 'success' as const,
              unit: '%'
            },
            {
              label: 'Memory Usage',
              value: Math.round(result.resource_metrics.memory_usage || 0),
              type: result.resource_metrics.memory_usage > 80 ? 'danger' as const : 
                    result.resource_metrics.memory_usage > 50 ? 'warning' as const : 'success' as const,
              unit: '%'
            },
            {
              label: 'Tokens/sec',
              value: Math.round(result.resource_metrics.tokens_per_second || 0),
              type: 'info' as const,
            },
            {
              label: 'Est. Cost',
              value: (result.resource_metrics.estimated_cost || 0).toFixed(4),
              type: 'info' as const,
              unit: '$'
            },
          ]}
          title="⚡ Resource Consumption"
        />
      )}

      {/* System Prompt Information */}
      {showSystemPrompt && result.system_prompt_hint && (
        <Card title="🔍 System Protection Details" collapsible defaultCollapsed>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            {result.system_prompt_hint}
          </div>
          {result.timestamp && (
            <div style={{ fontSize: '11px', color: '#999' }}>
              Timestamp: {new Date(result.timestamp).toLocaleString()}
            </div>
          )}
        </Card>
      )}

      {/* Additional Custom Panels */}
      {additionalPanels.map((panel, index) => (
        <div key={index}>
          {panel}
        </div>
      ))}
    </div>
  );
};

export default DemoResults;