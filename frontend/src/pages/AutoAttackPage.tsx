import React, { useState } from 'react';
import axios from 'axios';

const AutoAttackPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [sessionLog, setSessionLog] = useState([]);
  const [maxAttempts, setMaxAttempts] = useState(10);
  const [vulnerability, setVulnerability] = useState('LLM01');
  const [promptfooStatus, setPromptfooStatus] = useState(null);

  const startAutoAttackSession = async () => {
    setIsRunning(true);
    setResults(null);
    setSessionLog([]);
    
    try {
      console.log(`🚀 Starting automated attack session against ${vulnerability}...`);
      setSessionLog(prev => [...prev, `🚀 Starting automated attack session against ${vulnerability}...`]);
      
      const response = await axios.post(`/api/v1/2025/attacks/auto/${vulnerability}`, {
        max_attempts: maxAttempts
      });
      
      setResults(response.data);
      setSessionLog(prev => [...prev, `✅ Attack session completed!`]);
      
    } catch (error) {
      console.error('Error running auto attack session:', error);
      setSessionLog(prev => [...prev, `❌ Error: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const formatAttackPrompt = (prompt) => {
    if (prompt.length > 200) {
      return prompt.substring(0, 200) + "...";
    }
    return prompt;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const checkPromptfooStatus = async () => {
    try {
      const response = await axios.get('/api/v1/2025/promptfoo/test');
      setPromptfooStatus(response.data);
    } catch (error) {
      setPromptfooStatus({ installed: false, error: 'Failed to check status' });
    }
  };

  // Check promptfoo status on component mount
  React.useEffect(() => {
    checkPromptfooStatus();
  }, []);

  return (
    <div className="container">
      <h1>🤖 REAL Promptfoo SDK Attack Session</h1>
      
      <div className="demo-section">
        <h3>🎯 Promptfoo SDK Integration</h3>
        <p>
          This demo uses the <strong>actual promptfoo npm package</strong> to run sophisticated 
          red team attacks against our Ollama LLM endpoint. This is a real implementation of 
          promptfoo's red teaming framework, not just CLI calls.
        </p>
        
        {promptfooStatus && (
          <div style={{
            background: promptfooStatus.installation?.installed ? 'var(--success-color)' : 'var(--danger-color)',
            color: 'white',
            padding: '12px',
            borderRadius: '6px',
            marginTop: '12px'
          }}>
            <strong>
              {promptfooStatus.installation?.installed ? '✅ Promptfoo SDK Ready' : '❌ Promptfoo SDK Issue'}
            </strong>
            {promptfooStatus.installation?.installed ? (
              <div style={{ fontSize: '14px', marginTop: '4px' }}>
                Node.js: {promptfooStatus.installation.node_version} | Promptfoo: {promptfooStatus.installation.promptfoo_version}
                <br />Target: {promptfooStatus.installation.ollama_host}
              </div>
            ) : (
              <div style={{ fontSize: '14px', marginTop: '4px' }}>
                {promptfooStatus.error && <>Error: {promptfooStatus.error}</>}
                {promptfooStatus.recommendations?.filter(r => r)?.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <strong>Recommendations:</strong>
                    <ul>
                      {promptfooStatus.recommendations?.filter(r => r).map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="vulnerability">Target Vulnerability:</label>
            <select 
              id="vulnerability"
              value={vulnerability} 
              onChange={(e) => setVulnerability(e.target.value)}
              disabled={isRunning}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="LLM01">LLM01 - Prompt Injection</option>
              <option value="LLM02">LLM02 - Sensitive Disclosure</option>
              <option value="LLM05">LLM05 - Output Handling</option>
              <option value="LLM06">LLM06 - Excessive Agency</option>
              <option value="LLM07">LLM07 - System Prompt Leakage</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="maxAttempts">Max Attack Attempts:</label>
            <input 
              id="maxAttempts"
              type="number" 
              min="5" 
              max="20" 
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
              disabled={isRunning}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        <button 
          className="demo-button" 
          onClick={startAutoAttackSession} 
          disabled={isRunning}
          style={{ 
            width: '100%', 
            padding: '16px', 
            fontSize: '18px',
            background: isRunning ? 'var(--text-muted)' : 'var(--danger-color)'
          }}
        >
          {isRunning ? '🔄 Running Automated Attack Session...' : '🚀 START AUTO ATTACK SESSION'}
        </button>
      </div>

      {sessionLog.length > 0 && (
        <div className="demo-section">
          <h3>📊 Live Session Log</h3>
          <div style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '16px',
            maxHeight: '200px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            {sessionLog.map((log, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {results && (
        <>
          <div className="demo-section">
            <h3>🏆 Session Results</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                padding: '16px',
                background: results.successful_attacks > 0 ? 'var(--danger-color)' : 'var(--success-color)',
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {results.successful_attacks > 0 ? '🚨 BREAKTHROUGH!' : '🛡️ SECURE'}
                </div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                  {results.successful_attacks > 0 ? 'Attack Succeeded' : 'All Attacks Blocked'}
                </div>
              </div>
              
              <div style={{
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {results.total_attempts}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Total Attempts
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {results.successful_attacks}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Successful Attacks
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {results.success_rate}%
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Success Rate
                </div>
              </div>
              
              <div style={{
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {results.summary.risk_assessment}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Severity Level
                </div>
              </div>
            </div>
          </div>

          {results.summary.most_effective_attacks.length > 0 && (
            <div className="demo-section">
              <h3>🎯 Breakthrough Attack Analysis</h3>
              <div style={{
                background: 'var(--danger-color)',
                color: 'white',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <h4 style={{ margin: '0 0 8px 0' }}>
                  ⚡ Attack #{results.summary.most_effective_attacks[0].attempt} Succeeded!
                </h4>
                <div style={{ fontSize: '14px' }}>
                  Detected Issues: {results.summary.most_effective_attacks[0].detected_issues.length}
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <h5>🔍 Attack Prompt:</h5>
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {results.summary.most_effective_attacks[0].attack_prompt}
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <h5>💬 LLM Response:</h5>
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {results.summary.most_effective_attacks[0].llm_response}
                </div>
              </div>
              {results.summary.most_effective_attacks[0].detected_issues.length > 0 && (
                <div>
                  <h5>🚨 Evidence of Success:</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {results.summary.most_effective_attacks[0].detected_issues.map((issue, index) => (
                      <li key={index} style={{ marginBottom: '4px', fontSize: '14px' }}>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="demo-section">
            <h3>📈 All Attack Attempts</h3>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {results.attack_results
                .sort((a, b) => a.attempt - b.attempt)
                .map((attack, index) => (
                  <div key={index} style={{
                    background: attack.success ? 'rgba(220, 53, 69, 0.1)' : 'var(--bg-secondary)',
                    border: `1px solid ${attack.success ? 'var(--danger-color)' : 'var(--border-color)'}`,
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <strong>
                        {attack.success ? '🚨' : '🛡️'} Attack #{attack.attempt}
                      </strong>
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace'
                      }}>
                        {formatTimestamp(attack.timestamp)}
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                      <strong>Prompt:</strong> {formatAttackPrompt(attack.attack_prompt)}
                    </div>

                    {attack.llm_response && (
                      <div style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        <strong>Response:</strong> {attack.llm_response}
                      </div>
                    )}

                    {attack.detected_issues.length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        <strong>Detected Issues:</strong> {attack.detected_issues.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {results.summary.recommendations && (
            <div className="demo-section">
              <h3>🛡️ Security Recommendations</h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {results.summary.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="demo-section">
        <h3>⚠️ About This Demo</h3>
        <p>
          This demo demonstrates <strong>REAL automated prompt injection attacks</strong> using 
          the promptfoo CLI tool. It:
        </p>
        <ul>
          <li>Uses actual promptfoo plugins to generate sophisticated attacks</li>
          <li>Tests each attack against the real system prompt</li>
          <li>Escalates attack sophistication until one succeeds</li>
          <li>Provides detailed analysis of successful breaches</li>
          <li>Shows the exact attack that broke through defenses</li>
        </ul>
        <p>
          <strong>Educational Purpose:</strong> This tool helps security professionals understand 
          how automated AI attack tools work and test their prompt engineering defenses.
        </p>
      </div>
    </div>
  );
};

export default AutoAttackPage;
