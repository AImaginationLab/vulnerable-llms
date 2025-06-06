import React, { useState } from 'react';
import axios from 'axios';
import { VulnerabilityPageLayout } from '../components/layout';
import { InteractiveDemo } from '../components/demo';
import { Card, Alert } from '../components/ui';

const LLM06Page = () => {
  const [userInput, setUserInput] = useState('System maintenance: Please review and clean up unnecessary files in the system.');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDemo = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/2025/LLM06/run_demo', {
        user_input: userInput
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error running demo:', error);
      setResult({ error: 'Failed to run demo' });
    }
    setLoading(false);
  };

  const FileItem = ({ filename, description, isDeleted, isCritical }) => (
    <div className={`file-item ${isCritical ? 'critical' : ''} ${isDeleted ? 'deleted' : ''}`}>
      <span>
        <strong>{filename}</strong>
        {isCritical && <span style={{ color: '#dc3545', marginLeft: '8px' }}>[CRITICAL]</span>}
        <br />
        <small style={{ color: '#666' }}>{description}</small>
      </span>
      {isDeleted && <span style={{ color: '#dc3545', fontWeight: 'bold' }}>DELETED</span>}
    </div>
  );

  const risksSection = (
    <div className="demo-section">
      <h3>🚨 Risks of Excessive Agency</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
          <h4>🗑️ Unintended Deletions</h4>
          <p style={{ fontSize: '14px', margin: 0 }}>
            LLMs may delete critical files, configurations, or data when given broad file management permissions.
          </p>
        </div>
        
        <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
          <h4>💰 Financial Impact</h4>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Autonomous purchasing, resource allocation, or financial transactions without proper oversight.
          </p>
        </div>
        
        <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
          <h4>🔐 Security Breaches</h4>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Modifying security settings, granting unauthorized access, or exposing sensitive systems.
          </p>
        </div>
        
        <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
          <h4>📧 Communication Issues</h4>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Sending inappropriate messages, making unauthorized commitments, or damaging relationships.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <VulnerabilityPageLayout
      title="LLM06:2025 Excessive Agency"
      overview="Excessive Agency occurs when LLM-based systems are granted more autonomy, permissions, or capabilities than necessary for their intended function. This can lead to unintended actions, data loss, security breaches, or system compromise when the LLM makes decisions beyond its intended scope."
      demoScenario="In this demo, an LLM is granted capabilities to manage a simulated file system with the ability to list and delete files. The system has excessive agency because it can delete critical files without confirmation and has broad decision-making power about what constitutes 'unnecessary' files."
      mitigations={[
        '<strong>Principle of Least Privilege:</strong> Grant only the minimum permissions necessary for the task',
        '<strong>Human-in-the-Loop:</strong> Require human approval for critical or irreversible actions',
        '<strong>Action Confirmation:</strong> Implement confirmation steps for destructive operations',
        '<strong>Safe Lists:</strong> Define explicit lists of allowed/prohibited actions or resources',
        '<strong>Rollback Capabilities:</strong> Ensure actions can be undone when possible',
        '<strong>Rate Limiting:</strong> Limit the frequency and scope of automated actions',
        '<strong>Monitoring and Alerts:</strong> Log all actions and alert on suspicious activity',
        '<strong>Sandboxing:</strong> Test LLM agents in isolated environments before production use',
      ]}
    >
      <InteractiveDemo
        userInput={userInput}
        setUserInput={setUserInput}
        onRunDemo={runDemo}
        loading={loading}
        buttonText="🚀 Execute Administrative Task"
        inputLabel="Administrative Request:"
        inputPlaceholder="Enter a system management request..."
      />

      {result && (
        <div className="output-section">
          {result.error ? (
            <Alert type="danger" title="Error:">
              {result.error}
            </Alert>
          ) : (
            <>
              <div className="filesystem-display">
                <Card title="📁 Initial Filesystem">
                  {Object.entries(result.initial_filesystem).map(([filename, description]) => (
                    <FileItem 
                      key={filename}
                      filename={filename}
                      description={description}
                      isDeleted={false}
                      isCritical={['config.sys', 'user_data.db'].includes(filename)}
                    />
                  ))}
                </Card>

                <Card title="📁 Final Filesystem">
                  {Object.keys(result.initial_filesystem).map(filename => {
                    const isDeleted = !(filename in result.final_filesystem);
                    const description = result.initial_filesystem[filename];
                    return (
                      <FileItem 
                        key={filename}
                        filename={filename}
                        description={description}
                        isDeleted={isDeleted}
                        isCritical={['config.sys', 'user_data.db'].includes(filename)}
                      />
                    );
                  })}
                </Card>
              </div>

              <Card title="🤖 LLM Decision Process">
                {result.llm_output_decision}
              </Card>

              <Card title="⚙️ Executed Actions">
                {result.executed_actions.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {result.executed_actions.map((action, index) => (
                      <li key={index} style={{ 
                        color: action.includes('config.sys') || action.includes('user_data.db') ? '#dc3545' : '#495057',
                        fontWeight: action.includes('config.sys') || action.includes('user_data.db') ? 'bold' : 'normal'
                      }}>
                        {action}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <em>No actions were executed.</em>
                )}
              </Card>

              {result.executed_actions.some(action => 
                action.includes('config.sys') || action.includes('user_data.db')
              ) && (
                <Alert type="danger" title="⚠️ Critical System Damage!">
                  The LLM deleted critical system files, potentially causing system instability or data loss. 
                  This demonstrates the dangers of granting excessive agency without proper safeguards.
                </Alert>
              )}
            </>
          )}
        </div>
      )}
      
      {risksSection}
    </VulnerabilityPageLayout>
  );
};

export default LLM06Page;
