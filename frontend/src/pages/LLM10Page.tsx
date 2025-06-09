import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { VulnerabilityPageLayout } from '../components/layout';
import { Card, Alert, Button } from '../components/ui';

const LLM10Page = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => setTimer(timer => timer + 1), 10);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const runDemo = async (promptType = 'long_text') => {
    setLoading(true);
    setIsRunning(true);
    setTimer(0);
    setResult(null);
    
    try {
      const response = await axios.post('/api/v1/2025/LLM10/run_demo', {
        prompt_type: promptType
      });
      setResult(response.data);
    } catch (error) {
      setResult({ error: 'Failed to run demo' });
    }
    
    setLoading(false);
    setIsRunning(false);
  };

  const formatTime = (centiseconds) => {
    const totalMs = centiseconds * 10;
    const seconds = Math.floor(totalMs / 1000);
    const ms = totalMs % 1000;
    return `${seconds}.${ms.toString().padStart(3, '0')}s`;
  };

  const runComparison = async () => {
    // First run a simple query for comparison
    setLoading(true);
    try {
      const simpleStart = Date.now();
      await axios.post('/api/v1/2025/LLM01/run_demo', {
        user_input: 'Hello, how are you?'
      });
      const simpleTime = Date.now() - simpleStart;
      
      // Then run the resource-intensive query
      const heavyResponse = await axios.post('/api/v1/2025/LLM10/run_demo', {
        prompt_type: 'long_text'
      });
      
      setResult({
        ...heavyResponse.data,
        comparison: {
          simple_time: simpleTime,
          heavy_time: heavyResponse.data.response_time_ms
        }
      });
    } catch (error) {
      setResult({ error: 'Failed to run comparison' });
    }
    setLoading(false);
  };

  const additionalInfo = (
    <div>
      <div className="demo-section">
        <h3>💸 Types of Resource Consumption Attacks</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <h4>🔄 Repetitive Requests</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Sending many requests in rapid succession to overwhelm the system's capacity to process them.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <h4>📄 Large Input Prompts</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Extremely long prompts that consume maximum context window and processing time.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <h4>🧠 Complex Reasoning Tasks</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Requests requiring intensive computation like complex math, logic puzzles, or analysis.
            </p>
          </div>
          
          <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <h4>📋 Long Output Generation</h4>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Requesting extremely long responses that consume processing time and memory.
            </p>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>🚨 Impact and Consequences</h3>
        <ul>
          <li><strong>Denial of Service:</strong> Legitimate users unable to access the service</li>
          <li><strong>Increased Costs:</strong> Higher computational costs, especially in cloud environments</li>
          <li><strong>Performance Degradation:</strong> Slower response times for all users</li>
          <li><strong>Resource Starvation:</strong> System resources exhausted, affecting other services</li>
          <li><strong>Economic Impact:</strong> "Denial of wallet" attacks that drain financial resources</li>
          <li><strong>Service Instability:</strong> Potential system crashes or failures under load</li>
        </ul>
      </div>
    </div>
  );

  return (
    <VulnerabilityPageLayout
      title="LLM10:2025 Unbounded Consumption"
      overview="Unbounded consumption attacks exploit the computational intensity of LLM operations to exhaust system resources.\n\nThis vulnerability arises because LLM inference scales non-linearly with input size - processing time increases quadratically with sequence length due to self-attention mechanisms. Attackers can craft requests that maximize compute cycles through techniques like token multiplication (repeating tokens to fill context windows), complexity amplification (requesting recursive reasoning tasks), parallel session spawning, and deliberate cache misses. The attack surface includes API endpoints without rate limiting, applications that accept arbitrary input lengths, services lacking timeout controls, and systems vulnerable to prompt chaining attacks. Modern transformer architectures make this particularly dangerous because attention computation requires O(n²) memory and time complexity, where n is sequence length. Even small increases in input size can cause exponential resource consumption."
      demoScenario="In this demo, we'll send resource-intensive prompts to the local LLM and measure the response time and computational impact. This demonstrates how attackers could potentially overwhelm LLM services with computationally expensive requests."
      mitigations={[
        '<strong>Rate Limiting:</strong> Implement per-user and per-IP request limits',
        '<strong>Input Length Limits:</strong> Restrict maximum prompt length and complexity',
        '<strong>Response Length Limits:</strong> Cap the maximum length of generated responses',
        '<strong>Timeout Controls:</strong> Set maximum processing time for requests',
        '<strong>Resource Monitoring:</strong> Monitor CPU, memory, and processing time usage',
        '<strong>Queue Management:</strong> Implement fair queuing to prevent resource monopolization',
        '<strong>Authentication:</strong> Require user authentication to enable tracking and limits',
        '<strong>Cost Controls:</strong> Set budget limits and alerts for computational spending',
        '<strong>Load Balancing:</strong> Distribute requests across multiple instances',
        '<strong>Caching:</strong> Cache responses to reduce repeated computation',
      ]}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <Button 
          onClick={() => runDemo('long_text')} 
          disabled={loading}
        >
          🚀 Run Resource-Intensive Attack
        </Button>
        
        <Button 
          onClick={runComparison} 
          disabled={loading}
          variant="success"
        >
          📊 Run Comparison Test
        </Button>
      </div>

      {isRunning && (
        <Alert type="info" title={`⏱️ Processing Time: ${formatTime(timer)}`}>
          Running resource-intensive operation...
        </Alert>
      )}

      {result && (
        <div className="output-section">
          {result.error ? (
            <Alert type="danger" title="Error:">
              {result.error}
            </Alert>
          ) : (
            <>
              <Card title="⏱️ Performance Metrics">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '6px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#856404' }}>
                      {(result.response_time_ms / 1000).toFixed(2)}s
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>Response Time</p>
                  </div>
                  
                  <div style={{ padding: '16px', background: result.status === 'success' ? '#d4edda' : '#f8d7da', border: `1px solid ${result.status === 'success' ? '#c3e6cb' : '#f5c6cb'}`, borderRadius: '6px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: result.status === 'success' ? '#155724' : '#721c24' }}>
                      {result.status.toUpperCase()}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>Request Status</p>
                  </div>
                  
                  {result.comparison && (
                    <>
                      <div style={{ padding: '16px', background: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '6px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#0c5460' }}>
                          {(result.comparison.simple_time / 1000).toFixed(2)}s
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>Simple Query Time</p>
                      </div>
                      
                      <div style={{ padding: '16px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '6px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#721c24' }}>
                          {Math.round(result.response_time_ms / result.comparison.simple_time)}x
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>Slower Than Normal</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <Card title="📊 Simulated Resource Usage">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <h5>CPU Usage</h5>
                    <div style={{ background: '#e9ecef', height: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          background: result.response_time_ms > 5000 ? '#dc3545' : '#ffc107', 
                          height: '100%', 
                          width: `${Math.min(100, (result.response_time_ms / 10000) * 100)}%`,
                          transition: 'width 2s ease'
                        }}
                      />
                    </div>
                    <small>{Math.min(100, Math.round((result.response_time_ms / 10000) * 100))}%</small>
                  </div>
                  
                  <div>
                    <h5>Memory Usage</h5>
                    <div style={{ background: '#e9ecef', height: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          background: result.response_time_ms > 5000 ? '#dc3545' : '#28a745', 
                          height: '100%', 
                          width: `${Math.min(90, (result.response_time_ms / 8000) * 100)}%`,
                          transition: 'width 2s ease'
                        }}
                      />
                    </div>
                    <small>{Math.min(90, Math.round((result.response_time_ms / 8000) * 100))}%</small>
                  </div>
                </div>
              </Card>

              <Card title="💬 LLM Response (Truncated)">
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  background: '#f8f9fa', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {result.llm_output}
                  {result.llm_output.endsWith('...') && (
                    <div style={{ fontStyle: 'italic', color: '#666', marginTop: '8px' }}>
                      [Output truncated due to length...]
                    </div>
                  )}
                </div>
              </Card>

              {result.response_time_ms > 5000 && (
                <Alert type="danger" title="Performance Impact Detected">
                  This request took significantly longer than baseline, demonstrating how resource-intensive 
                  operations can degrade system performance and availability for other users.
                </Alert>
              )}
            </>
          )}
        </div>
      )}
      
      {additionalInfo}
    </VulnerabilityPageLayout>
  );
};

export default LLM10Page;
